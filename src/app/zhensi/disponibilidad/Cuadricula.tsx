"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import {
  CuadriculaHorarios,
  usarAlternadores,
} from "@/components/CuadriculaHorarios";
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

  const alternadores = usarAlternadores(setSeleccion);

  return (
    <form action={accion} className="flex flex-col gap-5">
      {[...seleccion].map((clave) => (
        <input key={clave} type="hidden" name="bloque" value={clave} />
      ))}

      <CuadriculaHorarios seleccion={seleccion} {...alternadores} />

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
