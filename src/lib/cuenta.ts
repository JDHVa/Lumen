import { db } from "./db";

export async function nombreActual(usuarioId: string, respaldo: string) {
  const cuenta = await db.usuario.findUnique({
    where: { id: usuarioId },
    select: { nombre: true },
  });

  return cuenta?.nombre ?? respaldo;
}
