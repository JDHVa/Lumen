import { nombreDia } from "./horarios";

export function aFecha(texto: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const fecha = new Date(`${texto}T00:00:00.000Z`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function diaSemanaDe(fecha: Date) {
  const domingoCero = fecha.getUTCDay();
  return domingoCero === 0 ? 7 : domingoCero;
}

export function comoTexto(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

export function proximaFechaCon(dia: number, desde = new Date()) {
  const base = new Date(
    Date.UTC(desde.getFullYear(), desde.getMonth(), desde.getDate()),
  );

  for (let saltos = 0; saltos < 8; saltos += 1) {
    const intento = new Date(base);
    intento.setUTCDate(base.getUTCDate() + saltos);
    if (diaSemanaDe(intento) === dia) return intento;
  }

  return base;
}

export function fechaLegible(fecha: Date) {
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  return `${nombreDia(diaSemanaDe(fecha))} ${dia}/${mes}`;
}
