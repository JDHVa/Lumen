"use client";

import { useCallback, useMemo, useState } from "react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Campo, Casilla } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { alternarMateria } from "./acciones";
import { FormularioMateria } from "./FormularioMateria";
import { FormularioMaterias } from "./FormularioMaterias";
import type { CarreraLista, MateriaLista } from "./tipos";

function sinAcentos(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function PanelMaterias({
  carreras,
  materias,
}: {
  carreras: CarreraLista[];
  materias: MateriaLista[];
}) {
  const [carreraElegida, setCarreraElegida] = useState("tronco");
  const [busqueda, setBusqueda] = useState("");
  const [verInactivas, setVerInactivas] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const cerrar = useCallback(() => setEditando(null), []);

  const visibles = useMemo(() => {
    const termino = sinAcentos(busqueda.trim());
    return materias
      .filter((materia) => {
        const suCarrera = materia.carrera_id ?? "tronco";
        if (suCarrera !== carreraElegida) return false;
        if (!materia.activa && !verInactivas) return false;
        if (termino && !sinAcentos(materia.nombre).includes(termino)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [materias, carreraElegida, busqueda, verInactivas]);

  const nombreCarrera =
    carreraElegida === "tronco"
      ? "tronco común"
      : (carreras.find((carrera) => carrera.id === carreraElegida)?.nombre ??
        "esa carrera");

  return (
    <div className="flex flex-col gap-5">
      <Tarjeta elevada className="p-6">
        <FormularioMaterias
          carreras={carreras}
          carreraElegida={carreraElegida}
        />
      </Tarjeta>

      <div className="grid gap-4 sm:grid-cols-2">
        <Selector
          etiqueta="Ver las materias de"
          value={carreraElegida}
          onChange={(evento) => setCarreraElegida(evento.target.value)}
        >
          <option value="tronco">Tronco común</option>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>
              {carrera.clave} · {carrera.nombre}
            </option>
          ))}
        </Selector>

        <Campo
          etiqueta="Buscar"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Escribe parte del nombre"
        />
      </div>

      <Casilla
        etiqueta="Mostrar también las desactivadas"
        checked={verInactivas}
        onChange={(evento) => setVerInactivas(evento.target.checked)}
      />

      <p className="text-sm text-tinta-suave">
        {visibles.length === 1 ? "1 materia" : `${visibles.length} materias`} en{" "}
        {nombreCarrera}.
      </p>

      {visibles.length === 0 ? (
        <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
          {busqueda
            ? "Ninguna materia coincide con esa búsqueda."
            : `Todavía no hay materias en ${nombreCarrera}.`}
        </Tarjeta>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visibles.map((materia) => (
            <li key={materia.id}>
              <Tarjeta className="py-4">
                {editando === materia.id ? (
                  <FormularioMateria
                    materia={materia}
                    carreras={carreras}
                    alTerminar={cerrar}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-marino">
                      {materia.nombre}
                    </span>
                    {materia.semestre ? (
                      <Etiqueta tono="apagado">
                        Semestre {materia.semestre}
                      </Etiqueta>
                    ) : null}
                    {!materia.activa ? (
                      <Etiqueta tono="alerta">desactivada</Etiqueta>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setEditando(materia.id)}
                      className="min-h-[40px] px-1 text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
                    >
                      Editar
                    </button>
                    <form action={alternarMateria}>
                      <input type="hidden" name="id" value={materia.id} />
                      <button
                        type="submit"
                        className="min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
                      >
                        {materia.activa ? "Desactivar" : "Reactivar"}
                      </button>
                    </form>
                  </div>
                )}
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
