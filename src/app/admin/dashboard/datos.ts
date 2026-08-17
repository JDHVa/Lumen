import { db } from "@/lib/db";
import { resumirSesiones, diasDeEspera, horasDe, conUnDecimal } from "@/lib/metricas";

export async function cargarMetricas() {
  const [realizadas, solicitudes, cuentas] = await Promise.all([
    db.sesion.findMany({
      where: { estado: "realizada" },
      select: {
        fecha: true,
        creada_en: true,
        hora_inicio: true,
        hora_fin: true,
        zhensi_id: true,
        zhensi: { select: { nombre: true } },
        materia: { select: { nombre: true } },
        titulo: true,
        asistencia: { select: { cantidad: true } },
      },
    }),
    db.solicitud.findMany({
      select: {
        estado: true,
        tipo: true,
        titulo_tema: true,
        apoyos: true,
        creada_en: true,
        materia: { select: { nombre: true } },
        sesion: { select: { creada_en: true } },
      },
    }),
    db.usuario.count({ where: { es_zhensi: true, activo: true } }),
  ]);

  const resumen = resumirSesiones(realizadas);

  const porZhenshi = new Map<
    string,
    { nombre: string; sesiones: number; horas: number; asistentes: number }
  >();

  for (const una of realizadas) {
    const previo = porZhenshi.get(una.zhensi_id) ?? {
      nombre: una.zhensi.nombre,
      sesiones: 0,
      horas: 0,
      asistentes: 0,
    };
    previo.sesiones += 1;
    previo.horas += horasDe([una]);
    previo.asistentes += una.asistencia?.cantidad ?? 0;
    porZhenshi.set(una.zhensi_id, previo);
  }

  const zhenshis = [...porZhenshi.values()]
    .map((fila) => ({ ...fila, horas: conUnDecimal(fila.horas) }))
    .sort((a, b) => b.horas - a.horas || a.nombre.localeCompare(b.nombre, "es"));

  const porMateria = new Map<string, number>();
  for (const una of solicitudes) {
    const nombre =
      una.tipo === "materia"
        ? (una.materia?.nombre ?? "Sin materia")
        : (una.titulo_tema ?? "Tema especial");
    porMateria.set(nombre, (porMateria.get(nombre) ?? 0) + 1);
  }

  const pedidas = [...porMateria.entries()]
    .map(([nombre, cuantas]) => ({ nombre, cuantas }))
    .sort((a, b) => b.cuantas - a.cuantas || a.nombre.localeCompare(b.nombre, "es"))
    .slice(0, 15);

  const porEstado = {
    abierta: solicitudes.filter((una) => una.estado === "abierta").length,
    agendada: solicitudes.filter((una) => una.estado === "agendada").length,
    cerrada: solicitudes.filter((una) => una.estado === "cerrada").length,
    oculta: solicitudes.filter((una) => una.estado === "oculta").length,
  };

  const espera = diasDeEspera(
    solicitudes
      .filter((una) => una.sesion !== null)
      .map((una) => ({
        creada_en: una.creada_en,
        agendada_en: una.sesion!.creada_en,
      })),
  );

  return {
    resumen,
    zhenshis,
    pedidas,
    porEstado,
    espera,
    zhenshisRegistrados: cuentas,
    totalSolicitudes: solicitudes.length,
  };
}
