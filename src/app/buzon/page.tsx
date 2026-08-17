import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { FormularioBuzon } from "./FormularioBuzon";

export const dynamic = "force-dynamic";

export default function PaginaBuzon() {
  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <div className="flex flex-col gap-2 pb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Buzón</h1>
          <p className="leading-relaxed text-tinta-suave">
            Para decirnos lo que sea: que algo se puede hacer mejor, que alguien
            te ayudó, o que no la estás pasando bien. No pedimos tu nombre.
          </p>
        </div>

        <FormularioBuzon />
      </main>

      <PiePublico />
    </div>
  );
}
