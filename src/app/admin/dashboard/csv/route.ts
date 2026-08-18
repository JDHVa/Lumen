import { auth } from "@/lib/auth";
import { aCsv } from "@/lib/metricas";
import { cargarMetricas } from "../datos";

export async function GET(peticion: Request) {
  const sesion = await auth();
  if (!sesion?.user.es_admin) {
    return new Response("No autorizado", { status: 403 });
  }

  const cual = new URL(peticion.url).searchParams.get("tabla") ?? "resumen";
  const datos = await cargarMetricas();

  let nombre = "resumen";
  let contenido = "";

  if (cual === "zhenshis") {
    nombre = "zhenshis";
    contenido = aCsv(
      ["Zhenshi", "Sesiones realizadas", "Horas", "Asistentes"],
      datos.zhenshis.map((fila) => [
        fila.nombre,
        fila.sesiones,
        fila.horas,
        fila.asistentes,
      ]),
    );
  } else if (cual === "materias") {
    nombre = "mas-pedidas";
    contenido = aCsv(
      ["Materia o tema", "Solicitudes"],
      datos.pedidas.map((fila) => [fila.nombre, fila.cuantas]),
    );
  } else {
    contenido = aCsv(
      ["Métrica", "Valor"],
      [
        ["Sesiones realizadas esta semana", datos.resumen.semana],
        ["Sesiones realizadas este mes", datos.resumen.mes],
        ["Sesiones realizadas en total", datos.resumen.total],
        ["Schüler atendidos", datos.resumen.asistentes],
        ["Horas de servicio", datos.resumen.horas],
        ["Zhenshis con sesiones dadas", datos.resumen.zhenshisActivos],
        ["Zhenshis registrados y activos", datos.zhenshisRegistrados],
        ["Promedio de asistentes por sesión", datos.resumen.promedioPorSesion],
        ["Solicitudes abiertas", datos.porEstado.abierta],
        ["Solicitudes agendadas", datos.porEstado.agendada],
        ["Solicitudes cerradas", datos.porEstado.cerrada],
        ["Solicitudes ocultas", datos.porEstado.oculta],
        [
          "Días promedio de espera",
          datos.espera === null ? "sin datos" : datos.espera,
        ],
      ],
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lumen-${nombre}-${hoy}.csv"`,
    },
  });
}
