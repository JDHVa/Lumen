import Image from "next/image";
import Link from "next/link";
import { Etiqueta } from "@/components/ui/Etiqueta";
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
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={38}
            height={20}
            className="mix-blend-multiply"
          />
          <span className="font-titulos text-lg font-semibold text-marino">
            Lumen
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm text-tinta-suave">{nombre}</span>
          <Etiqueta tono={zona === "admin" ? "dorado" : "marino"}>
            {zona === "admin" ? "admin" : "zhenshi"}
          </Etiqueta>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {esAdmin ? (
            <Link
              href={zona === "admin" ? "/zhensi" : "/admin"}
              className="inline-flex min-h-[40px] items-center rounded-suave bg-dorado px-3.5 text-sm font-semibold text-marino-hondo transition-colors hover:bg-dorado-hondo"
            >
              {zona === "admin" ? "Mi vista de zhenshi" : "Panel de administración"}
            </Link>
          ) : null}

          <form action={salir}>
            <button
              type="submit"
              className="min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 transition-colors hover:text-marino"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
