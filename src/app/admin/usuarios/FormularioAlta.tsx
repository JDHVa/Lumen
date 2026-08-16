"use client";

import { useActionState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo, Casilla } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { crearUsuario, type EstadoAlta } from "./acciones";

const estadoInicial: EstadoAlta = {};

export function FormularioAlta() {
  const [estado, accion, enviando] = useActionState(
    crearUsuario,
    estadoInicial,
  );

  return (
    <form action={accion} className="flex flex-col gap-5">
      <Campo etiqueta="Nombre" name="nombre" required placeholder="Ana Ruiz" />

      <Campo
        etiqueta="Usuario"
        name="usuario"
        required
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="ana.ruiz"
        ayuda="Con esto inicia sesión. No se usa ningún correo."
      />

      <Campo
        etiqueta="Contraseña"
        name="contrasena"
        type="text"
        required
        minLength={8}
        ayuda="Mínimo 8 caracteres. Se guarda cifrada, así que anótala y entrégasela a la persona."
      />

      <fieldset className="flex flex-col gap-2.5">
        <legend className="pb-2 text-sm font-semibold text-marino">Roles</legend>
        <Casilla
          name="es_zhensi"
          defaultChecked
          etiqueta="Zhensi"
          ayuda="Da sesiones y captura su disponibilidad."
        />
        <Casilla
          name="es_admin"
          etiqueta="Admin"
          ayuda="Además coordina, asigna sesiones y entra al panel."
        />
      </fieldset>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton type="submit" variante="secundario" disabled={enviando}>
        {enviando ? "Creando…" : "Crear cuenta"}
      </Boton>
    </form>
  );
}
