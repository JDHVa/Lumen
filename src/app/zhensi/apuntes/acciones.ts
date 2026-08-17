"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  subirArchivo,
  borrarArchivo,
  TIPOS_APUNTE,
  LIMITE_APUNTE,
} from "@/lib/almacenamiento";

export type EstadoApunte = { error?: string; exito?: string };

export async function subirApunte(
  _estado: EstadoApunte,
  datos: FormData,
): Promise<EstadoApunte> {
  const sesion = await auth();
  if (!sesion?.user) return { error: "Tu sesión se cerró. Vuelve a entrar." };

  const titulo = String(datos.get("titulo") ?? "").trim();
  if (titulo.length < 4) {
    return { error: "Ponle un título que se entienda." };
  }
  if (titulo.length > 140) {
    return { error: "El título quedó demasiado largo." };
  }

  const materia_id = String(datos.get("materia_id") ?? "");
  if (!materia_id) return { error: "Elige de qué materia es." };

  const materia = await db.materia.findUnique({ where: { id: materia_id } });
  if (!materia || !materia.activa) {
    return { error: "Esa materia ya no está disponible." };
  }

  const generacion = String(datos.get("generacion") ?? "").trim();
  if (generacion && !/^[0-9]{4}(-[0-9]{4})?$/.test(generacion)) {
    return { error: "La generación va como 2024 o como 2023-2024." };
  }

  const archivo = datos.get("archivo");
  if (!(archivo instanceof File)) {
    return { error: "Falta el archivo." };
  }

  const subida = await subirArchivo(
    archivo,
    "apuntes",
    TIPOS_APUNTE,
    LIMITE_APUNTE,
  );

  if (!subida.ok) return { error: subida.error };

  try {
    await db.apunte.create({
      data: {
        titulo,
        materia_id,
        zhensi_id: sesion.user.id,
        generacion: generacion || null,
        archivo_url: subida.url,
      },
    });
  } catch {
    await borrarArchivo(subida.url);
    return { error: "No se pudo guardar el apunte. Vuelve a intentarlo." };
  }

  revalidatePath("/zhensi/apuntes");
  revalidatePath("/admin/apuntes");

  return {
    exito:
      "Ya se subió. Un admin lo tiene que aprobar antes de que se vea en el sitio.",
  };
}

export async function borrarApunte(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const apunte = await db.apunte.findUnique({ where: { id } });
  if (!apunte) return;

  const esSuyo = apunte.zhensi_id === sesion.user.id;
  if (!esSuyo && !sesion.user.es_admin) return;

  await db.apunte.delete({ where: { id } });
  await borrarArchivo(apunte.archivo_url);

  revalidatePath("/zhensi/apuntes");
  revalidatePath("/admin/apuntes");
  revalidatePath("/apuntes");
}
