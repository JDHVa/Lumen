"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { AreaTexto } from "@/components/ui/Selector";
import { preguntar, borrarPregunta, type EstadoPregunta } from "./acciones";

const estadoInicial: EstadoPregunta = {};

export type PreguntaMia = {
  id: string;
  texto: string;
  zhensi: string;
  esMia: boolean;
  respuestas: { id: string; texto: string }[];
};

export function Preguntas({
  solicitudId,
  preguntas,
}: {
  solicitudId: string;
  preguntas: PreguntaMia[];
}) {
  const [estado, accion, enviando] = useActionState(preguntar, estadoInicial);
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {preguntas.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-suave bg-marino/5 p-4">
          {preguntas.map((pregunta) => (
            <div key={pregunta.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                <p className="flex-1 leading-relaxed break-words text-marino">
                  <span className="font-medium">
                    {pregunta.esMia ? "Tú" : pregunta.zhensi}:
                  </span>{" "}
                  {pregunta.texto}
                </p>
                {pregunta.esMia && pregunta.respuestas.length === 0 ? (
                  <form action={borrarPregunta}>
                    <input
                      type="hidden"
                      name="pregunta_id"
                      value={pregunta.id}
                    />
                    <BotonAccion type="submit" tono="peligro">
                      Borrar
                    </BotonAccion>
                  </form>
                ) : null}
              </div>

              {pregunta.respuestas.length === 0 ? (
                <span className="text-sm text-tinta-suave">
                  Todavía nadie contesta.
                </span>
              ) : (
                pregunta.respuestas.map((respuesta) => (
                  <p
                    key={respuesta.id}
                    className="border-l-2 border-dorado pl-3 text-sm leading-relaxed break-words text-tinta-suave"
                  >
                    {respuesta.texto}
                  </p>
                ))
              )}
            </div>
          ))}
        </div>
      ) : null}

      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      {abierto ? (
        <form action={accion} className="flex flex-col gap-3">
          <input type="hidden" name="solicitud_id" value={solicitudId} />

          <AreaTexto
            etiqueta="Tu pregunta"
            name="texto"
            required
            maxLength={300}
            className="min-h-[5rem]"
            placeholder="¿Qué temas en específico quieres ver? ¿Ya viste el tema en clase o empezamos desde cero?"
            ayuda="Se publica en el tablero. Cualquiera puede contestarla sin cuenta, así que no pidas datos personales."
          />

          {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

          <div className="flex flex-wrap gap-2">
            <Boton type="submit" variante="contorno" disabled={enviando}>
              {enviando ? "Mandando…" : "Publicar pregunta"}
            </Boton>
            <Boton
              type="button"
              variante="texto"
              onClick={() => setAbierto(false)}
            >
              Mejor no
            </Boton>
          </div>
        </form>
      ) : (
        <Boton
          type="button"
          variante="contorno"
          onClick={() => setAbierto(true)}
        >
          Preguntar algo
        </Boton>
      )}
    </div>
  );
}
