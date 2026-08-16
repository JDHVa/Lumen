export type Bloque = {
  inicio: string;
  fin: string;
  etiqueta: string;
};

function armarBloques(desde: number, hasta: number): Bloque[] {
  const bloques: Bloque[] = [];

  for (let hora = desde; hora < hasta; hora += 1) {
    bloques.push({
      inicio: `${String(hora).padStart(2, "0")}:00`,
      fin: `${String(hora + 1).padStart(2, "0")}:00`,
      etiqueta: etiquetaHora(hora),
    });
  }

  return bloques;
}

export function etiquetaHora(hora: number) {
  const meridiano = hora < 12 ? "am" : "pm";
  const doce = hora % 12 === 0 ? 12 : hora % 12;
  return `${doce} ${meridiano}`;
}

const ENTRE_SEMANA = armarBloques(12, 17);
const FIN_DE_SEMANA = armarBloques(7, 19);

export const MODALIDAD_EN_LINEA =
  "Las sesiones de sábado y domingo son en línea.";

export const DIAS = [
  { numero: 1, nombre: "Lunes", enLinea: false, bloques: ENTRE_SEMANA },
  { numero: 2, nombre: "Martes", enLinea: false, bloques: ENTRE_SEMANA },
  { numero: 3, nombre: "Miércoles", enLinea: false, bloques: ENTRE_SEMANA },
  { numero: 4, nombre: "Jueves", enLinea: false, bloques: ENTRE_SEMANA },
  { numero: 5, nombre: "Viernes", enLinea: false, bloques: ENTRE_SEMANA },
  { numero: 6, nombre: "Sábado", enLinea: true, bloques: FIN_DE_SEMANA },
  { numero: 7, nombre: "Domingo", enLinea: true, bloques: FIN_DE_SEMANA },
] as const;

export function buscarDia(numero: number) {
  return DIAS.find((dia) => dia.numero === numero) ?? null;
}

export function esEnLinea(numero: number) {
  return buscarDia(numero)?.enLinea ?? false;
}

export function nombreDia(numero: number) {
  return buscarDia(numero)?.nombre ?? "";
}

export function claveBloque(dia: number, inicio: string) {
  return `${dia}|${inicio}`;
}

export function leerClaveBloque(clave: string) {
  const [diaCrudo, inicio] = clave.split("|");
  const dia = buscarDia(Number(diaCrudo));
  if (!dia) return null;

  const bloque = dia.bloques.find((item) => item.inicio === inicio);
  if (!bloque) return null;

  return { dia: dia.numero, inicio: bloque.inicio, fin: bloque.fin };
}

export function etiquetaDeBloque(dia: number, inicio: string) {
  const encontrado = buscarDia(dia)?.bloques.find(
    (bloque) => bloque.inicio === inicio,
  );
  return encontrado?.etiqueta ?? inicio;
}
