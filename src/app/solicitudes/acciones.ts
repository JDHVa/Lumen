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
