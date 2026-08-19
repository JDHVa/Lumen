"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type EstadoPropuesta = {
  error?: string;
  exito?: string;
};

const LARGO_MENSAJE = 300;

function refrescar() {
  revalidatePath("/zhensi/solicitudes");
  revalidatePath("/zhensi");
  revalidatePath("/admin");
  revalidatePath("/admin/demanda");
}

export async function proponerse(
  _estado: EstadoPropuesta,
  datos: FormData,
): Promise<EstadoPropuesta> {
  const sesion = await auth();
  if (!sesion?.user.es_zhensi) return { error: "No tienes permiso." };

  const solicitud_id = String(datos.get("solicitud_id") ?? "");
  if (!solicitud_id) return { error: "No encontramos esa solicitud." };

  const mensaje = String(datos.get("mensaje") ?? "").trim();
  if (mensaje.length > LARGO_MENSAJE) {
    return { error: "El recado quedó demasiado largo." };
  }

  const solicitud = await db.solicitud.findUnique({
    where: { id: solicitud_id },
    select: { id: true, estado: true, archivada: true },
  });

  if (!solicitud) return { error: "Esa solicitud ya no existe." };

  if (solicitud.estado !== "abierta" || solicitud.archivada) {
    return {
      error:
        "Esta solicitud ya no está abierta. Puede que ya la hayan agendado o cerrado.",
    };
  }

  const yaEsta = await db.propuesta_zhensi.findUnique({
    where: {
      solicitud_id_zhensi_id: { solicitud_id, zhensi_id: sesion.user.id },
    },
  });

  if (yaEsta) return { exito: "Ya te habías propuesto para esta." };

  await db.propuesta_zhensi.create({
    data: {
      solicitud_id,
      zhensi_id: sesion.user.id,
      mensaje: mensaje === "" ? null : mensaje,
    },
  });

  refrescar();

  return { exito: "Listo, ya te propusiste. El admin lo va a ver." };
}

export async function retirarPropuesta(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_zhensi) return;

  const solicitud_id = String(datos.get("solicitud_id") ?? "");
  if (!solicitud_id) return;

  await db.propuesta_zhensi.deleteMany({
    where: { solicitud_id, zhensi_id: sesion.user.id },
  });

  refrescar();
}
