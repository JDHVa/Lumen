"use client";

import { useActionState, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { BotonSimple } from "@/components/ui/BotonAccion";
import { borrarCuenta, type EstadoCuenta } from "./acciones";

const estadoInicial: EstadoCuenta = {};

export function BorrarCuenta({
  id,
  nombre,
  usuario,
}: {
  id: string;
  nombre: string;
  usuario: string;
}) {
  const [estado, accion, enviando] = useActionState(
    borrarCuenta,
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
          Vas a borrar la cuenta de <strong>{nombre}</strong> para siempre, con
          su perfil, su foto, sus materias y sus horarios.{" "}
          <strong>Esto no se puede deshacer.</strong> Si solo quieres que deje
          de aparecer, archívala.
        </p>

        <Campo
          etiqueta={`Escribe ${usuario} para confirmar`}
          name="confirmacion"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={usuario}
        />

        {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
        {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

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
