"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leerClaveBloque } from "@/lib/horarios";
import { aFecha, diaSemanaDe, fechaLegible } from "@/lib/fechas";

export type EstadoAgenda = {
  error?: string;
  advertencia?: string;
};

export async function agendar(
  _estado: EstadoAgenda,
  datos: FormData,
): Promise<EstadoAgenda> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const solicitud_id = String(datos.get("solicitud_id") ?? "");
  const zhensi_id = String(datos.get("zhensi_id") ?? "");
  const clave = String(datos.get("bloque") ?? "");
  const fechaCruda = String(datos.get("fecha") ?? "");
  const salon = String(datos.get("salon") ?? "").trim();
  const titulo = String(datos.get("titulo") ?? "").trim();
  const notas = String(datos.get("notas_publicas") ?? "").trim();
  const confirmado = datos.get("confirmar") === "1";

  if (!solicitud_id || !zhensi_id) {
    return { error: "Falta elegir a quién se le asigna." };
  }

  if (!titulo) return { error: "Ponle un título a la sesión." };
  if (!salon) return { error: "Falta el salón." };

  const bloque = leerClaveBloque(clave);
  if (!bloque) return { error: "Ese horario ya no es válido. Elige otro." };

  const fecha = aFecha(fechaCruda);
  if (!fecha) return { error: "La fecha no es válida." };

  if (diaSemanaDe(fecha) !== bloque.dia) {
    return {
      error: `El horario que elegiste es de ${["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"][bloque.dia]}, pero la fecha que pusiste cae en ${fechaLegible(fecha).toLowerCase()}.`,
    };
  }

  const solicitud = await db.solicitud.findUnique({
    where: { id: solicitud_id },
    select: { id: true, estado: true, materia_id: true },
  });

  if (!solicitud) return { error: "Esa solicitud ya no existe." };
  if (solicitud.estado === "agendada") {
    return { error: "Esa solicitud ya tiene sesión asignada." };
  }

  const zhensi = await db.usuario.findUnique({ where: { id: zhensi_id } });
  if (!zhensi || !zhensi.es_zhensi || !zhensi.activo) {
    return { error: "Esa cuenta no puede dar sesiones." };
  }

  if (!confirmado) {
    const traslape = await db.sesion.findFirst({
      where: {
        zhensi_id,
        fecha,
        estado: { in: ["borrador", "publicada", "realizada"] },
        hora_inicio: { lt: bloque.fin },
        hora_fin: { gt: bloque.inicio },
      },
      select: { titulo: true, hora_inicio: true, hora_fin: true },
    });

    if (traslape) {
      return {
        advertencia: `${zhensi.nombre} ya tiene "${traslape.titulo}" ese día de ${traslape.hora_inicio} a ${traslape.hora_fin}. Se encima con lo que estás agendando.`,
      };
    }
  }

  await db.$transaction(async (tx) => {
    const creada = await tx.sesion.create({
      data: {
        zhensi_id,
        materia_id: solicitud.materia_id,
        titulo,
        fecha,
        hora_inicio: bloque.inicio,
        hora_fin: bloque.fin,
        salon,
        estado: "publicada",
        creada_por: sesion.user.id,
        notas_publicas: notas || null,
      },
    });

    await tx.solicitud.update({
      where: { id: solicitud_id },
      data: { estado: "agendada", sesion_id: creada.id },
    });
  });

  revalidatePath("/admin/demanda");
  revalidatePath("/admin/sesiones");
  revalidatePath("/solicitudes");
  revalidatePath("/");

  redirect("/admin/sesiones");
}
