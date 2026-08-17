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
  bloques: OpcionBloque[];
};

export function FormularioAgendar({
  solicitudId,
  tituloSugerido,
  candidatos,
}: {
  solicitudId: string;
  tituloSugerido: string;
  candidatos: CandidatoVista[];
}) {
  const [estado, accion, enviando] = useActionState(agendar, estadoInicial);
  const [zhensiId, setZhensiId] = useState(candidatos[0]?.id ?? "");
  const [claveBloque, setClaveBloque] = useState(
    candidatos[0]?.bloques[0]?.clave ?? "",
  );
  const [fecha, setFecha] = useState(
    candidatos[0]?.bloques[0]?.fechaSugerida ?? "",
  );

  const elegido = useMemo(
    () => candidatos.find((candidato) => candidato.id === zhensiId),
    [candidatos, zhensiId],
  );

  function cambiarZhensi(id: string) {
    setZhensiId(id);
    const primero = candidatos.find((c) => c.id === id)?.bloques[0];
    setClaveBloque(primero?.clave ?? "");
    setFecha(primero?.fechaSugerida ?? "");
  }

  function cambiarBloque(clave: string) {
    setClaveBloque(clave);
    const bloque = elegido?.bloques.find((b) => b.clave === clave);
    if (bloque) setFecha(bloque.fechaSugerida);
  }

  return (
    <form action={accion} className="flex flex-col gap-5">
      <input type="hidden" name="solicitud_id" value={solicitudId} />
      {estado.advertencia ? (
        <input type="hidden" name="confirmar" value="1" />
      ) : null}

      <Tarjeta elevada className="flex flex-col gap-5 p-6">
        <Selector
          etiqueta="Quién la da"
          name="zhensi_id"
          value={zhensiId}
          onChange={(evento) => cambiarZhensi(evento.target.value)}
        >
          {candidatos.map((candidato) => (
            <option key={candidato.id} value={candidato.id}>
              {candidato.nombre} ({candidato.bloques.length}{" "}
              {candidato.bloques.length === 1 ? "horario" : "horarios"} en común)
            </option>
          ))}
        </Selector>

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

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            etiqueta="Fecha"
            name="fecha"
            type="date"
            required
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            ayuda="Se llena sola con la próxima vez que cae ese día."
          />

          <Campo
            etiqueta="Salón"
            name="salon"
            required
            placeholder="Aula 12"
          />
        </div>

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
        disabled={enviando}
      >
        {enviando
          ? "Agendando…"
          : estado.advertencia
            ? "Sí, agéndala de todos modos"
            : "Agendar y publicar"}
      </Boton>
    </form>
  );
}
