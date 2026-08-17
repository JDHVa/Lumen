import Image from "next/image";
import Link from "next/link";

const enlaces = [
  { href: "/solicitudes", texto: "Solicitudes" },
  { href: "/zhensis", texto: "Zhensis" },
  { href: "/apuntes", texto: "Apuntes" },
  { href: "/buzon", texto: "Buzón" },
];

export function EncabezadoPublico() {
  return (
    <header className="sticky top-0 z-20 border-b border-marino/10 bg-arena/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
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
              className="transition-colors hover:text-marino"
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
      </div>
    </header>
  );
}
