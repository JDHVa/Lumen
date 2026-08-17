"use client";

import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { DIAS, claveBloque } from "@/lib/horarios";

export function CuadriculaHorarios({
  seleccion,
  alCambiar,
  alCambiarDia,
}: {
  seleccion: Set<string>;
  alCambiar: (clave: string) => void;
  alCambiarDia: (claves: string[], completo: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {DIAS.map((dia) => {
        const claves = dia.bloques.map((bloque) =>
          claveBloque(dia.numero, bloque.inicio),
        );
        const cuantos = claves.filter((clave) => seleccion.has(clave)).length;
        const completo = cuantos === dia.bloques.length;

        return (
          <Tarjeta key={dia.numero} className="flex flex-col gap-3 py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-titulos text-lg font-semibold text-marino">
                {dia.nombre}
              </span>
              {dia.enLinea ? <Etiqueta tono="dorado">en línea</Etiqueta> : null}
              <button
                type="button"
                onClick={() => alCambiarDia(claves, completo)}
                className="ml-auto min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
              >
                {completo ? "Quitar el día" : "Todo el día"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {dia.bloques.map((bloque) => {
                const clave = claveBloque(dia.numero, bloque.inicio);
                const activo = seleccion.has(clave);

                return (
                  <button
                    key={clave}
                    type="button"
                    onClick={() => alCambiar(clave)}
                    aria-pressed={activo}
                    aria-label={`${dia.nombre} de ${bloque.etiqueta}`}
                    className={`min-h-[48px] rounded-suave border text-sm font-medium transition-colors duration-150 ${
                      activo
                        ? "border-marino bg-marino text-white"
                        : "border-marino/20 bg-white text-tinta-suave hover:border-marino/45 hover:text-marino"
                    }`}
                  >
                    {bloque.etiqueta}
                  </button>
                );
              })}
            </div>
          </Tarjeta>
        );
      })}
    </div>
  );
}

export function usarAlternadores(
  aplicar: (cambio: (previa: Set<string>) => Set<string>) => void,
) {
  return {
    alCambiar(clave: string) {
      aplicar((previa) => {
        const nueva = new Set(previa);
        if (nueva.has(clave)) nueva.delete(clave);
        else nueva.add(clave);
        return nueva;
      });
    },
    alCambiarDia(claves: string[], completo: boolean) {
      aplicar((previa) => {
        const nueva = new Set(previa);
        for (const clave of claves) {
          if (completo) nueva.delete(clave);
          else nueva.add(clave);
        }
        return nueva;
      });
    },
  };
}
