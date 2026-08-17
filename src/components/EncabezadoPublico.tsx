"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/solicitudes", texto: "Solicitudes" },
  { href: "/zhensis", texto: "Zhenshis" },
  { href: "/apuntes", texto: "Apuntes" },
  { href: "/buzon", texto: "Buzón" },
];

export function EncabezadoPublico() {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-marino/10 bg-arena/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setAbierto(false)}
        >
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={24}
            priority
            className="mix-blend-multiply"
          />
          <span className="font-titulos text-xl font-semibold text-marino">
            Lumen
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-tinta-suave sm:flex">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={ruta === enlace.href ? "page" : undefined}
              className={`transition-colors hover:text-marino ${
                ruta === enlace.href ? "text-marino" : ""
              }`}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <Link
          href="/pedir-ayuda"
          className="ml-auto inline-flex min-h-[44px] items-center rounded-suave bg-dorado px-4 text-sm font-semibold text-marino-hondo transition-colors hover:bg-dorado-hondo sm:ml-0"
        >
          Pedir ayuda
        </Link>

        <button
          type="button"
          onClick={() => setAbierto((previo) => !previo)}
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar el menú" : "Abrir el menú"}
          className="flex size-11 shrink-0 items-center justify-center rounded-suave border border-marino/20 text-marino transition-colors hover:bg-marino-tenue sm:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-5"
            aria-hidden="true"
          >
            {abierto ? (
              <>
                <path d="m5 5 14 14" />
                <path d="m19 5-14 14" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {abierto ? (
        <nav className="border-t border-marino/10 bg-white sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col px-5 py-1">
            {enlaces.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                onClick={() => setAbierto(false)}
                aria-current={ruta === enlace.href ? "page" : undefined}
                className={`flex min-h-[52px] items-center border-b border-marino/5 text-base font-medium last:border-b-0 ${
                  ruta === enlace.href ? "text-marino" : "text-tinta-suave"
                }`}
              >
                {enlace.texto}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
