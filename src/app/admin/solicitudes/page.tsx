import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { leerClaveBloque, nombreDia, etiquetaDeBloque } from "@/lib/horarios";
import { fechaLegible } from "@/lib/fechas";
import { cambiarEstado, descartarReporte } from "./acciones";
import { BorrarSolicitud } from "./BorrarSolicitud";

export const dynamic = "force-dynamic";

const tonos = {
  abierta: "marino",
  agendada: "dorado",
  cerrada: "apagado",
  oculta: "alerta",
} as const;

type SolicitudAdmin = {
  id: string;
  codigo_publico: string;
  tipo: "materia" | "tema_especial";
  titulo_tema: string | null;
  descripcion: string;
  apoyos: number;
  estado: keyof typeof tonos;
  franjas_preferidas: unknown;
  creada_en: Date;
  reportes_error: number;
  reportada_en: Date | null;
  materia: { nombre: string } | null;
  carrera: { clave: string } | null;
};

function resumirFranjas(crudas: unknown) {
  if (!Array.isArray(crudas)) return [];

  const porDia = new Map<number, string[]>();

  for (const valor of crudas) {
    const bloque = leerClaveBloque(String(valor));
    if (!bloque) continue;
    const previos = porDia.get(bloque.dia) ?? [];
    previos.push(etiquetaDeBloque(bloque.dia, bloque.inicio));
    porDia.set(bloque.dia, previos);
  }

  return [...porDia.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([dia, horas]) => `${nombreDia(dia)}: ${horas.join(", ")}`);
}

function Accion({
  id,
  destino,
  texto,
  tono,
}: {
  id: string;
  destino: string;
  texto: string;
  tono?: "neutral" | "afirmar" | "peligro";
}) {
  return (
    <form action={cambiarEstado}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={destino} />
      <BotonAccion type="submit" tono={tono}>
        {texto}
      </BotonAccion>
    </form>
  );
}

function FilaSolicitud({ solicitud }: { solicitud: SolicitudAdmin }) {
  const franjas = resumirFranjas(solicitud.franjas_preferidas);
  const reportada = solicitud.reportes_error > 0;

  return (
    <Tarjeta
      className={`flex flex-col gap-3 py-4 ${
        reportada ? "border-alerta/40 bg-alerta-tenue" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Etiqueta tono="apagado">{solicitud.codigo_publico}</Etiqueta>
        <Etiqueta tono={tonos[solicitud.estado]}>{solicitud.estado}</Etiqueta>
        {reportada ? (
          <Etiqueta tono="alerta">
            {solicitud.reportes_error === 1
              ? "avisaron que fue un error"
              : `${solicitud.reportes_error} avisos de error`}
          </Etiqueta>
        ) : null}
        {solicitud.carrera ? (
          <span className="text-sm text-tinta-suave">
            {solicitud.carrera.clave}
          </span>
        ) : null}
        <span className="ml-auto text-sm font-semibold text-marino">
          {solicitud.apoyos === 1 ? "1 apoyo" : `${solicitud.apoyos} apoyos`}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-medium text-marino">
          {solicitud.tipo === "materia"
            ? (solicitud.materia?.nombre ?? "Materia")
            : solicitud.titulo_tema}
        </span>
        <span className="text-sm leading-relaxed break-words text-tinta-suave">
          {solicitud.descripcion}
        </span>
      </div>

      {franjas.map((linea) => (
        <span key={linea} className="text-sm text-tinta-suave">
          {linea}
        </span>
      ))}

      {reportada && solicitud.reportada_en ? (
        <p className="text-sm leading-relaxed text-alerta">
          Quien la mandó dice que se equivocó. Último aviso el{" "}
          {fechaLegible(solicitud.reportada_en)}.
        </p>
      ) : null}

      {solicitud.estado === "agendada" ? (
        <p className="text-sm text-tinta-suave">
          Ya tiene sesión. Se administra desde Sesiones.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          {solicitud.estado !== "abierta" ? (
            <Accion id={solicitud.id} destino="abierta" texto="Reabrir" />
          ) : null}
          {solicitud.estado !== "cerrada" ? (
            <Accion id={solicitud.id} destino="cerrada" texto="Cerrar" />
          ) : null}
          {solicitud.estado !== "oculta" ? (
            <Accion
              id={solicitud.id}
              destino="oculta"
              texto="Ocultar"
              tono="peligro"
            />
          ) : null}
          {reportada ? (
            <form action={descartarReporte}>
              <input type="hidden" name="id" value={solicitud.id} />
              <BotonAccion type="submit" tono="afirmar">
                Descartar aviso
              </BotonAccion>
            </form>
          ) : null}
          <BorrarSolicitud
            id={solicitud.id}
            codigo={solicitud.codigo_publico}
            apoyos={solicitud.apoyos}
          />
        </div>
      )}
    </Tarjeta>
  );
}

export default async function PaginaSolicitudes() {
  const solicitudes = (await db.solicitud.findMany({
    orderBy: [{ apoyos: "desc" }, { creada_en: "desc" }],
    take: 200,
    select: {
      id: true,
      codigo_publico: true,
      tipo: true,
      titulo_tema: true,
      descripcion: true,
      apoyos: true,
      estado: true,
      franjas_preferidas: true,
      creada_en: true,
      reportes_error: true,
      reportada_en: true,
      materia: { select: { nombre: true } },
      carrera: { select: { clave: true } },
    },
  })) as SolicitudAdmin[];

  const abiertas = solicitudes.filter((s) => s.estado === "abierta").length;

  const reportadas = solicitudes
    .filter((s) => s.reportes_error > 0)
    .sort(
      (a, b) =>
        (b.reportada_en?.getTime() ?? 0) - (a.reportada_en?.getTime() ?? 0),
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Solicitudes</h1>
        <p className="leading-relaxed text-tinta-suave">
          Todo lo que ha pedido la gente, ordenado por cuántos lo apoyaron. Las
          solicitudes se publican solas, sin revisión: aquí es donde limpias lo
          que no sirva.
        </p>
      </div>

      {reportadas.length > 0 ? (
        <Seccion
          titulo="Urgente: las mandaron por error"
          descripcion={
            reportadas.length === 1
              ? "Alguien avisó que se equivocó al mandar esta. Revísala y bórrala."
              : `${reportadas.length} personas avisaron que se equivocaron. Revísalas y bórralas.`
          }
        >
          <ul className="flex flex-col gap-2.5">
            {reportadas.map((solicitud) => (
              <li key={solicitud.id}>
                <FilaSolicitud solicitud={solicitud} />
              </li>
            ))}
          </ul>
        </Seccion>
      ) : null}

      <Seccion
        titulo="Todas"
        descripcion={`${solicitudes.length} en total, ${abiertas} todavía abiertas.`}
      >
        {solicitudes.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay solicitudes.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {solicitudes.map((solicitud) => (
              <li key={solicitud.id}>
                <FilaSolicitud solicitud={solicitud} />
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
