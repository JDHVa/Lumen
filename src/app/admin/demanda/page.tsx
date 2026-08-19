import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";

export const dynamic = "force-dynamic";

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
    },
  });

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

      <Seccion
        titulo="Sin agendar"
        descripcion={
          solicitudes.length === 1
            ? "1 solicitud esperando."
            : `${solicitudes.length} solicitudes esperando.`
        }
      >
        {solicitudes.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            No hay nada pendiente. Todo lo que pidieron ya está agendado o
            cerrado.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {solicitudes.map((solicitud) => (
              <li key={solicitud.id}>
                <Tarjeta className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Etiqueta tono="apagado">
                      {solicitud.codigo_publico}
                    </Etiqueta>
                    {solicitud.carrera ? (
                      <Etiqueta tono="marino">
                        {solicitud.carrera.clave}
                      </Etiqueta>
                    ) : null}
                    <span className="ml-auto text-sm font-semibold text-marino">
                      {solicitud.apoyos === 1
                        ? "1 apoyo"
                        : `${solicitud.apoyos} apoyos`}
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

                  <BotonEnlace
                    href={`/admin/demanda/${solicitud.id}`}
                    variante="contorno"
                    className="self-start"
                  >
                    Buscar quién la dé
                  </BotonEnlace>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
