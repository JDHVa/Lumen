import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { configuracionAuth } from "@/lib/auth.config";

const { auth } = NextAuth(configuracionAuth);

export default auth((peticion) => {
  const ruta = peticion.nextUrl.pathname;
  const sesion = peticion.auth;

  const zonaZhensi = ruta.startsWith("/zhensi");
  const zonaAdmin = ruta.startsWith("/admin");

  if (!zonaZhensi && !zonaAdmin) return NextResponse.next();

  if (!sesion?.user) {
    const destino = new URL("/iniciarsesion", peticion.nextUrl);
    destino.searchParams.set("regresar", ruta);
    return NextResponse.redirect(destino);
  }

  if (zonaAdmin && !sesion.user.es_admin) {
    return NextResponse.redirect(new URL("/zhensi", peticion.nextUrl));
  }

  if (zonaZhensi && !sesion.user.es_zhensi && !sesion.user.es_admin) {
    return NextResponse.redirect(new URL("/", peticion.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/zhensi/:path*", "/admin/:path*"],
};
