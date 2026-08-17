"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { revisarTope, registrarEnvio } from "@/lib/huella";

export type EstadoBuzon = { error?: string; enviado?: boolean };

const CATEGORIAS = ["sugerencia", "agradecimiento", "apoyo"] as const;
type Categoria = (typeof CATEGORIAS)[number];

export async function enviarMensaje(
  _estado: EstadoBuzon,
  datos: FormData,
): Promise<EstadoBuzon> {
  const tope = await revisarTope();
  if (!tope.permitido) {
    return {
      error:
        "Ya mandaste varios mensajes en la última hora. Espera un rato antes de mandar otro.",
    };
  }

  const categoria = String(datos.get("categoria") ?? "");
  if (!CATEGORIAS.includes(categoria as Categoria)) {
    return { error: "Elige de qué se trata tu mensaje." };
  }

  const contenido = String(datos.get("contenido") ?? "").trim();
  if (contenido.length < 5) {
    return { error: "Escribe un poco más para que se entienda." };
  }
  if (contenido.length > 2000) {
    return { error: "El mensaje quedó demasiado largo." };
  }

  const nombre = String(datos.get("nombre_opcional") ?? "").trim();
  if (nombre.length > 80) {
    return { error: "Ese nombre es demasiado largo." };
  }

  await db.mensaje_buzon.create({
    data: {
      categoria: categoria as Categoria,
      contenido,
      nombre_opcional: nombre || null,
      prioritario: categoria === "apoyo",
    },
  });

  await registrarEnvio(tope.recientes);

  revalidatePath("/admin/buzon");
  revalidatePath("/admin/dashboard");

  return { enviado: true };
}
