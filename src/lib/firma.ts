import { createHmac, timingSafeEqual } from "node:crypto";

function llave() {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta AUTH_SECRET");
  return secreto;
}

function firmar(valor: string) {
  return createHmac("sha256", llave()).update(valor).digest("base64url");
}

export function empaquetar(valor: string) {
  return `${valor}.${firmar(valor)}`;
}

export function desempaquetar(paquete: string | undefined) {
  if (!paquete) return null;

  const corte = paquete.lastIndexOf(".");
  if (corte < 1) return null;

  const valor = paquete.slice(0, corte);
  const recibida = Buffer.from(paquete.slice(corte + 1));
  const esperada = Buffer.from(firmar(valor));

  if (recibida.length !== esperada.length) return null;
  if (!timingSafeEqual(recibida, esperada)) return null;

  return valor;
}
