"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type EstadoAjuste = { error?: string; exito?: string };

export async function agregarHoras(
  _estado: EstadoAjuste,
  datos: FormData,
): Promise<EstadoAjuste> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const zhensi_id = String(datos.get("zhensi_id") ?? "");
  const crudo = String(datos.get("horas") ?? "").trim().replace(",", ".");
  const motivo = String(datos.get("motivo") ?? "").trim();

  if (!zhensi_id) return { error: "Elige a quién le vas a sumar las horas." };
  if (crudo === "") return { error: "Escribe cuántas horas vas a sumar." };
  if (!motivo) return { error: "Escribe por qué las estás sumando." };

  const horas = Number(crudo);
  if (!Number.isFinite(horas) || horas === 0) {
    return { error: "Las horas deben ser un número distinto de cero." };
  }
  if (horas < -12 || horas > 12) {
    return { error: "De un solo ajuste puedes mover como máximo 12 horas." };
  }

  const minutos = Math.round(horas * 60);
  if (minutos === 0) {
    return { error: "Ese ajuste es menor a un minuto." };
  }

  const zhensi = await db.usuario.findUnique({
    where: { id: zhensi_id },
    select: { nombre: true, es_zhensi: true },
  });
  if (!zhensi || !zhensi.es_zhensi) {
    return { error: "Esa cuenta no es de un zhensi." };
  }

  await db.ajuste_horas.create({
    data: { zhensi_id, minutos, motivo, creado_por: sesion.user.id },
  });

  revalidatePath("/admin/dashboard");

  return {
    exito:
      minutos > 0
        ? `Le sumaste ${horas} horas a ${zhensi.nombre}.`
        : `Le restaste ${Math.abs(horas)} horas a ${zhensi.nombre}.`,
  };
}

export async function borrarAjuste(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  await db.ajuste_horas.deleteMany({ where: { id } });

  revalidatePath("/admin/dashboard");
}
