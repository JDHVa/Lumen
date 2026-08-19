import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import {
  leerClaveBloque,
  nombreDia,
  etiquetaDeBloque,
  claveBloque,
} from "@/lib/horarios";
import { Proponerse } from "./Proponerse";

export const dynamic = "force-dynamic";

type SolicitudZhensi = {
  id: string;
  codigo_publico: string;
  tipo: "materia" | "tema_especial";
  titulo_tema: string | null;
  descripcion: string;
  apoyos: number;
  materia_id: string | null;
  franjas_preferidas: unknown;
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

function Fila({
  solicitud,
  propuesta,
  mias,
  coincide,
}: {
  solicitud: SolicitudZhensi;
  propuesta: boolean;
  mias: boolean;
  coincide: boolean;
}) {
  const franjas = resumirFranjas(solicitud.franjas_preferidas);

  return (
    <Tarjeta className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Etiqueta tono="apagado">{solicitud.codigo_publico}</Etiqueta>
        {mias ? <Etiqueta tono="dorado">es tu materia</Etiqueta> : null}
        {coincide ? (
          <Etiqueta tono="marino">coincide con tu horario</Etiqueta>
        ) : null}
        {solicitud.carrera ? (
          <span className="text-sm text-tinta-suave">
            {solicitud.carrera.clave}
          </span>
        ) : null}
        <span className="ml-auto text-sm font-semibold text-marino">
          {solicitud.apoyos === 1
            ? "1 persona"
            : `${solicitud.apoyos} personas`}
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

      {franjas.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold tracking-wide text-tinta-suave uppercase">
            Horarios que pidieron
          </span>
          {franjas.map((linea) => (
            <span key={linea} className="text-sm text-tinta-suave">
              {linea}
            </span>
          ))}
        </div>
      ) : null}

      <div className="pt-1">
        <Proponerse solicitudId={solicitud.id} yaPropuesto={propuesta} />
      </div>
    </Tarjeta>
  );
}

export default async function PaginaSolicitudesZhensi() {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const [solicitudes, materiasMias, propuestas, disponibilidades] =
    await Promise.all([
      db.solicitud.findMany({
        where: { estado: "abierta", archivada: false },
        orderBy: [{ apoyos: "desc" }, { creada_en: "desc" }],
        take: 100,
        select: {
          id: true,
          codigo_publico: true,
          tipo: true,
          titulo_tema: true,
          descripcion: true,
          apoyos: true,
          materia_id: true,
          franjas_preferidas: true,
          materia: { select: { nombre: true } },
          carrera: { select: { clave: true } },
        },
      }),
      db.zhensi_materia.findMany({
        where: { usuario_id: sesion.user.id },
        select: { materia_id: true },
      }),
      db.propuesta_zhensi.findMany({
        where: { zhensi_id: sesion.user.id },
        select: { solicitud_id: true },
      }),
      db.disponibilidad.findMany({
        where: { usuario_id: sesion.user.id },
        select: { dia_semana: true, hora_inicio: true },
      }),
    ]);

  const idsMaterias = new Set(materiasMias.map((fila) => fila.materia_id));
  const yaPropuestas = new Set(propuestas.map((fila) => fila.solicitud_id));
  const misBloques = new Set(
    disponibilidades.map((bloque) =>
      claveBloque(bloque.dia_semana, bloque.hora_inicio),
    ),
  );

  const esMia = (solicitud: SolicitudZhensi) =>
    solicitud.materia_id !== null && idsMaterias.has(solicitud.materia_id);

  const coincideConmigo = (solicitud: SolicitudZhensi) => {
    const crudas = solicitud.franjas_preferidas;
    if (!Array.isArray(crudas)) return false;
    return crudas.some((valor) => misBloques.has(String(valor)));
  };

  const lista = solicitudes as SolicitudZhensi[];
  const mias = lista.filter(esMia);
  const otras = lista.filter((solicitud) => !esMia(solicitud));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Solicitudes abiertas</h1>
        <p className="leading-relaxed text-tinta-suave">
          Lo que está pidiendo la gente y todavía no se agenda. Si puedes dar
          alguna, propónte y el admin lo ve. Él decide quién la da y a qué hora:
          proponerte no la agenda.
        </p>
      </div>

      <Seccion
        titulo="De tus materias"
        descripcion={
          idsMaterias.size === 0
            ? "Todavía no marcas ninguna materia en tu perfil, así que no podemos saber cuáles son las tuyas."
            : mias.length === 1
              ? "1 solicitud de las materias que marcaste."
              : `${mias.length} solicitudes de las materias que marcaste.`
        }
      >
        {mias.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Ahorita no hay nada abierto de tus materias. Abajo está todo lo
            demás.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {mias.map((solicitud) => (
              <li key={solicitud.id}>
                <Fila
                  solicitud={solicitud}
                  propuesta={yaPropuestas.has(solicitud.id)}
                  mias
                  coincide={coincideConmigo(solicitud)}
                />
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion
        titulo="Todo lo demás"
        descripcion="Puedes proponerte a cualquiera, aunque no sea de tus materias."
      >
        {otras.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            No hay ninguna otra solicitud abierta.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {otras.map((solicitud) => (
              <li key={solicitud.id}>
                <Fila
                  solicitud={solicitud}
                  propuesta={yaPropuestas.has(solicitud.id)}
                  mias={false}
                  coincide={coincideConmigo(solicitud)}
                />
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
