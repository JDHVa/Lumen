import Link from "next/link";

export function PiePublico() {
  return (
    <footer className="mt-16 border-t border-marino/10 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-tinta-suave sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm leading-relaxed">
          Lumen es una red de apoyo académico entre pares. No es un servicio de
          atención psicológica.
        </p>
        <Link href="/privacidad" className="underline underline-offset-4">
          Aviso de privacidad
        </Link>
      </div>
    </footer>
  );
}
