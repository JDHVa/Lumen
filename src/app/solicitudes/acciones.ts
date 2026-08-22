"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { asegurarHuella } from "@/lib/huella";

export async function apoyar(datos: FormData) {
  const solicitud_id = String(datos.get("solicitud_id") ?? "");
  if (!solicitud_id) return;

  const solicitud = await db.solicitud.findUnique({
    where: { id: solicitud_id },
    select: { id: true, estado: true },
  });

  if (!solicitud || solicitud.estado !== "abierta") return;

  const huella = await asegurarHuella();

  const yaApoyo = await db.apoyo_solicitud.findUnique({
    where: { solicitud_id_huella: { solicitud_id, huella } },
  });

  if (yaApoyo) return;

  await db.$transaction([
    db.apoyo_solicitud.create({ data: { solicitud_id, huella } }),
    db.solicitud.update({
      where: { id: solicitud_id },
      data: { apoyos: { increment: 1 } },
    }),
  ]);

  revalidatePath("/solicitudes");
}

export type EstadoReporte = {
  error?: string;
  exito?: string;
};

export async function reportarError(
  _estado: EstadoReporte,
  datos: FormData,
): Promise<EstadoReporte> {
  const solicitud_id = String(datos.get("solicitud_id") ?? "");
  if (!solicitud_id) return { error: "No encontramos esa solicitud." };

  const solicitud = await db.solicitud.findUnique({
    where: { id: solicitud_id },
    select: { id: true, estado: true },
  });

  if (!solicitud) return { error: "Esa solicitud ya no existe." };

  if (solicitud.estado === "agendada") {
    return {
      error:
        "Esta solicitud ya tiene sesión agendada. Escríbenos por el buzón para avisar del error.",
    };
  }

  const huella = await asegurarHuella();

  const yaReporto = await db.reporte_error_solicitud.findUnique({
    where: { solicitud_id_huella: { solicitud_id, huella } },
  });

  if (yaReporto) {
    return { exito: "Ya nos habías avisado. Alguien la va a revisar." };
  }

  await db.$transaction([
    db.reporte_error_solicitud.create({ data: { solicitud_id, huella } }),
    db.solicitud.update({
      where: { id: solicitud_id },
      data: {
        reportes_error: { increment: 1 },
        reportada_en: new Date(),
      },
    }),
  ]);

  revalidatePath("/solicitudes");
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");

  return {
    exito:
      "Listo, ya avisamos. Alguien de Lumen la va a revisar y decidir qué hacer con ella.",
  };
}

export type EstadoRespuesta = {
  error?: string;
  exito?: string;
};

const LARGO_RESPUESTA = 500;

export async function responder(
  _estado: EstadoRespuesta,
  datos: FormData,
): Promise<EstadoRespuesta> {
  const pregunta_id = String(datos.get("pregunta_id") ?? "");
  if (!pregunta_id) return { error: "No encontramos esa pregunta." };

  const texto = String(datos.get("texto") ?? "").trim();
  if (texto.length < 2) {
    return { error: "Escribe tu respuesta antes de mandarla." };
  }
  if (texto.length > LARGO_RESPUESTA) {
    return { error: "La respuesta quedó demasiado larga." };
  }

  const pregunta = await db.pregunta_solicitud.findUnique({
    where: { id: pregunta_id },
    select: { id: true, solicitud: { select: { estado: true, archivada: true } } },
  });

  if (!pregunta) return { error: "Esa pregunta ya no existe." };

  if (pregunta.solicitud.estado !== "abierta" || pregunta.solicitud.archivada) {
    return { error: "Esta solicitud ya se cerró, así que ya no se contesta." };
  }

  const huella = await asegurarHuella();

  const yaRespondio = await db.respuesta_pregunta.findUnique({
    where: { pregunta_id_huella: { pregunta_id, huella } },
  });

  if (yaRespondio) {
    return { error: "Ya habías contestado esta pregunta." };
  }

  await db.respuesta_pregunta.create({
    data: { pregunta_id, texto, huella },
  });

  revalidatePath("/solicitudes");
  revalidatePath("/zhensi/solicitudes");
  revalidatePath("/admin/demanda");

  return { exito: "Gracias, tu respuesta ya se ve en la solicitud." };
}
