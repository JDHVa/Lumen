"use client";

import { useActionState } from "react";
import { crearUsuario, type EstadoAlta } from "./acciones";

const estadoInicial: EstadoAlta = {};

export function FormularioAlta() {
  const [estado, accion, enviando] = useActionState(
    crearUsuario,
    estadoInicial,
  );

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-lg bg-white p-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Nombre
        <input
          name="nombre"
          required
          className="rounded-lg border border-marino/20 px-4 py-3 text-base outline-none focus:border-marino"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Usuario
        <input
          name="usuario"
          required
          autoCapitalize="none"
          className="rounded-lg border border-marino/20 px-4 py-3 text-base outline-none focus:border-marino"
        />
        <span className="text-xs font-normal text-marino/60">
          Con esto inicia sesión. No se usa ningún correo.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          name="contrasena"
          type="text"
          required
          minLength={8}
          className="rounded-lg border border-marino/20 px-4 py-3 text-base outline-none focus:border-marino"
        />
        <span className="text-xs font-normal text-marino/60">
          Mínimo 8 caracteres. Se guarda cifrada, así que anótala y entrégasela
          a la persona.
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Roles</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="es_zhensi" defaultChecked />
          Zhensi
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="es_admin" />
          Admin
        </label>
      </fieldset>

      {estado.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {estado.error}
        </p>
      ) : null}

      {estado.exito ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {estado.exito}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-marino px-5 py-3 font-medium text-white disabled:opacity-60"
      >
        {enviando ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
