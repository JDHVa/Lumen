import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function principal() {
  const usuario = process.env.ADMIN_INICIAL_USUARIO?.trim().toLowerCase();
  const contrasena = process.env.ADMIN_INICIAL_CONTRASENA;

  if (!usuario || !contrasena) {
    throw new Error(
      "Faltan ADMIN_INICIAL_USUARIO o ADMIN_INICIAL_CONTRASENA en el archivo .env",
    );
  }

  const existente = await db.usuario.findUnique({ where: { usuario } });

  if (existente) {
    console.log(`La cuenta "${usuario}" ya existe. No se hizo ningún cambio.`);
    return;
  }

  await db.usuario.create({
    data: {
      nombre: "Admin inicial",
      usuario,
      contrasena_hash: await bcrypt.hash(contrasena, 12),
      es_zhensi: true,
      es_admin: true,
    },
  });

  console.log(`Cuenta admin "${usuario}" creada.`);
}

principal()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
