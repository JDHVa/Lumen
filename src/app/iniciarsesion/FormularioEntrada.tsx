"use client";

import { useActionState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { entrar, type EstadoEntrada } from "./acciones";

const estadoInicial: EstadoEntrada = {};

export function FormularioEntrada({ regresar }: { regresar: string }) {
  const [estado, accion, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={accion} className="flex w-full flex-col gap-5">
      <input type="hidden" name="regresar" value={regresar} />

      <Campo
        etiqueta="Usuario"
        name="usuario"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
      />

      <Campo
        etiqueta="Contraseña"
        name="contrasena"
        type="password"
        autoComplete="current-password"
        required
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <Boton type="submit" variante="secundario" tamano="grande" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Boton>
    </form>
  );
}
