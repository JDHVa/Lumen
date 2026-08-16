"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type EstadoEntrada = { error?: string };

export async function entrar(
  _estado: EstadoEntrada,
  datos: FormData,
): Promise<EstadoEntrada> {
  const usuario = String(datos.get("usuario") ?? "").trim();
  const contrasena = String(datos.get("contrasena") ?? "");
  const regresar = String(datos.get("regresar") ?? "");

  if (!usuario || !contrasena) {
    return { error: "Escribe tu usuario y tu contraseña." };
  }

  try {
    await signIn("credentials", {
      usuario,
      contrasena,
      redirectTo: regresar || "/zhensi",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    throw error;
  }
}
