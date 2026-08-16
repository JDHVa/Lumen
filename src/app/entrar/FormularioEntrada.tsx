"use client";

import { useActionState } from "react";
import { entrar, type EstadoEntrada } from "./acciones";

const estadoInicial: EstadoEntrada = {};

export function FormularioEntrada({ regresar }: { regresar: string }) {
  const [estado, accion, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={accion} className="flex w-full flex-col gap-4">
      <input type="hidden" name="regresar" value={regresar} />

      <label className="flex flex-col gap-1 text-sm font-medium">
        Usuario
        <input
          name="usuario"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="rounded-lg border border-marino/20 bg-white px-4 py-3 text-base outline-none focus:border-marino"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-marino/20 bg-white px-4 py-3 text-base outline-none focus:border-marino"
        />
      </label>

      {estado.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {estado.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-marino px-5 py-3 font-medium text-white disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
