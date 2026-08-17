"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type EstadoClave = { error?: string; exito?: string };

export async function cambiarMiContrasena(
  _estado: EstadoClave,
  datos: FormData,
): Promise<EstadoClave> {
  const sesion = await auth();
  if (!sesion?.user) return { error: "Tu sesión se cerró. Vuelve a entrar." };

  const actual = String(datos.get("actual") ?? "");
  const nueva = String(datos.get("nueva") ?? "");
  const repetida = String(datos.get("repetida") ?? "");

  if (!actual || !nueva) {
    return { error: "Llena los tres campos." };
  }

  if (nueva.length < 8) {
    return { error: "La contraseña nueva debe tener al menos 8 caracteres." };
  }

  if (nueva !== repetida) {
    return { error: "Las dos contraseñas nuevas no son iguales." };
  }

  if (nueva === actual) {
    return { error: "La nueva tiene que ser distinta de la que ya tenías." };
  }

  const cuenta = await db.usuario.findUnique({
    where: { id: sesion.user.id },
    select: { id: true, contrasena_hash: true },
  });

  if (!cuenta) return { error: "Tu cuenta ya no existe." };

  const correcta = await bcrypt.compare(actual, cuenta.contrasena_hash);
  if (!correcta) {
    return { error: "Tu contraseña de ahorita no es esa." };
  }

  await db.usuario.update({
    where: { id: cuenta.id },
    data: { contrasena_hash: await bcrypt.hash(nueva, 12) },
  });

  return {
    exito:
      "Listo, ya quedó. La vas a necesitar la próxima vez que entres, así que no la olvides.",
  };
}
