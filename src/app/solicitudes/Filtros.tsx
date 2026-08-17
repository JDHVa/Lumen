"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import type { CarreraLista } from "@/app/admin/catalogo/tipos";

export function Filtros({ carreras }: { carreras: CarreraLista[] }) {
  const router = useRouter();
  const parametros = useSearchParams();

  function cambiar(nombre: string, valor: string) {
    const nuevos = new URLSearchParams(parametros.toString());
    if (valor) nuevos.set(nombre, valor);
    else nuevos.delete(nombre);
    router.replace(nuevos.size > 0 ? `/solicitudes?${nuevos}` : "/solicitudes");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Selector
        etiqueta="Filtrar por carrera"
        value={parametros.get("carrera") ?? ""}
        onChange={(evento) => cambiar("carrera", evento.target.value)}
      >
        <option value="">Todas las carreras</option>
        {carreras.map((carrera) => (
          <option key={carrera.id} value={carrera.id}>
            {carrera.clave} · {carrera.nombre}
          </option>
        ))}
      </Selector>

      <Campo
        etiqueta="Buscar por código"
        type="search"
        defaultValue={parametros.get("codigo") ?? ""}
        onChange={(evento) => cambiar("codigo", evento.target.value)}
        placeholder="LUM-A3K9"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
