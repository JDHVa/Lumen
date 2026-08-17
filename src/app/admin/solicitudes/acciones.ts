"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const PERMITIDOS = ["abierta", "cerrada", "oculta"] as const;

type EstadoPermitido = (typeof PERMITIDOS)[number];

export async function cambiarEstado(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  const destino = String(datos.get("estado") ?? "");

  if (!id) return;
  if (!PERMITIDOS.includes(destino as EstadoPermitido)) return;

  const solicitud = await db.solicitud.findUnique({ where: { id } });
  if (!solicitud) return;

  if (solicitud.estado === "agendada") return;

  await db.solicitud.update({
    where: { id },
    data: { estado: destino as EstadoPermitido },
  });

  revalidatePath("/admin/solicitudes");
  revalidatePath("/solicitudes");
}
