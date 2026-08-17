"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Iniciales } from "@/components/Iniciales";

export type ZhenshiVista = {
  id: string;
  nombre: string;
  foto: string | null;
  semestre: number | null;
  descripcion: string | null;
  carreraId: string | null;
  carreraClave: string | null;
  materias: string[];
};

function sinAcentos(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function FiltroZhensis({
  zhenshis,
  carreras,
}: {
  zhenshis: ZhenshiVista[];
  carreras: { id: string; clave: string; nombre: string }[];
}) {
  const [carrera, setCarrera] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const termino = sinAcentos(busqueda.trim());

    return zhenshis.filter((zhenshi) => {
      if (carrera && zhenshi.carreraId !== carrera) return false;
      if (!termino) return true;

      return (
        zhenshi.materias.some((materia) =>
          sinAcentos(materia).includes(termino),
        ) || sinAcentos(zhenshi.nombre).includes(termino)
      );
    });
  }, [zhenshis, carrera, busqueda]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Selector
          etiqueta="De qué carrera"
          value={carrera}
          onChange={(evento) => setCarrera(evento.target.value)}
        >
          <option value="">Todas las carreras</option>
          {carreras.map((una) => (
            <option key={una.id} value={una.id}>
              {una.clave} · {una.nombre}
            </option>
          ))}
        </Selector>

        <Campo
          etiqueta="Busca una materia"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Química, inglés, matemáticas…"
        />
      </div>

      {visibles.length === 0 ? (
        <Tarjeta className="py-12 text-center text-sm leading-relaxed text-tinta-suave">
          Nadie da eso todavía. Pídelo de todos modos: si se junta gente, se
          busca quién lo dé.
        </Tarjeta>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibles.map((zhenshi) => (
            <li key={zhenshi.id}>
              <Link href={`/zhensis/${zhenshi.id}`} className="block h-full">
              <Tarjeta
                elevada
                className="flex h-full flex-col gap-4 p-5 transition-colors hover:border-marino/40"
              >
                <div className="flex items-center gap-3">
                  {zhenshi.foto ? (
                    <img
                      src={zhenshi.foto}
                      alt={zhenshi.nombre}
                      className="size-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <Iniciales nombre={zhenshi.nombre} grande />
                  )}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-titulos text-xl font-semibold text-marino">
                      {zhenshi.nombre}
                    </span>
                    <span className="text-sm text-tinta-suave">
                      {[
                        zhenshi.carreraClave,
                        zhenshi.semestre
                          ? `${zhenshi.semestre}º semestre`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Zhenshi"}
                    </span>
                  </div>
                </div>

                {zhenshi.descripcion ? (
                  <p className="leading-relaxed break-words text-tinta-suave">
                    “{zhenshi.descripcion}”
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {zhenshi.materias.map((materia) => (
                    <Etiqueta key={materia} tono="marino">
                      {materia}
                    </Etiqueta>
                  ))}
                </div>
              </Tarjeta>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
