"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function refrescar() {
  revalidatePath("/admin/apuntes");
  revalidatePath("/apuntes");
  revalidatePath("/zhensi/apuntes");
}

export async function aprobarApunte(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  await db.apunte.update({
    where: { id },
    data: {
      aprobado: true,
      rechazado: false,
      motivo: null,
      aprobado_por: sesion.user.id,
    },
  });

  refrescar();
}

export type EstadoRechazo = { error?: string };

export async function rechazarApunte(
  _estado: EstadoRechazo,
  datos: FormData,
): Promise<EstadoRechazo> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const id = String(datos.get("id") ?? "");
  const motivo = String(datos.get("motivo") ?? "").trim();

  if (!id) return { error: "Falta el apunte." };
  if (motivo.length < 5) {
    return {
      error: "Escribe por qué lo rechazas. Quien lo subió va a leer eso.",
    };
  }
  if (motivo.length > 300) return { error: "El motivo quedó muy largo." };

  await db.apunte.update({
    where: { id },
    data: {
      aprobado: false,
      rechazado: true,
      motivo,
      aprobado_por: sesion.user.id,
    },
  });

  refrescar();

  return {};
}
