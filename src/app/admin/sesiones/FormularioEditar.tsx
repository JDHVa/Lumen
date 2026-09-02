"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Selector } from "@/components/ui/Selector";
import { BotonSimple } from "@/components/ui/BotonAccion";
import { DIAS, claveBloque } from "@/lib/horarios";
import { editarSesion, type EstadoSesion } from "./acciones";

const estadoInicial: EstadoSesion = {};

export function FormularioEditar({
  sesion,
  zhensis,
}: {
  sesion: {
    id: string;
    zhensi_id: string;
    titulo: string;
    fecha: string;
    bloque: string;
    salon: string;
    notas_publicas: string | null;
  };
  zhensis: { id: string; nombre: string }[];
}) {
  const [estado, accion, enviando] = useActionState(
    editarSesion,
    estadoInicial,
  );
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <BotonSimple
        onClick={() => setAbierto(true)}
        className="self-start"
        tono="neutral"
      >
        Editar
      </BotonSimple>
    );
  }

  return (
    <form action={accion} className="flex w-full flex-col gap-4">
      <input type="hidden" name="id" value={sesion.id} />

      <Selector
        etiqueta="Quién la da"
        name="zhensi_id"
        required
        defaultValue={sesion.zhensi_id}
      >
        {zhensis.map((z) => (
          <option key={z.id} value={z.id}>
            {z.nombre}
          </option>
        ))}
      </Selector>

      <Campo
        etiqueta="Título"
        name="titulo"
        required
        defaultValue={sesion.titulo}
      />

      <Selector
        etiqueta="Horario"
        name="bloque"
        required
        defaultValue={sesion.bloque}
      >
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Fecha"
          name="fecha"
          type="date"
          required
          defaultValue={sesion.fecha}
        />
        <Campo
          etiqueta="Salón"
          name="salon"
          required
          defaultValue={sesion.salon}
        />
      </div>

      <Campo
        etiqueta="Notas públicas (opcional)"
        name="notas_publicas"
        defaultValue={sesion.notas_publicas ?? ""}
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar cambios"}
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
