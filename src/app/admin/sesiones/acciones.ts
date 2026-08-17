"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leerClaveBloque } from "@/lib/horarios";
import { aFecha, diaSemanaDe } from "@/lib/fechas";

export type EstadoSesion = { error?: string; exito?: string };

function refrescar() {
  revalidatePath("/admin/sesiones");
  revalidatePath("/admin/demanda");
  revalidatePath("/zhensi/sesiones");
  revalidatePath("/solicitudes");
  revalidatePath("/");
}

export async function cambiarEstadoSesion(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  const destino = String(datos.get("estado") ?? "");

  if (!id) return;
  if (destino !== "publicada" && destino !== "cancelada") return;

  const encontrada = await db.sesion.findUnique({
    where: { id },
    select: { id: true, solicitud: { select: { id: true } } },
  });
  if (!encontrada) return;

  await db.$transaction(async (tx) => {
    await tx.sesion.update({ where: { id }, data: { estado: destino } });

    if (encontrada.solicitud) {
      await tx.solicitud.update({
        where: { id: encontrada.solicitud.id },
        data: {
          estado: destino === "cancelada" ? "abierta" : "agendada",
          sesion_id: destino === "cancelada" ? null : id,
        },
      });
    }
  });

  refrescar();
}

export async function capturarAsistencia(
  _estado: EstadoSesion,
  datos: FormData,
): Promise<EstadoSesion> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const id = String(datos.get("id") ?? "");
  const crudo = String(datos.get("cantidad") ?? "").trim();

  if (!id) return { error: "Falta la sesión." };
  if (crudo === "") return { error: "Escribe cuánta gente llegó." };

  const cantidad = Number(crudo);
  if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > 500) {
    return { error: "La cantidad debe ser un número entero de 0 a 500." };
  }

  const encontrada = await db.sesion.findUnique({
    where: { id },
    select: { id: true, fecha: true, estado: true },
  });
  if (!encontrada) return { error: "Esa sesión ya no existe." };

  if (encontrada.estado === "cancelada") {
    return { error: "Esa sesión está cancelada. No se le captura asistencia." };
  }

  const hoy = new Date();
  const corte = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
  );
  if (encontrada.fecha > corte) {
    return { error: "Esa sesión todavía no pasa." };
  }

  await db.$transaction([
    db.asistencia.upsert({
      where: { sesion_id: id },
      create: { sesion_id: id, cantidad, capturada_por: sesion.user.id },
      update: { cantidad, capturada_por: sesion.user.id },
    }),
    db.sesion.update({ where: { id }, data: { estado: "realizada" } }),
  ]);

  refrescar();
  revalidatePath("/admin/dashboard");

  return {
    exito:
      cantidad === 0
        ? "Quedó registrada como realizada, sin asistentes."
        : `Quedaron registrados ${cantidad} asistentes.`,
  };
}

export async function crearSesionSuelta(
  _estado: EstadoSesion,
  datos: FormData,
): Promise<EstadoSesion> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const zhensi_id = String(datos.get("zhensi_id") ?? "");
  const titulo = String(datos.get("titulo") ?? "").trim();
  const salon = String(datos.get("salon") ?? "").trim();
  const clave = String(datos.get("bloque") ?? "");
  const fechaCruda = String(datos.get("fecha") ?? "");

  if (!zhensi_id) return { error: "Elige quién la da." };
  if (!titulo) return { error: "Ponle un título a la sesión." };
  if (!salon) return { error: "Falta el salón." };

  const bloque = leerClaveBloque(clave);
  if (!bloque) return { error: "Ese horario no es válido." };

  const fecha = aFecha(fechaCruda);
  if (!fecha) return { error: "La fecha no es válida." };

  if (diaSemanaDe(fecha) !== bloque.dia) {
    return {
      error: "La fecha que pusiste no cae en el día del horario que elegiste.",
    };
  }

  const zhensi = await db.usuario.findUnique({ where: { id: zhensi_id } });
  if (!zhensi || !zhensi.es_zhensi || !zhensi.activo) {
    return { error: "Esa cuenta no puede dar sesiones." };
  }

  await db.sesion.create({
    data: {
      zhensi_id,
      titulo,
      fecha,
      hora_inicio: bloque.inicio,
      hora_fin: bloque.fin,
      salon,
      estado: "publicada",
      creada_por: sesion.user.id,
    },
  });

  refrescar();

  return { exito: `Sesión creada para ${zhensi.nombre}.` };
}
