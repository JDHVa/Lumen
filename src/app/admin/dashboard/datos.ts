import { db } from "@/lib/db";
import { resumirSesiones, diasDeEspera, horasDe, conUnDecimal } from "@/lib/metricas";

export async function cargarMetricas() {
  const [realizadas, agendadas, ajustes, solicitudes, cuentas] = await Promise.all([
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
    db.sesion.findMany({
      where: { estado: "publicada" },
      select: {
        hora_inicio: true,
        hora_fin: true,
        zhensi_id: true,
        zhensi: { select: { nombre: true } },
      },
    }),
    db.ajuste_horas.findMany({
      orderBy: { creado_en: "desc" },
      select: {
        id: true,
        minutos: true,
        motivo: true,
        creado_en: true,
        zhensi_id: true,
        zhensi: { select: { nombre: true } },
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
        sesiones: {
          orderBy: { creada_en: "asc" },
          take: 1,
          select: { creada_en: true },
        },
      },
    }),
    db.usuario.count({ where: { es_zhensi: true, activo: true } }),
  ]);

  const mensajes = await db.mensaje_buzon.findMany({
    select: { categoria: true, estado: true },
  });

  const buzon = {
    sugerencia: mensajes.filter((uno) => uno.categoria === "sugerencia").length,
    agradecimiento: mensajes.filter((uno) => uno.categoria === "agradecimiento")
      .length,
    apoyo: mensajes.filter((uno) => uno.categoria === "apoyo").length,
    sinAtender: mensajes.filter((uno) => uno.estado !== "atendido").length,
    total: mensajes.length,
  };

  const base = resumirSesiones(realizadas);

  const minutosAjustados = ajustes.reduce((suma, uno) => suma + uno.minutos, 0);

  const resumen = {
    ...base,
    horasDadas: base.horas,
    horasAgendadas: conUnDecimal(horasDe(agendadas)),
    horasAjustadas: conUnDecimal(minutosAjustados / 60),
    horas: conUnDecimal(
      horasDe(realizadas) + horasDe(agendadas) + minutosAjustados / 60,
    ),
    agendadas: agendadas.length,
  };

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

  for (const una of agendadas) {
    const previo = porZhenshi.get(una.zhensi_id) ?? {
      nombre: una.zhensi.nombre,
      sesiones: 0,
      horas: 0,
      asistentes: 0,
    };
    previo.horas += horasDe([una]);
    porZhenshi.set(una.zhensi_id, previo);
  }

  for (const uno of ajustes) {
    const previo = porZhenshi.get(uno.zhensi_id) ?? {
      nombre: uno.zhensi.nombre,
      sesiones: 0,
      horas: 0,
      asistentes: 0,
    };
    previo.horas += uno.minutos / 60;
    porZhenshi.set(uno.zhensi_id, previo);
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
      .filter((una) => una.sesiones.length > 0)
      .map((una) => ({
        creada_en: una.creada_en,
        agendada_en: una.sesiones[0].creada_en,
      })),
  );

  return {
    resumen,
    zhenshis,
    pedidas,
    porEstado,
    espera,
    ajustes,
    zhenshisRegistrados: cuentas,
    totalSolicitudes: solicitudes.length,
    buzon,
  };
}
