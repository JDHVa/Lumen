"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/admin", texto: "Inicio" },
  { href: "/admin/dashboard", texto: "Dashboard" },
  { href: "/admin/usuarios", texto: "Usuarios" },
  { href: "/admin/demanda", texto: "Demanda" },
  { href: "/admin/sesiones", texto: "Sesiones" },
  { href: "/admin/solicitudes", texto: "Solicitudes" },
  { href: "/admin/buzon", texto: "Buzón" },
  { href: "/admin/apuntes", texto: "Apuntes" },
  { href: "/admin/catalogo", texto: "Catálogo" },
  { href: "/admin/zhensis", texto: "Zhenshis" },
];

export function NavegacionAdmin({
  avisos = 0,
  propuestas = 0,
}: {
  avisos?: number;
  propuestas?: number;
}) {
  const ruta = usePathname();

  return (
    <nav className="border-b border-marino/10 bg-white">
      <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-5">
        {enlaces.map((enlace) => {
          const activo =
            enlace.href === "/admin"
              ? ruta === enlace.href
              : ruta.startsWith(enlace.href);
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={activo ? "page" : undefined}
              className={`min-h-[44px] shrink-0 border-b-2 px-3 pt-3 text-sm font-medium transition-colors ${
                activo
                  ? "border-dorado text-marino"
                  : "border-transparent text-tinta-suave hover:text-marino"
              }`}
            >
              {enlace.texto}
              {enlace.href === "/admin/demanda" && propuestas > 0 ? (
                <span
                  className="ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-dorado px-1.5 py-0.5 text-[11px] font-bold text-marino-hondo"
                  aria-label={`${propuestas} solicitudes donde alguien se propuso`}
                >
                  {propuestas}
                </span>
              ) : null}
              {enlace.href === "/admin/solicitudes" && avisos > 0 ? (
                <span
                  className="ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-alerta px-1.5 py-0.5 text-[11px] font-bold text-white"
                  aria-label={`${avisos} solicitudes reportadas como error`}
                >
                  {avisos}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
