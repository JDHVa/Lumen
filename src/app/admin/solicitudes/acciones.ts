"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const PERMITIDOS = ["abierta", "cerrada", "oculta"] as const;

type EstadoPermitido = (typeof PERMITIDOS)[number];

export async function cambiarEstado(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  const destino = String(datos.get("estado") ?? "");

  if (!id) return;
  if (!PERMITIDOS.includes(destino as EstadoPermitido)) return;

  const solicitud = await db.solicitud.findUnique({ where: { id } });
  if (!solicitud) return;

  if (solicitud.estado === "agendada") return;

  await db.solicitud.update({
    where: { id },
    data: { estado: destino as EstadoPermitido },
  });

  refrescar();
}

function refrescar() {
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
  revalidatePath("/admin/demanda");
  revalidatePath("/solicitudes");
}

export async function descartarReporte(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  await db.$transaction([
    db.reporte_error_solicitud.deleteMany({ where: { solicitud_id: id } }),
    db.solicitud.updateMany({
      where: { id },
      data: { reportes_error: 0, reportada_en: null },
    }),
  ]);

  refrescar();
}

export type EstadoBorrado = {
  error?: string;
};

export async function borrarSolicitud(
  _estado: EstadoBorrado,
  datos: FormData,
): Promise<EstadoBorrado> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return { error: "No tienes permiso." };

  const id = String(datos.get("id") ?? "");
  if (!id) return { error: "No encontramos esa solicitud." };

  const solicitud = await db.solicitud.findUnique({
    where: { id },
    select: { id: true, estado: true },
  });

  if (!solicitud) return { error: "Esa solicitud ya no existe." };

  if (solicitud.estado === "agendada") {
    return {
      error:
        "Esta solicitud ya tiene sesión agendada. Cancela la sesión primero y luego bórrala.",
    };
  }

  await db.solicitud.delete({ where: { id } });

  refrescar();

  return {};
}

export async function cambiarArchivo(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  const archivar = String(datos.get("archivar") ?? "") === "si";

  if (!id) return;

  await db.solicitud.updateMany({
    where: { id },
    data: {
      archivada: archivar,
      archivada_en: archivar ? new Date() : null,
    },
  });

  refrescar();
}
