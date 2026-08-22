"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Seccion } from "@/components/ui/Seccion";
import { Selector, AreaTexto } from "@/components/ui/Selector";
import {
  CuadriculaHorarios,
  usarAlternadores,
} from "@/components/CuadriculaHorarios";
import type { CarreraLista, MateriaLista } from "@/app/admin/catalogo/tipos";
import { ReportarError } from "@/app/solicitudes/ReportarError";
import { crearSolicitud, type EstadoSolicitud } from "./acciones";

const estadoInicial: EstadoSolicitud = {};

export function FormularioAyuda({
  carreras,
  materias,
}: {
  carreras: CarreraLista[];
  materias: MateriaLista[];
}) {
  const [estado, accion, enviando] = useActionState(
    crearSolicitud,
    estadoInicial,
  );
  const [tipo, setTipo] = useState<"materia" | "tema_especial" | null>(null);
  const [carreraId, setCarreraId] = useState(carreras[0]?.id ?? "");
  const [carreraTema, setCarreraTema] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [tituloTema, setTituloTema] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cuantas, setCuantas] = useState("");
  const [seleccion, setSeleccion] = useState(() => new Set<string>());
  const alternadores = usarAlternadores(setSeleccion);

  const disponibles = useMemo(
    () =>
      materias.filter(
        (materia) =>
          materia.carrera_id === null || materia.carrera_id === carreraId,
      ),
    [materias, carreraId],
  );

  if (estado.codigo) {
    return (
      <Tarjeta elevada className="flex flex-col items-center gap-5 py-12 text-center">
        <span className="text-sm font-semibold tracking-wide text-tinta-suave uppercase">
          Tu solicitud quedó registrada
        </span>
        <span className="font-titulos text-4xl font-bold text-marino">
          {estado.codigo}
        </span>
        <p className="max-w-sm leading-relaxed text-tinta-suave">
          Apunta ese código o toma una captura. Con él puedes buscar tu
          solicitud en la lista y ver si ya tiene fecha y salón.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <BotonEnlace href={`/solicitudes?codigo=${estado.codigo}`}>
            Ver mi solicitud
          </BotonEnlace>
          <BotonEnlace href="/" variante="contorno">
            Volver al inicio
          </BotonEnlace>
        </div>

        {estado.id ? (
          <div className="w-full max-w-sm border-t border-marino/10 pt-5">
            <ReportarError solicitudId={estado.id} />
          </div>
        ) : null}
      </Tarjeta>
    );
  }

  if (tipo === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTipo("materia")}
          className="flex flex-col gap-2 rounded-tarjeta border border-marino/15 bg-white p-6 text-left shadow-tarjeta transition-colors hover:border-marino/45"
        >
          <span className="font-titulos text-xl font-semibold text-marino">
            Es de una materia
          </span>
          <span className="text-sm leading-relaxed text-tinta-suave">
            Matemáticas, química, inglés… Eliges tu materia de la lista y nos
            dices qué tema en concreto no te sale.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTipo("tema_especial")}
          className="flex flex-col gap-2 rounded-tarjeta border border-marino/15 bg-white p-6 text-left shadow-tarjeta transition-colors hover:border-marino/45"
        >
          <span className="font-titulos text-xl font-semibold text-marino">
            Es otra cosa
          </span>
          <span className="text-sm leading-relaxed text-tinta-suave">
            Cómo estudiar para un examen, preparar una exposición, organizar tus
            apuntes… Lo escribes con tus palabras.
          </span>
        </button>
      </div>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-9">
      <input type="hidden" name="tipo" value={tipo} />
      {[...seleccion].map((clave) => (
        <input key={clave} type="hidden" name="bloque" value={clave} />
      ))}

      <button
        type="button"
        onClick={() => setTipo(null)}
        className="self-start text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
      >
        ← Cambiar el tipo de solicitud
      </button>

      <Seccion
        titulo={tipo === "materia" ? "Qué materia" : "Qué necesitas"}
        descripcion={
          tipo === "materia"
            ? "Elige tu carrera y luego la materia. También salen las de tronco común."
            : "Dinos en una línea qué es, y luego explícalo con calma."
        }
      >
        <Tarjeta elevada className="flex flex-col gap-5 p-6">
          {tipo === "materia" ? (
            <>
              <Selector
                etiqueta="Tu carrera"
                name="carrera_id"
                value={carreraId}
                onChange={(evento) => {
                  setCarreraId(evento.target.value);
                  setMateriaId("");
                }}
              >
                {carreras.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>
                    {carrera.clave} · {carrera.nombre}
                  </option>
                ))}
              </Selector>

              <Selector
                etiqueta="Materia"
                name="materia_id"
                required
                value={materiaId}
                onChange={(evento) => setMateriaId(evento.target.value)}
              >
                <option value="">Elige una…</option>
                {disponibles.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre}
                    {materia.carrera_id === null ? " (tronco común)" : ""}
                  </option>
                ))}
              </Selector>
            </>
          ) : (
            <>
              <Campo
                etiqueta="Título"
                name="titulo_tema"
                required
                maxLength={120}
                value={tituloTema}
                onChange={(evento) => setTituloTema(evento.target.value)}
                placeholder="Cómo preparar una exposición"
              />

              <Selector
                etiqueta="Tu carrera"
                name="carrera_id"
                value={carreraTema}
                onChange={(evento) => setCarreraTema(evento.target.value)}
                ayuda="Opcional. Ayuda a que te encuentren los de tu misma carrera."
              >
                <option value="">Prefiero no decir</option>
                {carreras.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>
                    {carrera.clave} · {carrera.nombre}
                  </option>
                ))}
              </Selector>
            </>
          )}

          <AreaTexto
            etiqueta={
              tipo === "materia" ? "Qué tema en concreto" : "Explícalo un poco"
            }
            name="descripcion"
            required
            maxLength={500}
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
            placeholder={
              tipo === "materia"
                ? "Ecuaciones de segundo grado. Entiendo cuando me la explican pero a la hora de hacerla sola me trabo con la fórmula general."
                : "Tengo que exponer el viernes y me da muchos nervios hablar enfrente. Quiero que alguien me ayude a preparar la exposición."
            }
            ayuda="Entre más claro seas, más fácil es que alguien le entre."
          />

          <Selector
            etiqueta="¿Con cuántas sesiones crees que te alcanza?"
            name="sesiones_deseadas"
            value={cuantas}
            onChange={(evento) => setCuantas(evento.target.value)}
            ayuda="Es un cálculo tuyo, no un compromiso. Sirve para saber si te agendamos un solo día o varios seguidos."
          >
            <option value="">No sé todavía</option>
            <option value="1">Con una sesión me alcanza</option>
            <option value="2">Como dos sesiones</option>
            <option value="3">Como tres sesiones</option>
            <option value="4">Cuatro o más, es un tema largo</option>
          </Selector>
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Cuándo puedes"
        descripcion="Marca todos los horarios que te sirvan. Entre más marques, más fácil es agendarte."
      >
        <CuadriculaHorarios seleccion={seleccion} {...alternadores} />
      </Seccion>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-tarjeta border border-marino/10 bg-white/95 p-4 shadow-elevada backdrop-blur">
        <span className="text-sm text-tinta-suave">
          {seleccion.size === 0
            ? "Falta marcar horarios"
            : seleccion.size === 1
              ? "1 horario marcado"
              : `${seleccion.size} horarios marcados`}
        </span>
        <Boton
          type="submit"
          tamano="grande"
          disabled={enviando}
          className="ml-auto"
        >
          {enviando ? "Enviando…" : "Pedir ayuda"}
        </Boton>
      </div>

      <p className="text-center text-sm text-tinta-suave">
        No pedimos tu nombre ni tu correo. Lee el{" "}
        <Link href="/privacidad" className="underline underline-offset-4">
          aviso de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
