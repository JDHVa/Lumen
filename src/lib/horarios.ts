export const DIAS = [
  { numero: 1, nombre: "Lunes" },
  { numero: 2, nombre: "Martes" },
  { numero: 3, nombre: "Miércoles" },
  { numero: 4, nombre: "Jueves" },
  { numero: 5, nombre: "Viernes" },
] as const;

export const BLOQUES = [
  { inicio: "12:00", fin: "13:00", etiqueta: "12 – 1" },
  { inicio: "13:00", fin: "14:00", etiqueta: "1 – 2" },
  { inicio: "14:00", fin: "15:00", etiqueta: "2 – 3" },
  { inicio: "15:00", fin: "16:00", etiqueta: "3 – 4" },
  { inicio: "16:00", fin: "17:00", etiqueta: "4 – 5" },
] as const;

export function claveBloque(dia: number, inicio: string) {
  return `${dia}|${inicio}`;
}

export function leerClaveBloque(clave: string) {
  const [diaCrudo, inicio] = clave.split("|");
  const dia = Number(diaCrudo);

  if (!DIAS.some((item) => item.numero === dia)) return null;

  const bloque = BLOQUES.find((item) => item.inicio === inicio);
  if (!bloque) return null;

  return { dia, inicio: bloque.inicio, fin: bloque.fin };
}

export function nombreDia(numero: number) {
  return DIAS.find((dia) => dia.numero === numero)?.nombre ?? "";
}
