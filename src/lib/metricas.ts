export type SesionParaMetricas = {
  fecha: Date;
  creada_en: Date;
  hora_inicio: string;
  hora_fin: string;
  zhensi_id: string;
  asistencia: { cantidad: number } | null;
};

export function minutosDe(inicio: string, fin: string) {
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFin, minutoFin] = fin.split(":").map(Number);

  if ([horaInicio, minutoInicio, horaFin, minutoFin].some(Number.isNaN)) {
    return 0;
  }

  const total = horaFin * 60 + minutoFin - (horaInicio * 60 + minutoInicio);
  return total > 0 ? total : 0;
}

export function horasDe(sesiones: { hora_inicio: string; hora_fin: string }[]) {
  const minutos = sesiones.reduce(
    (suma, sesion) => suma + minutosDe(sesion.hora_inicio, sesion.hora_fin),
    0,
  );
  return minutos / 60;
}

export function conUnDecimal(numero: number) {
  return Math.round(numero * 10) / 10;
}

export function inicioDeSemana(hoy = new Date()) {
  const base = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
  );
  const domingoCero = base.getUTCDay();
  const desdeLunes = domingoCero === 0 ? 6 : domingoCero - 1;
  base.setUTCDate(base.getUTCDate() - desdeLunes);
  return base;
}

export function inicioDeMes(hoy = new Date()) {
  return new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), 1));
}

export function resumirSesiones(
  sesiones: SesionParaMetricas[],
  hoy = new Date(),
) {
  const semana = inicioDeSemana(hoy);
  const mes = inicioDeMes(hoy);

  const deLaSemana = sesiones.filter((una) => una.fecha >= semana);
  const delMes = sesiones.filter((una) => una.fecha >= mes);

  const asistentes = sesiones.reduce(
    (suma, una) => suma + (una.asistencia?.cantidad ?? 0),
    0,
  );

  const conAsistencia = sesiones.filter((una) => una.asistencia !== null);

  return {
    semana: deLaSemana.length,
    mes: delMes.length,
    total: sesiones.length,
    asistentes,
    horas: conUnDecimal(horasDe(sesiones)),
    zhenshisActivos: new Set(sesiones.map((una) => una.zhensi_id)).size,
    promedioPorSesion:
      conAsistencia.length === 0
        ? 0
        : conUnDecimal(asistentes / conAsistencia.length),
    sinCapturar: sesiones.length - conAsistencia.length,
  };
}

export function diasDeEspera(
  parejas: { creada_en: Date; agendada_en: Date }[],
) {
  if (parejas.length === 0) return null;

  const dias = parejas.map((par) => {
    const ms = par.agendada_en.getTime() - par.creada_en.getTime();
    return ms > 0 ? ms / (1000 * 60 * 60 * 24) : 0;
  });

  return conUnDecimal(dias.reduce((a, b) => a + b, 0) / dias.length);
}

export function aCsv(encabezados: string[], filas: (string | number)[][]) {
  const escapar = (valor: string | number) => {
    const texto = String(valor);
    return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };

  return [encabezados, ...filas]
    .map((fila) => fila.map(escapar).join(","))
    .join("\r\n");
}
