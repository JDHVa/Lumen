"use client";

import { useActionState, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { BotonAccion, BotonSimple } from "@/components/ui/BotonAccion";
import { rechazarApunte, type EstadoRechazo } from "./acciones";

const estadoInicial: EstadoRechazo = {};

export function Rechazo({ id }: { id: string }) {
  const [estado, accion, enviando] = useActionState(
    rechazarApunte,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <BotonSimple tono="peligro" onClick={() => setAbierto(true)}>
        Rechazar
      </BotonSimple>
    );
  }

  return (
    <form action={accion} className="flex w-full flex-col gap-3">
      <input type="hidden" name="id" value={id} />

      <Campo
        etiqueta="¿Por qué lo rechazas?"
        name="motivo"
        required
        maxLength={300}
        placeholder="Está borroso y no se alcanza a leer."
        ayuda="Quien lo subió va a ver este mensaje, así que sé claro y amable."
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="flex flex-wrap gap-2">
        <BotonAccion type="submit" tono="peligro" disabled={enviando}>
          Confirmar el rechazo
        </BotonAccion>
        <BotonSimple onClick={() => setAbierto(false)}>Cancelar</BotonSimple>
      </div>
    </form>
  );
}
