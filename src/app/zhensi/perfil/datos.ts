import { db } from "@/lib/db";

export async function cargarDatosPerfil(usuarioId: string) {
  const [carrerasCrudas, materias, perfil, elegidas] = await Promise.all([
    db.carrera.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        clave: true,
        _count: { select: { materias: true } },
      },
    }),
    db.materia.findMany({
      where: { activa: true },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        carrera_id: true,
        semestre: true,
        activa: true,
      },
    }),
    db.perfil_zhensi.findUnique({
      where: { usuario_id: usuarioId },
      select: {
        foto_url: true,
        carrera_id: true,
        semestre: true,
        descripcion_corta: true,
        visible_publico: true,
      },
    }),
    db.zhensi_materia.findMany({
      where: { usuario_id: usuarioId },
      select: { materia_id: true },
    }),
  ]);

  return {
    carreras: carrerasCrudas.map((carrera) => ({
      id: carrera.id,
      nombre: carrera.nombre,
      clave: carrera.clave,
      cuantas: carrera._count.materias,
    })),
    materias,
    perfil,
    materiasElegidas: elegidas.map((fila) => fila.materia_id),
  };
}
