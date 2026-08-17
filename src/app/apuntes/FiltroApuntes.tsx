"use client";

import { useMemo, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";

export type ApunteVista = {
  id: string;
  titulo: string;
  generacion: string | null;
  archivo: string;
  extension: string;
  materia: string;
  carreraId: string | null;
  zhenshi: string;
};

function sinAcentos(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function FiltroApuntes({
  apuntes,
  carreras,
}: {
  apuntes: ApunteVista[];
  carreras: { id: string; clave: string; nombre: string }[];
}) {
  const [carrera, setCarrera] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const termino = sinAcentos(busqueda.trim());

    return apuntes.filter((apunte) => {
      if (carrera && apunte.carreraId !== carrera && apunte.carreraId !== null) {
        return false;
      }
      if (!termino) return true;
      return (
        sinAcentos(apunte.titulo).includes(termino) ||
        sinAcentos(apunte.materia).includes(termino)
      );
    });
  }, [apuntes, carrera, busqueda]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Selector
          etiqueta="De qué carrera"
          value={carrera}
          onChange={(evento) => setCarrera(evento.target.value)}
          ayuda="Los de tronco común salen siempre."
        >
          <option value="">Todas las carreras</option>
          {carreras.map((una) => (
            <option key={una.id} value={una.id}>
              {una.clave} · {una.nombre}
            </option>
          ))}
        </Selector>

        <Campo
          etiqueta="Busca una materia o un tema"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Química, segundo parcial…"
        />
      </div>

      {visibles.length === 0 ? (
        <Tarjeta className="py-12 text-center text-sm leading-relaxed text-tinta-suave">
          No hay apuntes de eso todavía.
        </Tarjeta>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibles.map((apunte) => (
            <li key={apunte.id}>
              <a
                href={apunte.archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <Tarjeta
                  elevada
                  className="flex h-full flex-col gap-2 p-5 transition-colors hover:border-marino/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Etiqueta tono="marino">{apunte.materia}</Etiqueta>
                    <Etiqueta tono="apagado">{apunte.extension}</Etiqueta>
                    {apunte.generacion ? (
                      <Etiqueta tono="apagado">{apunte.generacion}</Etiqueta>
                    ) : null}
                  </div>
                  <span className="font-titulos text-lg font-semibold text-marino">
                    {apunte.titulo}
                  </span>
                  <span className="mt-auto text-sm text-tinta-suave">
                    Lo compartió {apunte.zhenshi}
                  </span>
                </Tarjeta>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
