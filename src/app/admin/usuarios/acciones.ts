"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type EstadoAlta = { error?: string; exito?: string };

export async function crearUsuario(
  _estado: EstadoAlta,
  datos: FormData,
): Promise<EstadoAlta> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const nombre = String(datos.get("nombre") ?? "").trim();
  const usuario = String(datos.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const contrasena = String(datos.get("contrasena") ?? "");
  const esZhensi = datos.get("es_zhensi") === "on";
  const esAdmin = datos.get("es_admin") === "on";

  if (!nombre || !usuario || !contrasena) {
    return { error: "Nombre, usuario y contraseña son obligatorios." };
  }

  if (!/^[a-z0-9._-]{3,30}$/.test(usuario)) {
    return {
      error:
        "El usuario debe tener entre 3 y 30 caracteres, solo letras, números, punto, guion o guion bajo.",
    };
  }

  if (contrasena.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (!esZhensi && !esAdmin) {
    return { error: "Marca al menos un rol: zhensi, admin o los dos." };
  }

  const repetido = await db.usuario.findUnique({ where: { usuario } });
  if (repetido) {
    return { error: "Ese usuario ya existe. Elige otro." };
  }

  await db.usuario.create({
    data: {
      nombre,
      usuario,
      contrasena_hash: await bcrypt.hash(contrasena, 12),
      es_zhensi: esZhensi,
      es_admin: esAdmin,
    },
  });

  revalidatePath("/admin/usuarios");

  return { exito: `Cuenta creada para ${nombre}.` };
}
