"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { BotonSimple } from "@/components/ui/BotonAccion";
import { borrarSolicitud, type EstadoBorrado } from "./acciones";

const estadoInicial: EstadoBorrado = {};

export function BorrarSolicitud({
  id,
  codigo,
  apoyos,
}: {
  id: string;
  codigo: string;
  apoyos: number;
}) {
  const [estado, accion, enviando] = useActionState(
    borrarSolicitud,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <BotonSimple tono="peligro" onClick={() => setAbierto(true)}>
        Borrar
      </BotonSimple>
    );
  }

  return (
    <form action={accion} className="w-full">
      <input type="hidden" name="id" value={id} />

      <Tarjeta className="flex flex-col gap-4 border-alerta/40 bg-alerta-tenue py-5">
        <p className="text-sm leading-relaxed text-tinta">
          Vas a borrar la solicitud <strong>{codigo}</strong> para siempre, con
          sus {apoyos === 1 ? "1 apoyo" : `${apoyos} apoyos`}.{" "}
          <strong>Esto no se puede deshacer.</strong> Si solo quieres que deje
          de verse en la lista, ocúltala.
        </p>

        {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" variante="secundario" disabled={enviando}>
            {enviando ? "Borrando…" : "Borrarla para siempre"}
          </Boton>
          <Boton
            type="button"
            variante="contorno"
            onClick={() => setAbierto(false)}
          >
            Mejor no
          </Boton>
        </div>
      </Tarjeta>
    </form>
  );
}
