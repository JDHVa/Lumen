"use client";

import { useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo, Casilla } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Selector, AreaTexto } from "@/components/ui/Selector";
import { Seccion } from "@/components/ui/Seccion";
import { Tarjeta } from "@/components/ui/Tarjeta";
import type { CarreraLista, MateriaLista } from "@/app/admin/catalogo/tipos";
import { Iniciales } from "@/components/Iniciales";
import { SelectorMaterias } from "./SelectorMaterias";
import { guardarPerfil, type EstadoPerfil } from "./acciones";

const estadoInicial: EstadoPerfil = {};
const LIMITE = 200;

export type PerfilGuardado = {
  foto_url?: string | null;
  carrera_id: string | null;
  semestre: number | null;
  descripcion_corta: string | null;
  visible_publico: boolean;
};

export function FormularioPerfil({
  usuarioId,
  nombre,
  perfil,
  carreras,
  materias,
  materiasElegidas,
}: {
  usuarioId: string;
  nombre: string;
  perfil: PerfilGuardado | null;
  carreras: CarreraLista[];
  materias: MateriaLista[];
  materiasElegidas: string[];
}) {
  const [estado, accion, enviando] = useActionState(
    guardarPerfil,
    estadoInicial,
  );
  const [seleccionadas, setSeleccionadas] = useState(
    () => new Set(materiasElegidas),
  );
  const [descripcion, setDescripcion] = useState(
    perfil?.descripcion_corta ?? "",
  );
  const [carreraId, setCarreraId] = useState(perfil?.carrera_id ?? "");
  const [semestre, setSemestre] = useState(
    perfil?.semestre ? String(perfil.semestre) : "",
  );
  const [carreraVista, setCarreraVista] = useState(
    perfil?.carrera_id ?? carreras[0]?.id ?? "",
  );

  function cambiarCarrera(id: string) {
    setCarreraId(id);
    if (id) setCarreraVista(id);
  }

  function alternarMateria(id: string) {
    setSeleccionadas((previa) => {
      const nueva = new Set(previa);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });
  }

  const restantes = LIMITE - descripcion.length;

  return (
    <form action={accion} className="flex flex-col gap-9">
      <input type="hidden" name="usuario_id" value={usuarioId} />
      {[...seleccionadas].map((id) => (
        <input key={id} type="hidden" name="materia" value={id} />
      ))}

      <Seccion
        titulo="Tus datos"
        descripcion="Esto es lo que va a ver la gente en la galería si decides aparecer."
      >
        <Tarjeta elevada className="flex flex-col gap-5 p-6">
          <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
            <Selector
              etiqueta="Tu carrera"
              name="carrera_id"
              value={carreraId}
              onChange={(evento) => cambiarCarrera(evento.target.value)}
            >
              <option value="">Sin especificar</option>
              {carreras.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.clave} · {carrera.nombre}
                </option>
              ))}
            </Selector>

            <Campo
              etiqueta="Tu semestre"
              name="semestre"
              type="number"
              min={1}
              max={12}
              value={semestre}
              onChange={(evento) => setSemestre(evento.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {perfil?.foto_url ? (
              <img
                src={perfil.foto_url}
                alt="Tu foto"
                className="size-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <Iniciales nombre={nombre} grande />
            )}
            <div className="min-w-[14rem] flex-1">
              <Campo
                etiqueta="Tu foto"
                name="foto"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="py-2.5 file:mr-3 file:rounded-suave file:border-0 file:bg-marino file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                ayuda="Opcional, máximo 3 MB. Si no subes ninguna se quedan tus iniciales."
              />
            </div>
          </div>

          {perfil?.foto_url ? (
            <Casilla
              name="quitar_foto"
              etiqueta="Quitar mi foto"
              ayuda="Se borra al guardar y vuelven tus iniciales."
            />
          ) : null}

          <AreaTexto
            etiqueta="Así explico yo"
            name="descripcion_corta"
            maxLength={LIMITE}
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
            placeholder="Explico con ejemplos y muchos dibujos. Si no le entiendes, lo vuelvo a explicar de otra forma."
            className="min-h-[7rem]"
            ayuda={
              restantes < 0
                ? "Te pasaste del límite."
                : `${restantes} caracteres disponibles.`
            }
          />
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Materias que puedes dar"
        descripcion={
          seleccionadas.size === 1
            ? "Llevas 1 materia marcada."
            : `Llevas ${seleccionadas.size} materias marcadas.`
        }
      >
        <Tarjeta elevada className="p-6">
          {carreras.length === 0 ? (
            <p className="py-4 text-center text-sm text-tinta-suave">
              Todavía no hay carreras cargadas. Pídele a un admin que llene el
              catálogo.
            </p>
          ) : (
            <SelectorMaterias
              carreras={carreras}
              materias={materias}
              seleccionadas={seleccionadas}
              alCambiar={alternarMateria}
              carreraVista={carreraVista}
              alCambiarVista={setCarreraVista}
            />
          )}
        </Tarjeta>
      </Seccion>

      <Seccion titulo="Galería pública">
        <Casilla
          name="visible_publico"
          defaultChecked={perfil?.visible_publico ?? false}
          etiqueta="Quiero aparecer en la galería de zhenshis"
          ayuda="Se muestran tu nombre, tu carrera, tus materias y tu línea de arriba. Puedes apagarlo cuando quieras."
        />
      </Seccion>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-tarjeta border border-marino/10 bg-white/95 p-4 shadow-elevada backdrop-blur">
        <Boton
          type="submit"
          variante="secundario"
          disabled={enviando}
          className="ml-auto"
        >
          {enviando ? "Guardando…" : "Guardar perfil"}
        </Boton>
      </div>
    </form>
  );
}
