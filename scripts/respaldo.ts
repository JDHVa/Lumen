import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const CARPETA = process.env.CARPETA_RESPALDOS ?? "respaldos";

async function main() {
  const inicio = Date.now();

  const [
    usuario,
    perfil_zhensi,
    zhensi_materia,
    carrera,
    materia,
    disponibilidad,
    solicitud,
    apoyo_solicitud,
    sesion,
    asistencia,
    apunte,
    mensaje_buzon,
  ] = await Promise.all([
    db.usuario.findMany(),
    db.perfil_zhensi.findMany(),
    db.zhensi_materia.findMany(),
    db.carrera.findMany(),
    db.materia.findMany(),
    db.disponibilidad.findMany(),
    db.solicitud.findMany(),
    db.apoyo_solicitud.findMany(),
    db.sesion.findMany(),
    db.asistencia.findMany(),
    db.apunte.findMany(),
    db.mensaje_buzon.findMany(),
  ]);

  const tablas = {
    usuario,
    perfil_zhensi,
    zhensi_materia,
    carrera,
    materia,
    disponibilidad,
    solicitud,
    apoyo_solicitud,
    sesion,
    asistencia,
    apunte,
    mensaje_buzon,
  };

  const respaldo = {
    hecho_en: new Date().toISOString(),
    version: 1,
    tablas,
  };

  await mkdir(CARPETA, { recursive: true });

  const marca = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const ruta = join(CARPETA, `lumen-${marca}.json`);

  await writeFile(ruta, JSON.stringify(respaldo, null, 2), "utf8");

  console.log("Respaldo guardado en:", ruta);
  console.log("");
  for (const [nombre, filas] of Object.entries(tablas)) {
    console.log(`  ${nombre}: ${filas.length}`);
  }

  const total = Object.values(tablas).reduce(
    (suma, filas) => suma + filas.length,
    0,
  );

  console.log("");
  console.log(`Total: ${total} registros en ${Date.now() - inicio} ms`);

  if (total === 0) {
    console.error("Cuidado: el respaldo salió vacío. Revisa la conexión.");
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error("Falló el respaldo:", error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
