"use client";

import { useActionState, useEffect, useRef } from "react";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Seccion } from "@/components/ui/Seccion";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import { cambiarMiContrasena, type EstadoClave } from "./contrasena";

const estadoInicial: EstadoClave = {};

export function MiContrasena() {
  const [estado, accion, enviando] = useActionState(
    cambiarMiContrasena,
    estadoInicial,
  );
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.exito) formulario.current?.reset();
  }, [estado.exito]);

  return (
    <Seccion
      titulo="Tu contraseña"
      descripcion="Cámbiala cuando quieras. Nadie más la puede ver, ni siquiera un admin."
    >
      <form ref={formulario} action={accion} className="flex flex-col gap-5">
        <Tarjeta elevada className="flex flex-col gap-5 p-6">
          <CampoContrasena
            etiqueta="La que usas ahorita"
            name="actual"
            required
            autoComplete="current-password"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <CampoContrasena
              etiqueta="La nueva"
              name="nueva"
              required
              minLength={8}
              autoComplete="new-password"
              ayuda="Mínimo 8 caracteres."
            />

            <CampoContrasena
              etiqueta="Escríbela otra vez"
              name="repetida"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <p className="text-sm leading-relaxed text-tinta-suave">
            Si se te olvida no hay forma de recuperarla: tendrías que pedirle a
            un admin que te ponga otra.
          </p>
        </Tarjeta>

        {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
        {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

        <Boton
          type="submit"
          variante="secundario"
          disabled={enviando}
          className="self-start"
        >
          {enviando ? "Cambiando…" : "Cambiar mi contraseña"}
        </Boton>
      </form>
    </Seccion>
  );
}
