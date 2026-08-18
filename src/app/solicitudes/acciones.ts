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

  return { exito: "Listo, ya avisamos. Alguien la va a revisar y quitar." };
}
