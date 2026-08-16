"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leerClaveBloque } from "@/lib/horarios";

export type EstadoDisponibilidad = { error?: string; exito?: string };

export async function guardarDisponibilidad(
  _estado: EstadoDisponibilidad,
  datos: FormData,
): Promise<EstadoDisponibilidad> {
  const sesion = await auth();
  if (!sesion?.user) return { error: "Tu sesión se cerró. Vuelve a entrar." };

  const bloques = datos
    .getAll("bloque")
    .map((valor) => leerClaveBloque(String(valor)))
    .filter((bloque) => bloque !== null);

  const usuario_id = sesion.user.id;

  await db.$transaction([
    db.disponibilidad.deleteMany({ where: { usuario_id } }),
    db.disponibilidad.createMany({
      data: bloques.map((bloque) => ({
        usuario_id,
        dia_semana: bloque.dia,
        hora_inicio: bloque.inicio,
        hora_fin: bloque.fin,
      })),
    }),
  ]);

  revalidatePath("/zhensi/disponibilidad");

  if (bloques.length === 0) {
    return { exito: "Se guardó. Ahora mismo no tienes ningún horario marcado." };
  }

  return {
    exito:
      bloques.length === 1
        ? "Guardado. Tienes 1 bloque disponible cada semana."
        : `Guardado. Tienes ${bloques.length} bloques disponibles cada semana.`,
  };
}
