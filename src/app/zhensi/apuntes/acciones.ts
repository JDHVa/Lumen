"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  firmarSubida,
  borrarArchivo,
  esUrlPublicaValida,
  extensionDe,
  TIPOS_APUNTE,
} from "@/lib/almacenamiento";

export type EstadoApunte = { error?: string; exito?: string };

const EXTENSIONES_APUNTE = new Set(Object.values(TIPOS_APUNTE));

export type UrlSubida =
  | { ok: true; url_subida: string; url_publica: string }
  | { ok: false; error: string };

export async function pedirUrlDeSubida(tipo: string): Promise<UrlSubida> {
  const sesion = await auth();
  if (!sesion?.user) return { ok: false, error: "Tu sesión se cerró. Vuelve a entrar." };
  if (!sesion.user.es_zhensi) {
    return { ok: false, error: "Solo los zhenshis pueden subir apuntes." };
  }

  const extension = TIPOS_APUNTE[tipo];
  if (!extension) {
    return {
      ok: false,
      error: "Ese tipo de archivo no se acepta. Revisa la lista de abajo.",
    };
  }

  const firma = await firmarSubida("apuntes", extension);
  if (!firma.ok) return { ok: false, error: firma.error };

  return {
    ok: true,
    url_subida: firma.url_subida,
    url_publica: firma.url_publica,
  };
}

export async function subirApunte(
  _estado: EstadoApunte,
  datos: FormData,
): Promise<EstadoApunte> {
  const sesion = await auth();
  if (!sesion?.user) return { error: "Tu sesión se cerró. Vuelve a entrar." };
  if (!sesion.user.es_zhensi) {
    return { error: "Solo los zhenshis pueden subir apuntes." };
  }

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

  const archivo_url = String(datos.get("archivo_url") ?? "");
  if (!archivo_url) return { error: "Falta el archivo." };
  if (!esUrlPublicaValida(archivo_url, "apuntes")) {
    return { error: "El archivo no se subió bien. Vuelve a intentarlo." };
  }
  if (!EXTENSIONES_APUNTE.has(extensionDe(archivo_url))) {
    return { error: "Ese tipo de archivo no se acepta. Revisa la lista de abajo." };
  }

  try {
    await db.apunte.create({
      data: {
        titulo,
        materia_id,
        zhensi_id: sesion.user.id,
        generacion: generacion || null,
        archivo_url,
      },
    });
  } catch {
    await borrarArchivo(archivo_url);
    return { error: "No se pudo guardar el apunte. Vuelve a intentarlo." };
  }

  revalidatePath("/zhensi/apuntes");
  revalidatePath("/admin/apuntes");

  return { exito: "Ya quedó publicado. Cualquiera puede bajarlo." };
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
