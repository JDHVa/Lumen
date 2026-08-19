import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";

export const dynamic = "force-dynamic";

type SolicitudDemanda = {
  id: string;
  codigo_publico: string;
  tipo: "materia" | "tema_especial";
  titulo_tema: string | null;
  descripcion: string;
  apoyos: number;
  materia: { nombre: string } | null;
  carrera: { clave: string } | null;
  _count: { propuestas: number };
  propuestas: { zhensi: { nombre: string } }[];
};

function FilaDemanda({ solicitud }: { solicitud: SolicitudDemanda }) {
  const cuantas = solicitud._count.propuestas;

  return (
    <Tarjeta
      className={`flex flex-col gap-3 py-4 ${
        cuantas > 0 ? "border-dorado/50 bg-dorado-tenue" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Etiqueta tono="apagado">{solicitud.codigo_publico}</Etiqueta>
        {cuantas > 0 ? (
          <Etiqueta tono="dorado">
            {cuantas === 1 ? "1 zhenshi se propuso" : `${cuantas} se propusieron`}
          </Etiqueta>
        ) : null}
        {solicitud.carrera ? (
          <Etiqueta tono="marino">{solicitud.carrera.clave}</Etiqueta>
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
        <span className="text-sm leading-relaxed text-tinta-suave">
          {solicitud.descripcion}
        </span>
      </div>

      {cuantas > 0 ? (
        <span className="text-sm text-tinta-suave">
          Se propusieron:{" "}
          {solicitud.propuestas.map((una) => una.zhensi.nombre).join(", ")}
        </span>
      ) : null}

      <BotonEnlace
        href={`/admin/demanda/${solicitud.id}`}
        variante="contorno"
        className="self-start"
      >
        {cuantas > 0 ? "Ver quién se propuso" : "Buscar quién la dé"}
      </BotonEnlace>
    </Tarjeta>
  );
}

export default async function PaginaDemanda() {
  const solicitudes = await db.solicitud.findMany({
    where: { estado: "abierta", archivada: false },
    orderBy: [{ apoyos: "desc" }, { creada_en: "asc" }],
    take: 100,
    select: {
      id: true,
      codigo_publico: true,
      tipo: true,
      titulo_tema: true,
      descripcion: true,
      apoyos: true,
      materia: { select: { nombre: true } },
      carrera: { select: { clave: true } },
      _count: { select: { propuestas: true } },
      propuestas: {
        orderBy: { creada_en: "asc" },
        select: { zhensi: { select: { nombre: true } } },
      },
    },
  });

  const conPropuestas = solicitudes.filter((una) => una._count.propuestas > 0);
  const resto = solicitudes.filter((una) => una._count.propuestas === 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Demanda</h1>
        <p className="leading-relaxed text-tinta-suave">
          Lo que está esperando ser agendado, con lo más pedido hasta arriba.
          Abre una y el sistema te dice qué zhenshis pueden darla y a qué hora
          coinciden.
        </p>
      </div>

      {conPropuestas.length > 0 ? (
        <Seccion
          titulo="Urgente: alguien se propuso"
          descripcion={
            conPropuestas.length === 1
              ? "Un zhenshi levantó la mano para dar esta. Ábrela y agéndala."
              : `Hay ${conPropuestas.length} solicitudes donde algún zhenshi levantó la mano.`
          }
        >
          <ul className="flex flex-col gap-2.5">
            {conPropuestas.map((solicitud) => (
              <li key={solicitud.id}>
                <FilaDemanda solicitud={solicitud} />
              </li>
            ))}
          </ul>
        </Seccion>
      ) : null}

      <Seccion
        titulo="Sin agendar"
        descripcion={
          resto.length === 1
            ? "1 solicitud esperando, sin que nadie se proponga."
            : `${resto.length} solicitudes esperando, sin que nadie se proponga.`
        }
      >
        {resto.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            {solicitudes.length === 0
              ? "No hay nada pendiente. Todo lo que pidieron ya está agendado o cerrado."
              : "En todas las que faltan ya se propuso alguien. Están arriba."}
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {resto.map((solicitud) => (
              <li key={solicitud.id}>
                <FilaDemanda solicitud={solicitud} />
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
