"use client";

import { useActionState, useEffect } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { crearCarrera, editarCarrera, type EstadoCatalogo } from "./acciones";
import type { CarreraLista } from "./tipos";

const estadoInicial: EstadoCatalogo = {};

export function FormularioCarrera({
  carrera,
  alTerminar,
}: {
  carrera?: CarreraLista;
  alTerminar?: () => void;
}) {
  const enEdicion = Boolean(carrera);
  const [estado, accion, enviando] = useActionState(
    enEdicion ? editarCarrera : crearCarrera,
    estadoInicial,
  );

  useEffect(() => {
    if (estado.exito && enEdicion) alTerminar?.();
  }, [estado.exito, enEdicion, alTerminar]);

  return (
    <form action={accion} className="flex flex-col gap-4">
      {carrera ? <input type="hidden" name="id" value={carrera.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Campo
          etiqueta="Nombre de la carrera"
          name="nombre"
          required
          defaultValue={carrera?.nombre}
          placeholder="Ingeniería en Sistemas Computacionales"
        />
        <Campo
          etiqueta="Clave"
          name="clave"
          required
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={carrera?.clave}
          placeholder="ISC"
          className="uppercase"
        />
      </div>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito && !enEdicion ? (
        <Aviso tono="exito">{estado.exito}</Aviso>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando
            ? "Guardando…"
            : enEdicion
              ? "Guardar cambios"
              : "Agregar carrera"}
        </Boton>
        {enEdicion ? (
          <Boton type="button" variante="contorno" onClick={alTerminar}>
            Cancelar
          </Boton>
        ) : null}
      </div>
    </form>
  );
}
