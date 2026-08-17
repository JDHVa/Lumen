"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { estaBloqueado, anotarIntento, ESPERA_MINUTOS } from "@/lib/intentos";

export type EstadoEntrada = { error?: string };

function destinoSeguro(crudo: string) {
  if (!crudo.startsWith("/")) return "/zhensi";
  if (crudo.startsWith("//")) return "/zhensi";
  if (crudo.includes("\\")) return "/zhensi";
  return crudo;
}

export async function entrar(
  _estado: EstadoEntrada,
  datos: FormData,
): Promise<EstadoEntrada> {
  const usuario = String(datos.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const contrasena = String(datos.get("contrasena") ?? "");
  const regresar = destinoSeguro(String(datos.get("regresar") ?? ""));

  if (!usuario || !contrasena) {
    return { error: "Escribe tu usuario y tu contraseña." };
  }

  if (await estaBloqueado(usuario)) {
    return {
      error: `Demasiados intentos fallidos. Espera ${ESPERA_MINUTOS} minutos antes de volver a intentar.`,
    };
  }

  try {
    await signIn("credentials", {
      usuario,
      contrasena,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      await anotarIntento(usuario, false);
      return { error: "Usuario o contraseña incorrectos." };
    }
    throw error;
  }

  await anotarIntento(usuario, true);

  redirect(regresar);
}
