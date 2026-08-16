"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function alternarActivo(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const cuenta = await db.usuario.findUnique({ where: { id } });
  if (!cuenta) return;

  if (cuenta.id === sesion.user.id) return;

  await db.usuario.update({
    where: { id },
    data: { activo: !cuenta.activo },
  });

  revalidatePath("/admin/zhensis");
  revalidatePath("/admin/usuarios");
}
