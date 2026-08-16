"use client";

import { useActionState, useEffect } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Selector } from "@/components/ui/Selector";
import { editarMateria, type EstadoCatalogo } from "./acciones";
import type { CarreraLista, MateriaLista } from "./tipos";

const estadoInicial: EstadoCatalogo = {};

export function FormularioMateria({
  materia,
  carreras,
  alTerminar,
}: {
  materia: MateriaLista;
  carreras: CarreraLista[];
  alTerminar: () => void;
}) {
  const [estado, accion, enviando] = useActionState(
    editarMateria,
    estadoInicial,
  );

  useEffect(() => {
    if (estado.exito) alTerminar();
  }, [estado.exito, alTerminar]);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={materia.id} />

      <Campo
        etiqueta="Nombre de la materia"
        name="nombre"
        required
        defaultValue={materia.nombre}
      />

      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <Selector
          etiqueta="Carrera"
          name="carrera_id"
          defaultValue={materia.carrera_id ?? "tronco"}
        >
          <option value="tronco">Tronco común</option>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>
              {carrera.clave} · {carrera.nombre}
            </option>
          ))}
        </Selector>

        <Campo
          etiqueta="Semestre"
          name="semestre"
          type="number"
          min={1}
          max={12}
          defaultValue={materia.semestre ?? ""}
          placeholder="Opcional"
        />
      </div>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" variante="secundario" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar cambios"}
        </Boton>
        <Boton type="button" variante="contorno" onClick={alTerminar}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
