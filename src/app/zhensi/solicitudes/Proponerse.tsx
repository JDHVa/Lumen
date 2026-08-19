"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { AreaTexto } from "@/components/ui/Selector";
import {
  proponerse,
  retirarPropuesta,
  type EstadoPropuesta,
} from "./acciones";

const estadoInicial: EstadoPropuesta = {};

export function Proponerse({
  solicitudId,
  yaPropuesto,
}: {
  solicitudId: string;
  yaPropuesto: boolean;
}) {
  const [estado, accion, enviando] = useActionState(
    proponerse,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (yaPropuesto) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm font-medium text-exito">
          Ya te propusiste para esta. Falta que el admin la agende.
        </p>
        <form action={retirarPropuesta}>
          <input type="hidden" name="solicitud_id" value={solicitudId} />
          <BotonAccion type="submit" tono="peligro">
            Retirar
          </BotonAccion>
        </form>
      </div>
    );
  }

  if (estado.exito) return <Aviso tono="exito">{estado.exito}</Aviso>;

  if (!abierto) {
    return (
      <Boton
        type="button"
        variante="secundario"
        onClick={() => setAbierto(true)}
      >
        Yo puedo darla
      </Boton>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="solicitud_id" value={solicitudId} />

      <AreaTexto
        etiqueta="Recado para el admin"
        name="mensaje"
        maxLength={300}
        className="min-h-[6rem]"
        placeholder="Opcional. Por ejemplo: puedo el martes temprano, o ya di este tema antes."
        ayuda="Solo lo lee el admin. Nadie del público lo ve."
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando ? "Mandando…" : "Proponerme"}
        </Boton>
        <Boton
          type="button"
          variante="contorno"
          onClick={() => setAbierto(false)}
        >
          Mejor no
        </Boton>
      </div>
    </form>
  );
}
