"use client";

import { useState } from "react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { DIAS, claveBloque, etiquetaDeBloque, nombreDia } from "@/lib/horarios";

const tonos = [
  "border-marino/15 bg-white text-tinta-suave",
  "border-marino/20 bg-marino/10 text-marino",
  "border-marino/25 bg-marino/25 text-marino",
  "border-marino/35 bg-marino/45 text-white",
  "border-marino/45 bg-marino/70 text-white",
  "border-marino bg-marino text-white",
];

function tonoDe(cuantos: number, tope: number) {
  if (cuantos === 0) return tonos[0];
  const escalon = Math.ceil((cuantos / tope) * (tonos.length - 1));
  return tonos[Math.min(escalon, tonos.length - 1)];
}

export function MapaCalor({
  disponibilidades,
}: {
  disponibilidades: { dia_semana: number; hora_inicio: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = useState<string | null>(null);

  const nombres = new Map<string, string[]>();

  for (const una of disponibilidades) {
    const clave = claveBloque(una.dia_semana, una.hora_inicio);
    const previos = nombres.get(clave) ?? [];
    previos.push(una.nombre);
    nombres.set(clave, previos);
  }

  for (const lista of nombres.values()) {
    lista.sort((a, b) => a.localeCompare(b, "es"));
  }

  const tope = Math.max(1, ...[...nombres.values()].map((lista) => lista.length));

  const lista = abierto ? (nombres.get(abierto) ?? []) : [];

  return (
    <div className="flex flex-col gap-3">
      {DIAS.map((dia) => (
        <Tarjeta key={dia.numero} className="flex flex-col gap-3 py-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-titulos text-lg font-semibold text-marino">
              {dia.nombre}
            </span>
            {dia.enLinea ? <Etiqueta tono="dorado">en línea</Etiqueta> : null}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {dia.bloques.map((bloque) => {
              const clave = claveBloque(dia.numero, bloque.inicio);
              const quienes = nombres.get(clave) ?? [];
              const activo = abierto === clave;

              return (
                <div key={clave} className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setAbierto(clave)}
                    onMouseLeave={() =>
                      setAbierto((previo) => (previo === clave ? null : previo))
                    }
                    onFocus={() => setAbierto(clave)}
                    onBlur={() =>
                      setAbierto((previo) => (previo === clave ? null : previo))
                    }
                    onClick={() =>
                      setAbierto((previo) => (previo === clave ? null : clave))
                    }
                    aria-expanded={activo}
                    aria-label={`${dia.nombre} de ${bloque.etiqueta}: ${
                      quienes.length
                    } ${quienes.length === 1 ? "zhenshi" : "zhenshis"}`}
                    className={`flex min-h-[62px] w-full flex-col items-center justify-center gap-0.5 rounded-suave border transition-colors duration-150 ${tonoDe(
                      quienes.length,
                      tope,
                    )} ${activo ? "ring-2 ring-dorado" : ""}`}
                  >
                    <span className="font-titulos text-lg font-semibold">
                      {quienes.length}
                    </span>
                    <span className="text-xs opacity-80">
                      {bloque.etiqueta}
                    </span>
                  </button>

                  {activo && quienes.length > 0 ? (
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-48 -translate-x-1/2 rounded-suave border border-marino/20 bg-white p-3 text-left shadow-tarjeta">
                      <span className="block text-xs font-semibold text-marino">
                        {dia.nombre} de {bloque.etiqueta}
                      </span>
                      <ul className="mt-1.5 flex flex-col gap-0.5">
                        {quienes.map((nombre) => (
                          <li
                            key={nombre}
                            className="truncate text-sm text-tinta"
                          >
                            {nombre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Tarjeta>
      ))}

      {abierto ? (
        <p className="text-sm text-tinta-suave sm:hidden">
          {nombreDia(Number(abierto.split("|")[0]))} de{" "}
          {etiquetaDeBloque(
            Number(abierto.split("|")[0]),
            abierto.split("|")[1],
          )}
          : {lista.length === 0 ? "nadie puede" : lista.join(", ")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-xs text-tinta-suave">
        <span>Nadie</span>
        {tonos.map((tono, indice) => (
          <span
            key={indice}
            className={`size-5 rounded-suave border ${tono}`}
            aria-hidden
          />
        ))}
        <span>{tope === 1 ? "1 zhenshi" : `${tope} zhenshis`}</span>
      </div>
    </div>
  );
}
