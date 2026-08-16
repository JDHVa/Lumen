import Image from "next/image";
import Link from "next/link";
import { FormularioEntrada } from "./FormularioEntrada";

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ regresar?: string }>;
}) {
  const parametros = await searchParams;
  const regresar = parametros.regresar ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/logo.png" alt="Lumen" width={140} height={75} priority />
        <h1 className="text-2xl font-semibold">Entrar a Lumen</h1>
        <p className="text-sm text-marino/70">
          Solo para zhensis y admin. Si buscas ayuda, no necesitas cuenta.
        </p>
      </div>

      <FormularioEntrada regresar={regresar} />

      <Link href="/" className="text-center text-sm underline">
        Volver al inicio
      </Link>
    </main>
  );
}
