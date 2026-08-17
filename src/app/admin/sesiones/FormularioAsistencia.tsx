"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { capturarAsistencia, type EstadoSesion } from "./acciones";

const estadoInicial: EstadoSesion = {};

export function FormularioAsistencia({
  sesionId,
  cantidadPrevia,
}: {
  sesionId: string;
  cantidadPrevia: number | null;
}) {
  const [estado, accion, enviando] = useActionState(
    capturarAsistencia,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="min-h-[40px] px-1 text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
      >
        {cantidadPrevia === null
          ? "Capturar asistencia"
          : "Corregir la asistencia"}
      </button>
    );
  }

  return (
    <form action={accion} className="flex w-full flex-col gap-3">
      <input type="hidden" name="id" value={sesionId} />

      <Campo
        etiqueta="¿Cuánta gente llegó?"
        name="cantidad"
        type="number"
        min={0}
        max={500}
        required
        defaultValue={cantidadPrevia ?? ""}
        ayuda="Solo el número. No se guarda quiénes fueron. Si nadie llegó, pon 0."
        className="max-w-[12rem]"
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar"}
        </Boton>
        <Boton
          type="button"
          variante="contorno"
          onClick={() => setAbierto(false)}
        >
          Cerrar
        </Boton>
      </div>
    </form>
  );
}
