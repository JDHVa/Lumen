"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import { BotonSimple } from "@/components/ui/BotonAccion";
import { cambiarContrasena, type EstadoAlta } from "./acciones";

const estadoInicial: EstadoAlta = {};

const LETRAS = "abcdefghijkmnpqrstuvwxyz";
const MAYUSCULAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMEROS = "23456789";

function sugerir() {
  const todo = LETRAS + MAYUSCULAS + NUMEROS;
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return [...bytes].map((n) => todo[n % todo.length]).join("");
}

export function CambioContrasena({
  id,
  nombre,
  esTuya,
}: {
  id: string;
  nombre: string;
  esTuya: boolean;
}) {
  const [estado, accion, enviando] = useActionState(
    cambiarContrasena,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);
  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");

  if (!abierto) {
    return (
      <BotonSimple onClick={() => setAbierto(true)}>
        Cambiar su contraseña
      </BotonSimple>
    );
  }

  return (
    <form action={accion} className="w-full">
      <input type="hidden" name="id" value={id} />

      <Tarjeta className="flex flex-col gap-4 border-marino/25 py-5">
        <p className="text-sm leading-relaxed text-tinta-suave">
          {esTuya
            ? "Vas a cambiar tu propia contraseña. Si te equivocas y no la anotas, te quedas fuera."
            : `Vas a cambiar la contraseña de ${nombre}. No hay forma de avisarle: se la tienes que dar tú.`}
        </p>

        <CampoContrasena
          etiqueta="Contraseña nueva"
          name="contrasena"
          visibleInicial
          required
          minLength={8}
          autoComplete="new-password"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          ayuda="Mínimo 8 caracteres."
        />

        <CampoContrasena
          etiqueta="Escríbela otra vez"
          name="repetida"
          visibleInicial
          required
          minLength={8}
          autoComplete="new-password"
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
        />

        <BotonSimple
          onClick={() => {
            const nueva = sugerir();
            setContrasena(nueva);
            setRepetida(nueva);
          }}
          className="self-start"
        >
          Inventar una
        </BotonSimple>

        {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
        {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" variante="secundario" disabled={enviando}>
            {enviando ? "Cambiando…" : "Guardar la contraseña"}
          </Boton>
          <Boton
            type="button"
            variante="contorno"
            onClick={() => {
              setAbierto(false);
              setContrasena("");
              setRepetida("");
            }}
          >
            Cerrar
          </Boton>
        </div>
      </Tarjeta>
    </form>
  );
}
