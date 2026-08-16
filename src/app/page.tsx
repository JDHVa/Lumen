import Image from "next/image";
import Link from "next/link";

export default function PaginaInicio() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Image src="/logo.png" alt="Lumen" width={180} height={96} priority />
      <h1 className="text-3xl font-semibold">Lumen</h1>
      <p className="text-marino/80">
        Red de apoyo estudiantil. Alumnos que ayudan a otros alumnos.
      </p>
      <p className="rounded-lg bg-white px-4 py-3 text-sm text-marino/70 shadow-sm">
        Las sesiones de la semana, el tablero de solicitudes y la galería de
        zhensis aparecerán aquí en las siguientes fases.
      </p>
      <Link
        href="/entrar"
        className="rounded-lg bg-marino px-5 py-3 font-medium text-white"
      >
        Entrar
      </Link>
    </main>
  );
}
