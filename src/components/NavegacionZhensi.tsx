"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/zhensi", texto: "Inicio" },
  { href: "/zhensi/perfil", texto: "Mi perfil" },
  { href: "/zhensi/disponibilidad", texto: "Mi disponibilidad" },
];

export function NavegacionZhensi() {
  const ruta = usePathname();

  return (
    <nav className="border-b border-marino/10 bg-white">
      <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-5">
        {enlaces.map((enlace) => {
          const activo = ruta === enlace.href;
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
