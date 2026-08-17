import { headers } from "next/headers";
import { db } from "./db";

const VENTANA_MINUTOS = 15;
const TOPE_POR_USUARIO = 8;
const TOPE_POR_ORIGEN = 25;

export async function origenDeLaPeticion() {
  const cabeceras = await headers();

  const reenviado = cabeceras.get("x-forwarded-for");
  if (reenviado) return reenviado.split(",")[0].trim().slice(0, 60);

  return (
    cabeceras.get("x-real-ip")?.slice(0, 60) ??
    cabeceras.get("cf-connecting-ip")?.slice(0, 60) ??
    "desconocido"
  );
}

export async function estaBloqueado(usuario: string) {
  const desde = new Date(Date.now() - VENTANA_MINUTOS * 60 * 1000);
  const origen = await origenDeLaPeticion();

  const [porUsuario, porOrigen] = await Promise.all([
    db.intento_acceso.count({
      where: { usuario, logrado: false, creado_en: { gte: desde } },
    }),
    db.intento_acceso.count({
      where: { origen, logrado: false, creado_en: { gte: desde } },
    }),
  ]);

  return porUsuario >= TOPE_POR_USUARIO || porOrigen >= TOPE_POR_ORIGEN;
}

export async function anotarIntento(usuario: string, logrado: boolean) {
  const origen = await origenDeLaPeticion();

  await db.intento_acceso.create({
    data: { usuario: usuario.slice(0, 60), origen, logrado },
  });

  if (logrado) {
    await db.intento_acceso.deleteMany({
      where: { usuario, logrado: false },
    });
  }

  const viejos = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.intento_acceso
    .deleteMany({ where: { creado_en: { lt: viejos } } })
    .catch(() => undefined);
}

export const ESPERA_MINUTOS = VENTANA_MINUTOS;
