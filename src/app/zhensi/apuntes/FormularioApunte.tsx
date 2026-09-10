"use client";

import {
  useActionState,
  useMemo,
  useRef,
  useState,
  useEffect,
  useTransition,
  type FormEvent,
} from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import type { CarreraLista, MateriaLista } from "@/app/admin/catalogo/tipos";
import { subirApunte, pedirUrlDeSubida, type EstadoApunte } from "./acciones";

const estadoInicial: EstadoApunte = {};
const LIMITE_MB = 50;
const LIMITE_BYTES = LIMITE_MB * 1024 * 1024;

export function FormularioApunte({
  carreras,
  materias,
  carreraPropia,
}: {
  carreras: CarreraLista[];
  materias: MateriaLista[];
  carreraPropia: string | null;
}) {
  const [estado, accion, guardando] = useActionState(
    subirApunte,
    estadoInicial,
  );
  const [subiendo, iniciarTransicion] = useTransition();
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
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

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorLocal(null);

    const form = evento.currentTarget;
    const datos = new FormData(form);
    const archivo = datos.get("archivo");

    if (!(archivo instanceof File) || archivo.size === 0) {
      setErrorLocal("Falta el archivo.");
      return;
    }
    if (archivo.size > LIMITE_BYTES) {
      setErrorLocal(`El archivo pasa de ${LIMITE_MB} MB.`);
      return;
    }

    const firma = await pedirUrlDeSubida(archivo.type);
    if (!firma.ok) {
      setErrorLocal(firma.error);
      return;
    }

    const respuesta = await fetch(firma.url_subida, {
      method: "PUT",
      headers: { "Content-Type": archivo.type },
      body: archivo,
    }).catch(() => null);

    if (!respuesta || !respuesta.ok) {
      setErrorLocal("No se pudo subir el archivo. Vuelve a intentarlo.");
      return;
    }

    const finales = new FormData();
    finales.set("titulo", String(datos.get("titulo") ?? ""));
    finales.set("materia_id", String(datos.get("materia_id") ?? ""));
    finales.set("generacion", String(datos.get("generacion") ?? ""));
    finales.set("archivo_url", firma.url_publica);

    iniciarTransicion(() => accion(finales));
  }

  const ocupado = subiendo || guardando;
  const error = errorLocal ?? estado.error;

  return (
    <form ref={formulario} onSubmit={alEnviar} className="flex flex-col gap-5">
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
          ayuda="PDF, foto, Word, Excel o PowerPoint. Máximo 50 MB."
        />
      </Tarjeta>

      {error ? <Aviso tono="error">{error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton type="submit" variante="secundario" disabled={ocupado}>
        {subiendo ? "Subiendo…" : guardando ? "Guardando…" : "Subir apunte"}
      </Boton>
    </form>
  );
}
