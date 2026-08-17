"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type EstadoCatalogo = { error?: string; exito?: string };

const RUTA = "/admin/catalogo";

async function exigirAdmin() {
  const sesion = await auth();
  return Boolean(sesion?.user.es_admin);
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function leerSemestre(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  const numero = Number(texto);
  if (!Number.isInteger(numero) || numero < 1 || numero > 12) return undefined;
  return numero;
}

export async function crearCarrera(
  _estado: EstadoCatalogo,
  datos: FormData,
): Promise<EstadoCatalogo> {
  if (!(await exigirAdmin())) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const nombre = String(datos.get("nombre") ?? "").trim();
  const clave = String(datos.get("clave") ?? "")
    .trim()
    .toUpperCase();

  if (!nombre || !clave) {
    return { error: "El nombre y la clave son obligatorios." };
  }

  if (!/^[A-Z0-9-]{2,10}$/.test(clave)) {
    return {
      error:
        "La clave debe tener entre 2 y 10 caracteres: letras, números o guion.",
    };
  }

  const repetida = await db.carrera.findUnique({ where: { clave } });
  if (repetida) {
    return { error: `La clave ${clave} ya la usa ${repetida.nombre}.` };
  }

  await db.carrera.create({ data: { nombre, clave } });
  revalidatePath(RUTA);

  return { exito: `Carrera ${nombre} agregada.` };
}

export async function editarCarrera(
  _estado: EstadoCatalogo,
  datos: FormData,
): Promise<EstadoCatalogo> {
  if (!(await exigirAdmin())) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const id = String(datos.get("id") ?? "");
  const nombre = String(datos.get("nombre") ?? "").trim();
  const clave = String(datos.get("clave") ?? "")
    .trim()
    .toUpperCase();

  if (!id || !nombre || !clave) {
    return { error: "El nombre y la clave son obligatorios." };
  }

  if (!/^[A-Z0-9-]{2,10}$/.test(clave)) {
    return {
      error:
        "La clave debe tener entre 2 y 10 caracteres: letras, números o guion.",
    };
  }

  const repetida = await db.carrera.findUnique({ where: { clave } });
  if (repetida && repetida.id !== id) {
    return { error: `La clave ${clave} ya la usa ${repetida.nombre}.` };
  }

  await db.carrera.update({ where: { id }, data: { nombre, clave } });
  revalidatePath(RUTA);

  return { exito: `Carrera actualizada.` };
}

export async function crearMaterias(
  _estado: EstadoCatalogo,
  datos: FormData,
): Promise<EstadoCatalogo> {
  if (!(await exigirAdmin())) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const carreraCruda = String(datos.get("carrera_id") ?? "");
  const carrera_id = carreraCruda === "tronco" ? null : carreraCruda;

  const semestre = leerSemestre(datos.get("semestre"));
  if (semestre === undefined) {
    return { error: "El semestre debe ser un número del 1 al 12." };
  }

  if (carrera_id) {
    const existe = await db.carrera.findUnique({ where: { id: carrera_id } });
    if (!existe) return { error: "Esa carrera ya no existe." };
  }

  const nombres = String(datos.get("nombres") ?? "")
    .split("\n")
    .map((renglon) => renglon.trim())
    .filter(Boolean);

  if (nombres.length === 0) {
    return { error: "Escribe al menos una materia." };
  }

  const unicos: string[] = [];
  const repetidosEnLote: string[] = [];
  for (const nombre of nombres) {
    const yaEsta = unicos.some(
      (previo) => normalizar(previo) === normalizar(nombre),
    );
    if (yaEsta) repetidosEnLote.push(nombre);
    else unicos.push(nombre);
  }

  const existentes = await db.materia.findMany({
    where: { carrera_id },
    select: { nombre: true },
  });
  const yaGuardados = new Set(
    existentes.map((materia) => normalizar(materia.nombre)),
  );

  const porCrear = unicos.filter(
    (nombre) => !yaGuardados.has(normalizar(nombre)),
  );
  const saltados = [
    ...repetidosEnLote,
    ...unicos.filter((nombre) => yaGuardados.has(normalizar(nombre))),
  ];

  if (porCrear.length === 0) {
    return { error: "Todas esas materias ya estaban en la lista." };
  }

  await db.materia.createMany({
    data: porCrear.map((nombre) => ({ nombre, carrera_id, semestre })),
  });

  revalidatePath(RUTA);

  const cuantas =
    porCrear.length === 1 ? "1 materia agregada" : `${porCrear.length} materias agregadas`;

  if (saltados.length === 0) return { exito: `${cuantas}.` };

  return {
    exito: `${cuantas}. Ya estaban en la lista y las salté: ${saltados.join(", ")}.`,
  };
}

export async function editarMateria(
  _estado: EstadoCatalogo,
  datos: FormData,
): Promise<EstadoCatalogo> {
  if (!(await exigirAdmin())) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const id = String(datos.get("id") ?? "");
  const nombre = String(datos.get("nombre") ?? "").trim();
  const carreraCruda = String(datos.get("carrera_id") ?? "");
  const carrera_id = carreraCruda === "tronco" ? null : carreraCruda;

  if (!id || !nombre) return { error: "El nombre es obligatorio." };

  const semestre = leerSemestre(datos.get("semestre"));
  if (semestre === undefined) {
    return { error: "El semestre debe ser un número del 1 al 12." };
  }

  const hermanas = await db.materia.findMany({
    where: { carrera_id, id: { not: id } },
    select: { nombre: true },
  });
  const repetida = hermanas.some(
    (materia) => normalizar(materia.nombre) === normalizar(nombre),
  );
  if (repetida) {
    return { error: "Ya hay otra materia con ese nombre en esa carrera." };
  }

  await db.materia.update({
    where: { id },
    data: { nombre, carrera_id, semestre },
  });
  revalidatePath(RUTA);

  return { exito: "Materia actualizada." };
}

export async function alternarMateria(datos: FormData) {
  if (!(await exigirAdmin())) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const materia = await db.materia.findUnique({ where: { id } });
  if (!materia) return;

  await db.materia.update({
    where: { id },
    data: { activa: !materia.activa },
  });

  revalidatePath(RUTA);
}
