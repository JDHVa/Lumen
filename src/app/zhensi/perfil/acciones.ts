"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  subirArchivo,
  borrarArchivo,
  TIPOS_FOTO,
  LIMITE_FOTO,
} from "@/lib/almacenamiento";
import { REDES, normalizarRed } from "@/lib/redes";

export type EstadoPerfil = { error?: string; exito?: string };

export async function guardarPerfil(
  _estado: EstadoPerfil,
  datos: FormData,
): Promise<EstadoPerfil> {
  const sesion = await auth();
  if (!sesion?.user) return { error: "Tu sesión se cerró. Vuelve a entrar." };

  const usuario_id = String(datos.get("usuario_id") ?? "");
  const esSuyo = usuario_id === sesion.user.id;

  if (!usuario_id || (!esSuyo && !sesion.user.es_admin)) {
    return { error: "No tienes permiso para editar ese perfil." };
  }

  const duenio = await db.usuario.findUnique({ where: { id: usuario_id } });
  if (!duenio || !duenio.es_zhensi) {
    return { error: "Esa cuenta no es de un zhenshi." };
  }

  const guardado = await db.perfil_zhensi.findUnique({
    where: { usuario_id },
    select: { foto_url: true, carrera_id: true },
  });

  const llegoCarrera = datos.has("carrera_id");
  const carreraCruda = String(datos.get("carrera_id") ?? "").trim();

  const carrera_id = !llegoCarrera
    ? (guardado?.carrera_id ?? null)
    : carreraCruda === ""
      ? null
      : carreraCruda;

  if (carrera_id) {
    const existe = await db.carrera.findUnique({ where: { id: carrera_id } });
    if (!existe) return { error: "Esa carrera ya no existe." };
  }

  const semestreCrudo = String(datos.get("semestre") ?? "").trim();
  let semestre: number | null = null;
  if (semestreCrudo) {
    const numero = Number(semestreCrudo);
    if (!Number.isInteger(numero) || numero < 1 || numero > 12) {
      return { error: "El semestre debe ser un número del 1 al 12." };
    }
    semestre = numero;
  }

  const descripcion = String(datos.get("descripcion_corta") ?? "").trim();
  if (descripcion.length > 200) {
    return { error: "La descripción no puede pasar de 200 caracteres." };
  }

  const visible_publico = datos.get("visible_publico") === "on";

  let foto_url = guardado?.foto_url ?? null;

  if (datos.get("quitar_foto") === "on") {
    if (foto_url) await borrarArchivo(foto_url);
    foto_url = null;
  }

  const foto = datos.get("foto");
  if (foto instanceof File && foto.size > 0) {
    const subida = await subirArchivo(foto, "fotos", TIPOS_FOTO, LIMITE_FOTO);
    if (!subida.ok) return { error: subida.error };
    if (foto_url) await borrarArchivo(foto_url);
    foto_url = subida.url;
  }

  const redes: Record<string, string | null> = {};
  for (const red of REDES) {
    const resultado = normalizarRed(
      red.clave,
      String(datos.get(red.clave) ?? ""),
    );
    if (!resultado.ok) {
      return { error: `${red.nombre}: ${resultado.error}` };
    }
    redes[red.clave] = resultado.valor;
  }

  const elegidas = datos.getAll("materia").map((valor) => String(valor));

  const validas =
    elegidas.length === 0
      ? []
      : await db.materia.findMany({
          where: { id: { in: elegidas }, activa: true },
          select: { id: true },
        });

  if (visible_publico && validas.length === 0) {
    return {
      error:
        "Para aparecer en la galería pública hay que marcar al menos una materia.",
    };
  }

  await db.$transaction([
    db.perfil_zhensi.upsert({
      where: { usuario_id },
      create: {
        usuario_id,
        carrera_id,
        semestre,
        descripcion_corta: descripcion || null,
        visible_publico,
        foto_url,
        ...redes,
      },
      update: {
        carrera_id,
        semestre,
        descripcion_corta: descripcion || null,
        visible_publico,
        foto_url,
        ...redes,
      },
    }),
    db.zhensi_materia.deleteMany({ where: { usuario_id } }),
    db.zhensi_materia.createMany({
      data: validas.map((materia) => ({
        usuario_id,
        materia_id: materia.id,
      })),
    }),
  ]);

  revalidatePath("/zhensi/perfil");
  revalidatePath("/admin/zhensis");
  revalidatePath(`/admin/zhensis/${usuario_id}`);
  revalidatePath("/zhensis");

  const cuantas =
    validas.length === 1 ? "1 materia" : `${validas.length} materias`;

  return { exito: `Perfil guardado con ${cuantas}.` };
}
