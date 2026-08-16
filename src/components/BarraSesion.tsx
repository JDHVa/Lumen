import Image from "next/image";
import Link from "next/link";
import { salir } from "@/lib/acciones-sesion";

export function BarraSesion({
  nombre,
  esAdmin,
  zona,
}: {
  nombre: string;
  esAdmin: boolean;
  zona: "zhensi" | "admin";
}) {
  return (
    <header className="border-b border-marino/10 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Lumen" width={40} height={22} />
          <span className="font-semibold">Lumen</span>
        </Link>

        <span className="text-sm text-marino/70">{nombre}</span>

        <div className="ml-auto flex items-center gap-2">
          {esAdmin ? (
            <Link
              href={zona === "admin" ? "/zhensi" : "/admin"}
              className="rounded-lg bg-dorado px-3 py-2 text-sm font-medium text-marino"
            >
              {zona === "admin" ? "Mi vista de zhensi" : "Panel de administración"}
            </Link>
          ) : null}

          <form action={salir}>
            <button type="submit" className="text-sm underline">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
