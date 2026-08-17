"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { BotonSimple } from "@/components/ui/BotonAccion";
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
      <BotonSimple
        onClick={() => setAbierto(true)}
        className="self-start"
        tono={cantidadPrevia === null ? "afirmar" : "neutral"}
      >
        {cantidadPrevia === null
          ? "Capturar asistencia"
          : "Corregir la asistencia"}
      </BotonSimple>
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
