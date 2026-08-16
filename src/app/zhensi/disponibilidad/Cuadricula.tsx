"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { DIAS, claveBloque, buscarDia } from "@/lib/horarios";
import { Etiqueta } from "@/components/ui/Etiqueta";
import {
  guardarDisponibilidad,
  type EstadoDisponibilidad,
} from "./acciones";

const estadoInicial: EstadoDisponibilidad = {};

export function Cuadricula({ marcados }: { marcados: string[] }) {
  const [seleccion, setSeleccion] = useState(() => new Set(marcados));
  const [estado, accion, enviando] = useActionState(
    guardarDisponibilidad,
    estadoInicial,
  );

  function alternar(clave: string) {
    setSeleccion((previa) => {
      const nueva = new Set(previa);
      if (nueva.has(clave)) nueva.delete(clave);
      else nueva.add(clave);
      return nueva;
    });
  }

  function alternarDia(dia: number) {
    const bloques = buscarDia(dia)?.bloques ?? [];
    const claves = bloques.map((bloque) => claveBloque(dia, bloque.inicio));
    const completo = claves.every((clave) => seleccion.has(clave));
    setSeleccion((previa) => {
      const nueva = new Set(previa);
      for (const clave of claves) {
        if (completo) nueva.delete(clave);
        else nueva.add(clave);
      }
      return nueva;
    });
  }

  return (
    <form action={accion} className="flex flex-col gap-5">
      {[...seleccion].map((clave) => (
        <input key={clave} type="hidden" name="bloque" value={clave} />
      ))}

      <div className="flex flex-col gap-3">
        {DIAS.map((dia) => {
          const claves = dia.bloques.map((bloque) =>
            claveBloque(dia.numero, bloque.inicio),
          );
          const cuantos = claves.filter((clave) => seleccion.has(clave)).length;

          return (
            <Tarjeta key={dia.numero} className="flex flex-col gap-3 py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-titulos text-lg font-semibold text-marino">
                  {dia.nombre}
                </span>
                {dia.enLinea ? (
                  <Etiqueta tono="dorado">en línea</Etiqueta>
                ) : null}
                <button
                  type="button"
                  onClick={() => alternarDia(dia.numero)}
                  className="ml-auto min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
                >
                  {cuantos === dia.bloques.length
                    ? "Quitar el día"
                    : "Todo el día"}
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
                      onClick={() => alternar(clave)}
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

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-tarjeta border border-marino/10 bg-white/95 p-4 shadow-elevada backdrop-blur">
        <span className="text-sm text-tinta-suave">
          {seleccion.size === 1
            ? "1 bloque marcado"
            : `${seleccion.size} bloques marcados`}
        </span>
        <Boton
          type="submit"
          variante="secundario"
          disabled={enviando}
          className="ml-auto"
        >
          {enviando ? "Guardando…" : "Guardar disponibilidad"}
        </Boton>
      </div>
    </form>
  );
}
