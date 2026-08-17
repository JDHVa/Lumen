"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ESTADOS = ["nuevo", "en_revision", "atendido"] as const;
type EstadoMensaje = (typeof ESTADOS)[number];

export async function cambiarEstadoMensaje(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  const destino = String(datos.get("estado") ?? "");

  if (!id) return;
  if (!ESTADOS.includes(destino as EstadoMensaje)) return;

  const mensaje = await db.mensaje_buzon.findUnique({ where: { id } });
  if (!mensaje) return;

  await db.mensaje_buzon.update({
    where: { id },
    data: {
      estado: destino as EstadoMensaje,
      atendido_por: destino === "nuevo" ? null : sesion.user.id,
    },
  });

  revalidatePath("/admin/buzon");
  revalidatePath("/admin/dashboard");
}
