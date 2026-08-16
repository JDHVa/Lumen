import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { configuracionAuth } from "@/lib/auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...configuracionAuth,
  providers: [
    Credentials({
      credentials: {
        usuario: {},
        contrasena: {},
      },
      async authorize(credenciales) {
        const nombreUsuario = String(credenciales?.usuario ?? "").trim();
        const contrasena = String(credenciales?.contrasena ?? "");

        if (!nombreUsuario || !contrasena) return null;

        const encontrado = await db.usuario.findUnique({
          where: { usuario: nombreUsuario },
        });

        if (!encontrado || !encontrado.activo) return null;

        const coincide = await bcrypt.compare(
          contrasena,
          encontrado.contrasena_hash,
        );

        if (!coincide) return null;

        return {
          id: encontrado.id,
          nombre: encontrado.nombre,
          usuario: encontrado.usuario,
          es_zhensi: encontrado.es_zhensi,
          es_admin: encontrado.es_admin,
        };
      },
    }),
  ],
});
