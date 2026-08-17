"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import { DIAS, claveBloque } from "@/lib/horarios";
import { crearSesionSuelta, type EstadoSesion } from "./acciones";

const estadoInicial: EstadoSesion = {};

export function FormularioSesion({
  zhensis,
}: {
  zhensis: { id: string; nombre: string }[];
}) {
  const [estado, accion, enviando] = useActionState(
    crearSesionSuelta,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <Boton
        type="button"
        variante="contorno"
        onClick={() => setAbierto(true)}
        className="self-start"
      >
        Crear una sesión a mano
      </Boton>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-5">
      <Tarjeta elevada className="flex flex-col gap-5 p-6">
        <p className="text-sm leading-relaxed text-tinta-suave">
          Esto salta el cruce automático: puedes elegir a quien sea y la hora
          que sea, aunque no la tenga marcada como libre. Úsalo cuando ya lo
          arreglaste con la persona por fuera.
        </p>

        <Selector etiqueta="Quién la da" name="zhensi_id" required>
          <option value="">Elige…</option>
          {zhensis.map((zhensi) => (
            <option key={zhensi.id} value={zhensi.id}>
              {zhensi.nombre}
            </option>
          ))}
        </Selector>

        <Campo etiqueta="Título de la sesión" name="titulo" required />

        <Selector etiqueta="Horario" name="bloque" required>
          <option value="">Elige…</option>
          {DIAS.map((dia) =>
            dia.bloques.map((bloque) => (
              <option
                key={claveBloque(dia.numero, bloque.inicio)}
                value={claveBloque(dia.numero, bloque.inicio)}
              >
                {dia.nombre} de {bloque.etiqueta}
              </option>
            )),
          )}
        </Selector>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo etiqueta="Fecha" name="fecha" type="date" required />
          <Campo etiqueta="Salón" name="salon" required placeholder="Aula 12" />
        </div>
      </Tarjeta>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando ? "Creando…" : "Crear sesión"}
        </Boton>
        <Boton
          type="button"
          variante="contorno"
          onClick={() => setAbierto(false)}
        >
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
