"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { AreaTexto } from "@/components/ui/Selector";
import { responder, type EstadoRespuesta } from "./acciones";

const estadoInicial: EstadoRespuesta = {};

export type PreguntaVista = {
  id: string;
  texto: string;
  zhensi: string;
  respuestas: { id: string; texto: string }[];
  yaRespondi: boolean;
};

const enlace =
  "inline-flex min-h-[40px] items-center text-sm font-medium text-marino underline underline-offset-4 transition-colors hover:text-marino-claro";

function Responder({
  preguntaId,
  yaRespondi,
}: {
  preguntaId: string;
  yaRespondi: boolean;
}) {
  const [estado, accion, enviando] = useActionState(responder, estadoInicial);
  const [abierto, setAbierto] = useState(false);

  if (estado.exito) return <Aviso tono="exito">{estado.exito}</Aviso>;

  if (yaRespondi && !estado.error) {
    return (
      <p className="text-sm text-tinta-suave">
        Ya contestaste esta pregunta desde este celular.
      </p>
    );
  }

  if (!abierto) {
    return (
      <button type="button" className={enlace} onClick={() => setAbierto(true)}>
        Contestar esta pregunta
      </button>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-3">
      <input type="hidden" name="pregunta_id" value={preguntaId} />

      <AreaTexto
        etiqueta="Tu respuesta"
        name="texto"
        required
        maxLength={500}
        className="min-h-[5rem]"
        placeholder="Sobre todo la parte de derivadas por regla de la cadena."
        ayuda="No pedimos tu nombre. Se publica aquí mismo, sin decir quién la escribió."
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-[44px] items-center justify-center rounded-suave bg-marino px-4 text-sm font-semibold text-white transition-colors hover:bg-marino-claro disabled:cursor-not-allowed disabled:opacity-55"
        >
          {enviando ? "Mandando…" : "Mandar respuesta"}
        </button>
        <button
          type="button"
          className={enlace}
          onClick={() => setAbierto(false)}
        >
          Mejor no
        </button>
      </div>
    </form>
  );
}

export function Preguntas({
  preguntas,
  sePuedeContestar,
}: {
  preguntas: PreguntaVista[];
  sePuedeContestar: boolean;
}) {
  if (preguntas.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-suave bg-marino/5 p-4">
      <span className="text-xs font-semibold tracking-wide text-tinta-suave uppercase">
        {preguntas.length === 1
          ? "Un zhensi preguntó"
          : "Los zhensis preguntaron"}
      </span>

      {preguntas.map((pregunta) => (
        <div key={pregunta.id} className="flex flex-col gap-2.5">
          <p className="leading-relaxed break-words text-marino">
            <span className="font-medium">{pregunta.zhensi}:</span>{" "}
            {pregunta.texto}
          </p>

          {pregunta.respuestas.map((respuesta) => (
            <p
              key={respuesta.id}
              className="border-l-2 border-dorado pl-3 text-sm leading-relaxed break-words text-tinta-suave"
            >
              {respuesta.texto}
            </p>
          ))}

          {sePuedeContestar ? (
            <Responder
              preguntaId={pregunta.id}
              yaRespondi={pregunta.yaRespondi}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
