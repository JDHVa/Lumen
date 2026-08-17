import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    nombre: string;
    usuario: string;
    es_zhensi: boolean;
    es_admin: boolean;
  }

  interface Session {
    user: {
      id: string;
      nombre: string;
      usuario: string;
      es_zhensi: boolean;
      es_admin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nombre: string;
    usuario: string;
    es_zhensi: boolean;
    es_admin: boolean;
  }
}
