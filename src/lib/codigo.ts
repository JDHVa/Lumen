import { randomInt } from "node:crypto";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LARGO = 4;

export function generarCodigo() {
  let cuerpo = "";
  for (let i = 0; i < LARGO; i += 1) {
    cuerpo += ALFABETO[randomInt(ALFABETO.length)];
  }
  return `LUM-${cuerpo}`;
}

export function normalizarCodigo(texto: string) {
  const limpio = texto
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^LUM/, "");

  if (limpio.length !== LARGO) return null;
  if ([...limpio].some((letra) => !ALFABETO.includes(letra))) return null;

  return `LUM-${limpio}`;
}
