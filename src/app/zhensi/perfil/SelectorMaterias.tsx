"use client";

import { useMemo } from "react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import type { CarreraLista, MateriaLista } from "@/app/admin/catalogo/tipos";

export function SelectorMaterias({
  carreras,
  materias,
  seleccionadas,
  alCambiar,
  carreraVista,
  alCambiarVista,
}: {
  carreras: CarreraLista[];
  materias: MateriaLista[];
  seleccionadas: Set<string>;
  alCambiar: (id: string) => void;
  carreraVista: string;
  alCambiarVista: (id: string) => void;
}) {

  const tronco = useMemo(
    () => materias.filter((materia) => materia.carrera_id === null),
    [materias],
  );

  const deLaCarrera = useMemo(
    () => materias.filter((materia) => materia.carrera_id === carreraVista),
    [materias, carreraVista],
  );

  const marcadas = useMemo(() => {
    const claves = new Map(
      carreras.map((carrera) => [carrera.id, carrera.clave]),
    );
    return materias
      .filter((materia) => seleccionadas.has(materia.id))
      .map(
        (materia) =>
          `${materia.nombre} (${materia.carrera_id ? (claves.get(materia.carrera_id) ?? "?") : "tronco común"})`,
      )
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [materias, carreras, seleccionadas]);

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
        onChange={(evento) => alCambiarVista(evento.target.value)}
        ayuda="Arranca en tu carrera. Puedes marcar materias de otras: lo que marques en una no se borra al cambiar."
      >
        {carreras.map((carrera) => (
          <option key={carrera.id} value={carrera.id}>
            {carrera.clave} · {carrera.nombre}
          </option>
        ))}
      </Selector>

      {marcadas.length > 0 ? (
        <div className="rounded-suave border border-marino/15 bg-marino-tenue px-4 py-3">
          <span className="text-sm font-semibold text-marino">
            Lo que llevas marcado
          </span>
          <p className="pt-1 text-sm leading-relaxed text-tinta-suave">
            {marcadas.join(" · ")}
          </p>
        </div>
      ) : null}

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
