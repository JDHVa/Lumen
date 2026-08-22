"use client";

import { useActionState, useMemo, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Selector } from "@/components/ui/Selector";
import { agendar, type EstadoAgenda } from "../acciones";

const estadoInicial: EstadoAgenda = {};

export type OpcionBloque = {
  clave: string;
  texto: string;
  fechaSugerida: string;
};

export type CandidatoVista = {
  id: string;
  nombre: string;
  propuso: boolean;
  bloques: OpcionBloque[];
};

type Elegido = { fecha: string; semanas: number };

function sumarSemanas(fecha: string, semanas: number) {
  const base = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) return fecha;
  base.setUTCDate(base.getUTCDate() + semanas * 7);
  return base.toISOString().slice(0, 10);
}

export function FormularioAgendar({
  solicitudId,
  tituloSugerido,
  candidatos,
  sesionesDeseadas,
}: {
  solicitudId: string;
  tituloSugerido: string;
  candidatos: CandidatoVista[];
  sesionesDeseadas: number | null;
}) {
  const [estado, accion, enviando] = useActionState(agendar, estadoInicial);
  const [modo, setModo] = useState<"una" | "varias">(
    sesionesDeseadas !== null && sesionesDeseadas > 1 ? "varias" : "una",
  );
  const [zhensiId, setZhensiId] = useState(candidatos[0]?.id ?? "");
  const [claveBloque, setClaveBloque] = useState(
    candidatos[0]?.bloques[0]?.clave ?? "",
  );
  const [fecha, setFecha] = useState(
    candidatos[0]?.bloques[0]?.fechaSugerida ?? "",
  );
  const [elegidos, setElegidos] = useState<Record<string, Elegido>>({});

  const elegido = useMemo(
    () => candidatos.find((candidato) => candidato.id === zhensiId),
    [candidatos, zhensiId],
  );

  const dias = useMemo(() => {
    if (modo === "una") {
      return claveBloque && fecha ? [{ clave: claveBloque, fecha }] : [];
    }

    const salida: { clave: string; fecha: string }[] = [];

    for (const bloque of elegido?.bloques ?? []) {
      const marcado = elegidos[bloque.clave];
      if (!marcado || !marcado.fecha) continue;
      for (let vuelta = 0; vuelta < marcado.semanas; vuelta += 1) {
        salida.push({
          clave: bloque.clave,
          fecha: sumarSemanas(marcado.fecha, vuelta),
        });
      }
    }

    return salida;
  }, [modo, claveBloque, fecha, elegido, elegidos]);

  function cambiarZhensi(id: string) {
    setZhensiId(id);
    const primero = candidatos.find((c) => c.id === id)?.bloques[0];
    setClaveBloque(primero?.clave ?? "");
    setFecha(primero?.fechaSugerida ?? "");
    setElegidos({});
  }

  function cambiarBloque(clave: string) {
    setClaveBloque(clave);
    const bloque = elegido?.bloques.find((b) => b.clave === clave);
    if (bloque) setFecha(bloque.fechaSugerida);
  }

  function alternar(bloque: OpcionBloque) {
    setElegidos((previos) => {
      const copia = { ...previos };
      if (copia[bloque.clave]) {
        delete copia[bloque.clave];
      } else {
        copia[bloque.clave] = { fecha: bloque.fechaSugerida, semanas: 1 };
      }
      return copia;
    });
  }

  function ajustar(clave: string, cambio: Partial<Elegido>) {
    setElegidos((previos) =>
      previos[clave]
        ? { ...previos, [clave]: { ...previos[clave], ...cambio } }
        : previos,
    );
  }

  const pestana =
    "min-h-[44px] flex-1 rounded-suave px-4 text-sm font-semibold transition-colors";

  return (
    <form action={accion} className="flex flex-col gap-5">
      <input type="hidden" name="solicitud_id" value={solicitudId} />
      {estado.advertencia ? (
        <input type="hidden" name="confirmar" value="1" />
      ) : null}

      {modo === "varias"
        ? dias.map((dia, indice) => (
            <div key={`${dia.clave}-${dia.fecha}-${indice}`}>
              <input type="hidden" name="bloque" value={dia.clave} />
              <input type="hidden" name="fecha" value={dia.fecha} />
            </div>
          ))
        : null}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-marino">
          ¿Cuántas sesiones vas a agendar?
        </span>
        <div className="flex gap-2 rounded-suave border border-marino/15 bg-white p-1">
          <button
            type="button"
            onClick={() => setModo("una")}
            className={`${pestana} ${
              modo === "una"
                ? "bg-marino text-white"
                : "text-tinta-suave hover:bg-marino/5"
            }`}
          >
            Una sola sesión
          </button>
          <button
            type="button"
            onClick={() => setModo("varias")}
            className={`${pestana} ${
              modo === "varias"
                ? "bg-marino text-white"
                : "text-tinta-suave hover:bg-marino/5"
            }`}
          >
            Varias sesiones
          </button>
        </div>
        {sesionesDeseadas !== null ? (
          <span className="text-sm text-tinta-suave">
            Quien la pidió calculó que necesita{" "}
            {sesionesDeseadas === 1
              ? "una sola sesión"
              : sesionesDeseadas >= 4
                ? "cuatro o más sesiones"
                : `como ${sesionesDeseadas} sesiones`}
            .
          </span>
        ) : null}
      </div>

      <Tarjeta elevada className="flex flex-col gap-5 p-6">
        <Selector
          etiqueta="Quién la da"
          name="zhensi_id"
          value={zhensiId}
          onChange={(evento) => cambiarZhensi(evento.target.value)}
        >
          {candidatos.map((candidato) => (
            <option key={candidato.id} value={candidato.id}>
              {candidato.propuso ? "★ " : ""}
              {candidato.nombre} ({candidato.bloques.length}{" "}
              {candidato.bloques.length === 1 ? "horario" : "horarios"} en común)
              {candidato.propuso ? " · se propuso" : ""}
            </option>
          ))}
        </Selector>

        {modo === "una" ? (
          <>
            <Selector
              etiqueta="Horario"
              name="bloque"
              value={claveBloque}
              onChange={(evento) => cambiarBloque(evento.target.value)}
              ayuda="Solo salen los horarios en los que él y quien pidió ayuda coinciden."
            >
              {elegido?.bloques.map((bloque) => (
                <option key={bloque.clave} value={bloque.clave}>
                  {bloque.texto}
                </option>
              ))}
            </Selector>

            <Campo
              etiqueta="Fecha"
              name="fecha"
              type="date"
              required
              value={fecha}
              onChange={(evento) => setFecha(evento.target.value)}
              ayuda="Se llena sola con la próxima vez que cae ese día."
            />
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-marino">Días</span>
              <span className="text-sm text-tinta-suave">
                Marca los horarios que vas a usar. De cada uno puedes agendar
                varias semanas seguidas.
              </span>
            </div>

            {elegido?.bloques.map((bloque) => {
              const marcado = elegidos[bloque.clave];

              return (
                <div
                  key={bloque.clave}
                  className={`flex flex-col gap-3 rounded-suave border p-4 ${
                    marcado
                      ? "border-marino/35 bg-marino/5"
                      : "border-marino/15 bg-white"
                  }`}
                >
                  <label className="flex items-start gap-3 text-sm text-marino">
                    <input
                      type="checkbox"
                      checked={Boolean(marcado)}
                      onChange={() => alternar(bloque)}
                      className="mt-1 size-4 accent-marino"
                    />
                    <span className="font-medium">{bloque.texto}</span>
                  </label>

                  {marcado ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Campo
                        etiqueta="Primera fecha"
                        type="date"
                        required
                        value={marcado.fecha}
                        onChange={(evento) =>
                          ajustar(bloque.clave, { fecha: evento.target.value })
                        }
                      />
                      <Selector
                        etiqueta="Cuántas semanas seguidas"
                        value={String(marcado.semanas)}
                        onChange={(evento) =>
                          ajustar(bloque.clave, {
                            semanas: Number(evento.target.value),
                          })
                        }
                      >
                        <option value="1">Solo esa vez</option>
                        <option value="2">2 semanas seguidas</option>
                        <option value="3">3 semanas seguidas</option>
                        <option value="4">4 semanas seguidas</option>
                      </Selector>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <Campo etiqueta="Salón" name="salon" required placeholder="Aula 12" />

        <Campo
          etiqueta="Título de la sesión"
          name="titulo"
          required
          defaultValue={tituloSugerido}
          ayuda="Es lo que va a ver la gente en el inicio."
        />

        <Campo
          etiqueta="Nota para los que asistan"
          name="notas_publicas"
          placeholder="Opcional. Traer calculadora, por ejemplo."
        />
      </Tarjeta>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.advertencia ? (
        <Aviso tono="error">
          {estado.advertencia} Si de todos modos va, vuelve a presionar el botón
          y se agenda.
        </Aviso>
      ) : null}

      <Boton
        type="submit"
        variante="secundario"
        tamano="grande"
        disabled={enviando || dias.length === 0}
      >
        {enviando
          ? "Agendando…"
          : estado.advertencia
            ? "Sí, agéndalas de todos modos"
            : dias.length === 0
              ? "Marca al menos un día"
              : dias.length === 1
                ? "Agendar y publicar"
                : `Agendar ${dias.length} sesiones y publicar`}
      </Boton>
    </form>
  );
}
