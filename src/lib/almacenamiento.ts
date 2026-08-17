import { randomUUID } from "node:crypto";

const BUCKET = "lumen";

export const TIPOS_APUNTE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
};

export const TIPOS_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const SE_ABRE_EN_EL_NAVEGADOR = new Set([
  "pdf",
  "jpg",
  "png",
  "webp",
]);

export const LIMITE_APUNTE = 10 * 1024 * 1024;
export const LIMITE_FOTO = 3 * 1024 * 1024;

export function hayAlmacenamiento() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY,
  );
}

function base() {
  const url = process.env.SUPABASE_URL;
  const llave = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !llave) {
    throw new Error("Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY");
  }

  return { url: url.replace(/\/+$/, ""), llave };
}

export type ResultadoSubida =
  | { ok: true; url: string; ruta: string; extension: string }
  | { ok: false; error: string };

export async function subirArchivo(
  archivo: File,
  carpeta: string,
  permitidos: Record<string, string>,
  limite: number,
): Promise<ResultadoSubida> {
  if (!archivo || archivo.size === 0) {
    return { ok: false, error: "No llegó ningún archivo." };
  }

  if (archivo.size > limite) {
    const mb = Math.round(limite / (1024 * 1024));
    return { ok: false, error: `El archivo pasa de ${mb} MB.` };
  }

  const extension = permitidos[archivo.type];
  if (!extension) {
    return {
      ok: false,
      error: "Ese tipo de archivo no se acepta. Revisa la lista de abajo.",
    };
  }

  if (!hayAlmacenamiento()) {
    return {
      ok: false,
      error:
        "Todavía no está configurado el almacenamiento de archivos. Avísale a un admin.",
    };
  }

  const { url, llave } = base();
  const ruta = `${carpeta}/${randomUUID()}.${extension}`;

  const respuesta = await fetch(
    `${url}/storage/v1/object/${BUCKET}/${ruta}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llave}`,
        "Content-Type": archivo.type,
        "x-upsert": "false",
      },
      body: await archivo.arrayBuffer(),
    },
  );

  if (!respuesta.ok) {
    return {
      ok: false,
      error: `No se pudo guardar el archivo (${respuesta.status}). Vuelve a intentarlo.`,
    };
  }

  return {
    ok: true,
    ruta,
    extension,
    url: `${url}/storage/v1/object/public/${BUCKET}/${ruta}`,
  };
}

export async function borrarArchivo(direccion: string) {
  if (!hayAlmacenamiento()) return;

  const { url, llave } = base();
  const marca = `/storage/v1/object/public/${BUCKET}/`;
  const corte = direccion.indexOf(marca);
  if (corte === -1) return;

  const ruta = direccion.slice(corte + marca.length);

  await fetch(`${url}/storage/v1/object/${BUCKET}/${ruta}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${llave}` },
  }).catch(() => undefined);
}

export function extensionDe(direccion: string) {
  const limpia = direccion.split("?")[0];
  return limpia.slice(limpia.lastIndexOf(".") + 1).toLowerCase();
}
