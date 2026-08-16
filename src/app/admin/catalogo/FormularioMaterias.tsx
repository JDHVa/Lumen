"use client";

import { useActionState, useRef, useEffect } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Selector, AreaTexto } from "@/components/ui/Selector";
import { crearMaterias, type EstadoCatalogo } from "./acciones";
import type { CarreraLista } from "./tipos";

const estadoInicial: EstadoCatalogo = {};

export function FormularioMaterias({
  carreras,
  carreraElegida,
}: {
  carreras: CarreraLista[];
  carreraElegida: string;
}) {
  const [estado, accion, enviando] = useActionState(
    crearMaterias,
    estadoInicial,
  );
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.exito) formulario.current?.reset();
  }, [estado.exito]);

  return (
    <form ref={formulario} action={accion} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <Selector
          etiqueta="Carrera"
          name="carrera_id"
          defaultValue={carreraElegida}
          key={carreraElegida}
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
          placeholder="Opcional"
        />
      </div>

      <AreaTexto
        etiqueta="Materias"
        name="nombres"
        required
        placeholder={"Cálculo Diferencial\nProgramación Estructurada\nFísica I"}
        ayuda="Una por renglón. Puedes pegar la lista completa de un jalón y se guardan todas juntas."
      />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton type="submit" variante="secundario" disabled={enviando}>
        {enviando ? "Guardando…" : "Agregar materias"}
      </Boton>
    </form>
  );
}
