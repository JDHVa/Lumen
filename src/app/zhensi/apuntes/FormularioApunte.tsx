"use client";

import { useActionState, useMemo, useRef, useState, useEffect } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import type { CarreraLista, MateriaLista } from "@/app/admin/catalogo/tipos";
import { subirApunte, type EstadoApunte } from "./acciones";

const estadoInicial: EstadoApunte = {};

export function FormularioApunte({
  carreras,
  materias,
  carreraPropia,
}: {
  carreras: CarreraLista[];
  materias: MateriaLista[];
  carreraPropia: string | null;
}) {
  const [estado, accion, enviando] = useActionState(
    subirApunte,
    estadoInicial,
  );
  const [carreraVista, setCarreraVista] = useState(
    carreraPropia ?? carreras[0]?.id ?? "",
  );
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.exito) formulario.current?.reset();
  }, [estado.exito]);

  const disponibles = useMemo(
    () =>
      materias.filter(
        (materia) =>
          materia.carrera_id === null || materia.carrera_id === carreraVista,
      ),
    [materias, carreraVista],
  );

  return (
    <form ref={formulario} action={accion} className="flex flex-col gap-5">
      <Tarjeta elevada className="flex flex-col gap-5 p-6">
        <Campo
          etiqueta="Título"
          name="titulo"
          required
          maxLength={140}
          placeholder="Resumen del segundo parcial"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Selector
            etiqueta="Ver materias de"
            value={carreraVista}
            onChange={(evento) => setCarreraVista(evento.target.value)}
          >
            {carreras.map((carrera) => (
              <option key={carrera.id} value={carrera.id}>
                {carrera.clave} · {carrera.nombre}
              </option>
            ))}
          </Selector>

          <Campo
            etiqueta="Generación"
            name="generacion"
            placeholder="2024"
            ayuda="Opcional. Sirve para saber qué tan viejo es."
          />
        </div>

        <Selector etiqueta="Materia" name="materia_id" required>
          <option value="">Elige una…</option>
          {disponibles.map((materia) => (
            <option key={materia.id} value={materia.id}>
              {materia.nombre}
              {materia.carrera_id === null ? " (tronco común)" : ""}
            </option>
          ))}
        </Selector>

        <Campo
          etiqueta="El archivo"
          name="archivo"
          type="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          className="py-2.5 file:mr-3 file:rounded-suave file:border-0 file:bg-marino file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          ayuda="PDF, foto, Word, Excel o PowerPoint. Máximo 10 MB."
        />
      </Tarjeta>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton type="submit" variante="secundario" disabled={enviando}>
        {enviando ? "Subiendo…" : "Subir apunte"}
      </Boton>
    </form>
  );
}
