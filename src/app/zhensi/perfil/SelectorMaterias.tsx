"use client";

import { useMemo, useState } from "react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import type { CarreraLista, MateriaLista } from "@/app/admin/catalogo/tipos";

export function SelectorMaterias({
  carreras,
  materias,
  seleccionadas,
  alCambiar,
}: {
  carreras: CarreraLista[];
  materias: MateriaLista[];
  seleccionadas: Set<string>;
  alCambiar: (id: string) => void;
}) {
  const [carreraVista, setCarreraVista] = useState(carreras[0]?.id ?? "");

  const tronco = useMemo(
    () => materias.filter((materia) => materia.carrera_id === null),
    [materias],
  );

  const deLaCarrera = useMemo(
    () => materias.filter((materia) => materia.carrera_id === carreraVista),
    [materias, carreraVista],
  );

  const grupos = [
    { titulo: "Tronco común", lista: tronco },
    {
      titulo:
        carreras.find((carrera) => carrera.id === carreraVista)?.nombre ??
        "Carrera",
      lista: deLaCarrera,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Selector
        etiqueta="Ver materias de"
        value={carreraVista}
        onChange={(evento) => setCarreraVista(evento.target.value)}
        ayuda="Puedes marcar materias de varias carreras. Lo que marques en una no se borra al cambiar de carrera."
      >
        {carreras.map((carrera) => (
          <option key={carrera.id} value={carrera.id}>
            {carrera.clave} · {carrera.nombre}
          </option>
        ))}
      </Selector>

      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-marino">
            {grupo.titulo}
          </span>

          {grupo.lista.length === 0 ? (
            <Tarjeta className="py-6 text-center text-sm text-tinta-suave">
              No hay materias cargadas aquí todavía.
            </Tarjeta>
          ) : (
            <div className="flex flex-wrap gap-2">
              {grupo.lista.map((materia) => {
                const activa = seleccionadas.has(materia.id);
                return (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => alCambiar(materia.id)}
                    aria-pressed={activa}
                    className={`min-h-[44px] rounded-suave border px-3.5 text-sm font-medium transition-colors duration-150 ${
                      activa
                        ? "border-marino bg-marino text-white"
                        : "border-marino/20 bg-white text-tinta-suave hover:border-marino/45 hover:text-marino"
                    }`}
                  >
                    {materia.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
