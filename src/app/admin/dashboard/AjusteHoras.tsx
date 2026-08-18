"use client";

import { useActionState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import { agregarHoras, type EstadoAjuste } from "./acciones";

const estadoInicial: EstadoAjuste = {};

export function AjusteHoras({
  zhensis,
}: {
  zhensis: { id: string; nombre: string }[];
}) {
  const [estado, accion, enviando] = useActionState(
    agregarHoras,
    estadoInicial,
  );

  return (
    <form action={accion} className="flex flex-col gap-5">
      <Tarjeta elevada className="flex flex-col gap-5 p-6">
        <p className="text-sm leading-relaxed text-tinta-suave">
          Úsalo cuando la sesión duró distinto de lo que dice el horario, por
          ejemplo de 1 a 3. Pon un número negativo para restar.
        </p>

        <Selector etiqueta="A quién" name="zhensi_id" required>
          <option value="">Elige…</option>
          {zhensis.map((zhensi) => (
            <option key={zhensi.id} value={zhensi.id}>
              {zhensi.nombre}
            </option>
          ))}
        </Selector>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            etiqueta="Horas"
            name="horas"
            type="number"
            step="0.25"
            min={-12}
            max={12}
            required
            placeholder="2"
          />
          <Campo
            etiqueta="Por qué"
            name="motivo"
            required
            placeholder="Sesión de 1 a 3"
          />
        </div>
      </Tarjeta>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton
        type="submit"
        variante="secundario"
        disabled={enviando}
        className="self-start"
      >
        {enviando ? "Guardando…" : "Agregar horas"}
      </Boton>
    </form>
  );
}
