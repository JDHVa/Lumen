import { leerClaveBloque, claveBloque } from "./horarios";

export type CandidatoCrudo = {
  id: string;
  nombre: string;
  bloques: { dia_semana: number; hora_inicio: string }[];
};

export type Candidato = {
  id: string;
  nombre: string;
  coincidencias: string[];
};

export function limpiarFranjas(crudas: unknown): string[] {
  if (!Array.isArray(crudas)) return [];

  const vistas = new Set<string>();
  for (const valor of crudas) {
    const bloque = leerClaveBloque(String(valor));
    if (bloque) vistas.add(claveBloque(bloque.dia, bloque.inicio));
  }

  return [...vistas];
}

export function cruzar(
  franjas: string[],
  candidatos: CandidatoCrudo[],
): Candidato[] {
  const pedidas = new Set(franjas);

  return candidatos
    .map((candidato) => {
      const suyas = candidato.bloques.map((bloque) =>
        claveBloque(bloque.dia_semana, bloque.hora_inicio),
      );

      return {
        id: candidato.id,
        nombre: candidato.nombre,
        coincidencias: suyas.filter((clave) => pedidas.has(clave)),
      };
    })
    .filter((candidato) => candidato.coincidencias.length > 0)
    .sort(
      (a, b) =>
        b.coincidencias.length - a.coincidencias.length ||
        a.nombre.localeCompare(b.nombre, "es"),
    );
}
