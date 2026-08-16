import type { NextAuthConfig } from "next-auth";

export const configuracionAuth = {
  trustHost: true,
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.nombre = user.nombre;
        token.usuario = user.usuario;
        token.es_zhensi = user.es_zhensi;
        token.es_admin = user.es_admin;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id);
      session.user.nombre = String(token.nombre);
      session.user.usuario = String(token.usuario);
      session.user.es_zhensi = Boolean(token.es_zhensi);
      session.user.es_admin = Boolean(token.es_admin);
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
