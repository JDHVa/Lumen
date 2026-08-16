import Image from "next/image";
import Link from "next/link";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { FormularioEntrada } from "./FormularioEntrada";

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ regresar?: string }>;
}) {
  const parametros = await searchParams;
  const regresar = parametros.regresar ?? "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-7 px-5 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Lumen"
            width={160}
            height={86}
            priority
            className="h-auto w-32 mix-blend-multiply"
          />
        </Link>
        <h1 className="text-3xl font-bold">Entrar a Lumen</h1>
        <p className="leading-relaxed text-tinta-suave">
          Solo para zhensis y admin. Si buscas ayuda, no necesitas cuenta.
        </p>
      </div>

      <Tarjeta elevada className="p-6">
        <FormularioEntrada regresar={regresar} />
      </Tarjeta>

      <Link
        href="/"
        className="text-center text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
