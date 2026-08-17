"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { borrarArchivo } from "@/lib/almacenamiento";

export type EstadoCuenta = { error?: string; exito?: string };

function refrescar() {
  revalidatePath("/admin/zhensis");
  revalidatePath("/admin/usuarios");
  revalidatePath("/zhensis");
}

export async function alternarActivo(datos: FormData) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) return;

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const cuenta = await db.usuario.findUnique({ where: { id } });
  if (!cuenta) return;
  if (cuenta.id === sesion.user.id) return;

  await db.$transaction([
    db.usuario.update({
      where: { id },
      data: { activo: !cuenta.activo },
    }),
    db.perfil_zhensi.updateMany({
      where: { usuario_id: id },
      data: cuenta.activo ? { visible_publico: false } : {},
    }),
  ]);

  refrescar();
}

export async function borrarCuenta(
  _estado: EstadoCuenta,
  datos: FormData,
): Promise<EstadoCuenta> {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return { error: "No tienes permiso para hacer esto." };
  }

  const id = String(datos.get("id") ?? "");
  const confirmacion = String(datos.get("confirmacion") ?? "").trim();

  if (!id) return { error: "Falta la cuenta." };

  if (id === sesion.user.id) {
    return { error: "No puedes borrar tu propia cuenta." };
  }

  const cuenta = await db.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      usuario: true,
      perfil: { select: { foto_url: true } },
      _count: {
        select: {
          sesiones: true,
          sesiones_creadas: true,
          apuntes: true,
          asistencias: true,
          mensajes_atendidos: true,
        },
      },
    },
  });

  if (!cuenta) return { error: "Esa cuenta ya no existe." };

  if (confirmacion !== cuenta.usuario) {
    return {
      error: `Para borrarla escribe su nombre de usuario tal cual: ${cuenta.usuario}`,
    };
  }

  const historial =
    cuenta._count.sesiones +
    cuenta._count.sesiones_creadas +
    cuenta._count.apuntes +
    cuenta._count.asistencias;

  if (historial > 0) {
    const partes: string[] = [];
    if (cuenta._count.sesiones) partes.push(`${cuenta._count.sesiones} sesiones dadas`);
    if (cuenta._count.sesiones_creadas)
      partes.push(`${cuenta._count.sesiones_creadas} sesiones que agendó`);
    if (cuenta._count.apuntes) partes.push(`${cuenta._count.apuntes} apuntes`);
    if (cuenta._count.asistencias)
      partes.push(`${cuenta._count.asistencias} asistencias capturadas`);

    return {
      error: `No se puede borrar: tiene ${partes.join(", ")}. Borrarla dejaría huecos en el historial y en los números. Archívala en vez de borrarla.`,
    };
  }

  const foto = cuenta.perfil?.foto_url ?? null;

  await db.$transaction([
    db.mensaje_buzon.updateMany({
      where: { atendido_por: id },
      data: { atendido_por: null },
    }),
    db.zhensi_materia.deleteMany({ where: { usuario_id: id } }),
    db.disponibilidad.deleteMany({ where: { usuario_id: id } }),
    db.perfil_zhensi.deleteMany({ where: { usuario_id: id } }),
    db.intento_acceso.deleteMany({ where: { usuario: cuenta.usuario } }),
    db.usuario.delete({ where: { id } }),
  ]);

  if (foto) await borrarArchivo(foto);

  refrescar();

  return { exito: `La cuenta de ${cuenta.nombre} se borró por completo.` };
}
