import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { empaquetar, desempaquetar } from "./firma";

const NOMBRE = "lumen_huella";
const DIAS_DE_VIDA = 365;

function opciones(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function leerHuella() {
  const almacen = await cookies();
  return desempaquetar(almacen.get(NOMBRE)?.value);
}

export async function asegurarHuella() {
  const almacen = await cookies();
  const existente = desempaquetar(almacen.get(NOMBRE)?.value);
  if (existente) return existente;

  const nueva = randomUUID();
  almacen.set(NOMBRE, empaquetar(nueva), opciones(60 * 60 * 24 * DIAS_DE_VIDA));

  return nueva;
}

const NOMBRE_ENVIOS = "lumen_envios";
const VENTANA = 60 * 60 * 1000;
const TOPE = 3;

export async function revisarTope() {
  const almacen = await cookies();
  const crudo = desempaquetar(almacen.get(NOMBRE_ENVIOS)?.value);

  let previos: number[] = [];
  if (crudo) {
    try {
      const leidos: unknown = JSON.parse(crudo);
      if (Array.isArray(leidos)) {
        previos = leidos.filter(
          (marca): marca is number => typeof marca === "number",
        );
      }
    } catch {
      previos = [];
    }
  }

  const ahora = Date.now();
  const recientes = previos.filter((marca) => ahora - marca < VENTANA);

  return {
    permitido: recientes.length < TOPE,
    recientes,
    restantes: Math.max(0, TOPE - recientes.length),
  };
}

export async function registrarEnvio(recientes: number[]) {
  const almacen = await cookies();
  const marcas = [...recientes, Date.now()];

  almacen.set(
    NOMBRE_ENVIOS,
    empaquetar(JSON.stringify(marcas)),
    opciones(VENTANA / 1000),
  );
}
