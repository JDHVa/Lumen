"use client";

import { useCallback, useState } from "react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { FormularioCarrera } from "./FormularioCarrera";
import type { CarreraLista } from "./tipos";

export function ListaCarreras({ carreras }: { carreras: CarreraLista[] }) {
  const [editando, setEditando] = useState<string | null>(null);
  const cerrar = useCallback(() => setEditando(null), []);

  if (carreras.length === 0) {
    return (
      <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
        Todavía no hay carreras. Agrega la primera arriba.
      </Tarjeta>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {carreras.map((carrera) => (
        <li key={carrera.id}>
          <Tarjeta className="py-4">
            {editando === carrera.id ? (
              <FormularioCarrera carrera={carrera} alTerminar={cerrar} />
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Etiqueta tono="marino">{carrera.clave}</Etiqueta>
                <span className="min-w-0 flex-1 truncate font-medium text-marino">
                  {carrera.nombre}
                </span>
                <span className="text-sm text-tinta-suave">
                  {carrera.cuantas === 1
                    ? "1 materia"
                    : `${carrera.cuantas} materias`}
                </span>
                <button
                  type="button"
                  onClick={() => setEditando(carrera.id)}
                  className="min-h-[40px] px-1 text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
                >
                  Editar
                </button>
              </div>
            )}
          </Tarjeta>
        </li>
      ))}
    </ul>
  );
}
