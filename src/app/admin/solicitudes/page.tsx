import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { leerClaveBloque, nombreDia, etiquetaDeBloque } from "@/lib/horarios";
import { cambiarEstado } from "./acciones";

export const dynamic = "force-dynamic";

const tonos = {
  abierta: "marino",
  agendada: "dorado",
  cerrada: "apagado",
  oculta: "alerta",
} as const;

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

export default async function PaginaSolicitudes() {
  const solicitudes = await db.solicitud.findMany({
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
      materia: { select: { nombre: true } },
      carrera: { select: { clave: true } },
    },
  });

  const abiertas = solicitudes.filter((s) => s.estado === "abierta").length;

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
            {solicitudes.map((solicitud) => {
              const franjas = resumirFranjas(solicitud.franjas_preferidas);

              return (
                <li key={solicitud.id}>
                  <Tarjeta className="flex flex-col gap-3 py-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Etiqueta tono="apagado">
                        {solicitud.codigo_publico}
                      </Etiqueta>
                      <Etiqueta tono={tonos[solicitud.estado]}>
                        {solicitud.estado}
                      </Etiqueta>
                      {solicitud.carrera ? (
                        <span className="text-sm text-tinta-suave">
                          {solicitud.carrera.clave}
                        </span>
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
                      <span className="text-sm leading-relaxed break-words text-tinta-suave">
                        {solicitud.descripcion}
                      </span>
                    </div>

                    {franjas.map((linea) => (
                      <span key={linea} className="text-sm text-tinta-suave">
                        {linea}
                      </span>
                    ))}

                    {solicitud.estado === "agendada" ? (
                      <p className="text-sm text-tinta-suave">
                        Ya tiene sesión. Se administra desde Sesiones.
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        {solicitud.estado !== "abierta" ? (
                          <Accion
                            id={solicitud.id}
                            destino="abierta"
                            texto="Reabrir"
                          />
                        ) : null}
                        {solicitud.estado !== "cerrada" ? (
                          <Accion
                            id={solicitud.id}
                            destino="cerrada"
                            texto="Cerrar"
                          />
                        ) : null}
                        {solicitud.estado !== "oculta" ? (
                          <Accion
                            id={solicitud.id}
                            destino="oculta"
                            texto="Ocultar"
                            tono="peligro"
                          />
                        ) : null}
                      </div>
                    )}
                  </Tarjeta>
                </li>
              );
            })}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
