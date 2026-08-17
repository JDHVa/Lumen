import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";

export function EnConstruccion({
  titulo,
  descripcion,
  fase,
}: {
  titulo: string;
  descripcion: string;
  fase: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <div className="flex flex-col gap-3 pb-6">
          <Etiqueta tono="apagado">{fase}</Etiqueta>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          <p className="leading-relaxed text-tinta-suave">{descripcion}</p>
        </div>

        <Tarjeta className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="max-w-sm leading-relaxed text-tinta-suave">
            Esta pantalla todavía no está construida. Se entrega en la fase que
            marca la etiqueta de arriba.
          </p>
          <BotonEnlace href="/" variante="contorno">
            Volver al inicio
          </BotonEnlace>
        </Tarjeta>
      </main>

      <PiePublico />
    </div>
  );
}
