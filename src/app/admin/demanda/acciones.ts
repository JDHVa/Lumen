"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leerClaveBloque, nombreDia } from "@/lib/horarios";
import { aFecha, comoTexto, diaSemanaDe, fechaLegible } from "@/lib/fechas";

export type EstadoAgenda = {
  error?: string;
  advertencia?: string;
};

const TOPE_DIAS = 8;

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
  const salon = String(datos.get("salon") ?? "").trim();
  const titulo = String(datos.get("titulo") ?? "").trim();
  const notas = String(datos.get("notas_publicas") ?? "").trim();
  const confirmado = datos.get("confirmar") === "1";

  if (!solicitud_id || !zhensi_id) {
    return { error: "Falta elegir a quién se le asigna." };
  }

  if (!titulo) return { error: "Ponle un título a la sesión." };
  if (!salon) return { error: "Falta el salón." };

  const claves = datos.getAll("bloque").map((valor) => String(valor));
  const fechasCrudas = datos.getAll("fecha").map((valor) => String(valor));

  if (claves.length === 0) {
    return { error: "Marca al menos un día." };
  }

  if (claves.length !== fechasCrudas.length) {
    return { error: "Falta ponerle fecha a alguno de los días." };
  }

  if (claves.length > TOPE_DIAS) {
    return {
      error: `Son demasiados días de una sola vez. El tope son ${TOPE_DIAS}.`,
    };
  }

  const dias: { inicio: string; fin: string; fecha: Date }[] = [];

  for (let indice = 0; indice < claves.length; indice += 1) {
    const bloque = leerClaveBloque(claves[indice]);
    if (!bloque) return { error: "Uno de los horarios ya no es válido." };

    const fecha = aFecha(fechasCrudas[indice]);
    if (!fecha) return { error: "Una de las fechas no es válida." };

    if (diaSemanaDe(fecha) !== bloque.dia) {
      return {
        error: `El horario de ${nombreDia(bloque.dia).toLowerCase()} no cuadra con la fecha ${fechaLegible(fecha)} que le pusiste.`,
      };
    }

    dias.push({ inicio: bloque.inicio, fin: bloque.fin, fecha });
  }

  const repetidos = new Set(
    dias.map((dia) => `${comoTexto(dia.fecha)}|${dia.inicio}`),
  );
  if (repetidos.size !== dias.length) {
    return { error: "Hay dos días con la misma fecha y la misma hora." };
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
    const choques: string[] = [];

    for (const dia of dias) {
      const traslape = await db.sesion.findFirst({
        where: {
          zhensi_id,
          fecha: dia.fecha,
          estado: { in: ["borrador", "publicada", "realizada"] },
          hora_inicio: { lt: dia.fin },
          hora_fin: { gt: dia.inicio },
        },
        select: { titulo: true, hora_inicio: true, hora_fin: true },
      });

      if (traslape) {
        choques.push(
          `el ${fechaLegible(dia.fecha)} ya tiene "${traslape.titulo}" de ${traslape.hora_inicio} a ${traslape.hora_fin}`,
        );
      }
    }

    if (choques.length > 0) {
      return {
        advertencia: `A ${zhensi.nombre} se le encima: ${choques.join("; ")}.`,
      };
    }
  }

  await db.$transaction(async (tx) => {
    await tx.sesion.createMany({
      data: dias.map((dia) => ({
        solicitud_id,
        zhensi_id,
        materia_id: solicitud.materia_id,
        titulo,
        fecha: dia.fecha,
        hora_inicio: dia.inicio,
        hora_fin: dia.fin,
        salon,
        estado: "publicada" as const,
        creada_por: sesion.user.id,
        notas_publicas: notas || null,
      })),
    });

    await tx.solicitud.update({
      where: { id: solicitud_id },
      data: { estado: "agendada" },
    });
  });

  revalidatePath("/admin/demanda");
  revalidatePath("/admin/sesiones");
  revalidatePath("/solicitudes");
  revalidatePath("/");

  redirect("/admin/sesiones");
}
