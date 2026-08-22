"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { reportarError, type EstadoReporte } from "./acciones";

const estadoInicial: EstadoReporte = {};

const enlace =
  "inline-flex min-h-[40px] items-center text-sm font-medium text-tinta-suave underline underline-offset-4 transition-colors hover:text-alerta";

export function ReportarError({
  solicitudId,
  yaReportada = false,
}: {
  solicitudId: string;
  yaReportada?: boolean;
}) {
  const [estado, accion, enviando] = useActionState(
    reportarError,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (yaReportada && !estado.exito && !estado.error) {
    return (
      <p className="text-sm text-tinta-suave">
        Ya avisaste que esta se mandó por error. Alguien de Lumen la va a
        revisar.
      </p>
    );
  }

  if (estado.exito) return <Aviso tono="exito">{estado.exito}</Aviso>;

  if (!abierto) {
    return (
      <button type="button" className={enlace} onClick={() => setAbierto(true)}>
        ¿Te equivocaste?
      </button>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-3">
      <input type="hidden" name="solicitud_id" value={solicitudId} />

      <p className="text-sm leading-relaxed text-tinta-suave">
        Si mandaste esta solicitud por error, avísanos y alguien de Lumen la va
        a revisar. Tú no tienes que hacer nada más.
      </p>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-[40px] items-center justify-center rounded-suave border border-alerta/30 bg-white px-3.5 text-sm font-medium text-alerta transition-colors hover:bg-alerta-tenue disabled:cursor-not-allowed disabled:opacity-55"
        >
          {enviando ? "Avisando…" : "Sí, la mandé por error"}
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
