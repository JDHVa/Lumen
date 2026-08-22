"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { generarCodigo } from "@/lib/codigo";
import { leerClaveBloque } from "@/lib/horarios";
import { asegurarHuella, revisarTope, registrarEnvio } from "@/lib/huella";

export type EstadoSolicitud = {
  error?: string;
  codigo?: string;
  id?: string;
};

const LARGO_DESCRIPCION = 500;
const LARGO_TITULO = 120;

export async function crearSolicitud(
  _estado: EstadoSolicitud,
  datos: FormData,
): Promise<EstadoSolicitud> {
  const tope = await revisarTope();
  if (!tope.permitido) {
    return {
      error:
        "Ya mandaste varias solicitudes en la última hora. Espera un rato antes de mandar otra, o busca la tuya en la lista de solicitudes con tu código.",
    };
  }

  const tipo = String(datos.get("tipo") ?? "");
  if (tipo !== "materia" && tipo !== "tema_especial") {
    return { error: "Elige si es una materia o un tema especial." };
  }

  const descripcion = String(datos.get("descripcion") ?? "").trim();
  if (descripcion.length < 10) {
    return {
      error:
        "Cuéntanos un poco más de lo que necesitas. Con al menos 10 caracteres es suficiente.",
    };
  }
  if (descripcion.length > LARGO_DESCRIPCION) {
    return { error: "La descripción quedó demasiado larga." };
  }

  const carreraCruda = String(datos.get("carrera_id") ?? "");
  const carrera_id = carreraCruda === "" ? null : carreraCruda;

  if (carrera_id) {
    const existe = await db.carrera.findUnique({ where: { id: carrera_id } });
    if (!existe) return { error: "Esa carrera ya no existe." };
  }

  let materia_id: string | null = null;
  let titulo_tema: string | null = null;

  if (tipo === "materia") {
    materia_id = String(datos.get("materia_id") ?? "");
    if (!materia_id) return { error: "Elige la materia." };

    const materia = await db.materia.findUnique({ where: { id: materia_id } });
    if (!materia || !materia.activa) {
      return { error: "Esa materia ya no está disponible. Elige otra." };
    }
  } else {
    titulo_tema = String(datos.get("titulo_tema") ?? "").trim();
    if (titulo_tema.length < 4) {
      return { error: "Ponle un título a lo que necesitas." };
    }
    if (titulo_tema.length > LARGO_TITULO) {
      return { error: "El título quedó demasiado largo." };
    }
  }

  const deseadasCrudo = String(datos.get("sesiones_deseadas") ?? "");
  let sesiones_deseadas: number | null = null;
  if (deseadasCrudo !== "") {
    const numero = Number(deseadasCrudo);
    if (!Number.isInteger(numero) || numero < 1 || numero > 4) {
      return { error: "Dinos cuántas sesiones crees que necesitas." };
    }
    sesiones_deseadas = numero;
  }

  const franjas = datos
    .getAll("bloque")
    .map((valor) => String(valor))
    .filter((clave) => leerClaveBloque(clave) !== null);

  if (franjas.length === 0) {
    return {
      error:
        "Marca al menos un horario en el que sí puedas asistir. Sin eso no hay manera de agendarte nada.",
    };
  }

  let creada = null;
  for (let intento = 0; intento < 8 && !creada; intento += 1) {
    const codigo_publico = generarCodigo();
    const repetido = await db.solicitud.findUnique({
      where: { codigo_publico },
    });
    if (repetido) continue;

    creada = await db.solicitud.create({
      data: {
        codigo_publico,
        tipo,
        materia_id,
        titulo_tema,
        descripcion,
        carrera_id,
        franjas_preferidas: franjas,
        sesiones_deseadas,
      },
    });
  }

  if (!creada) {
    return {
      error: "No se pudo generar tu código. Vuelve a intentarlo en un momento.",
    };
  }

  await asegurarHuella();
  await registrarEnvio(tope.recientes);

  revalidatePath("/solicitudes");

  return { codigo: creada.codigo_publico, id: creada.id };
}
