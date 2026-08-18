import { Suspense } from "react";
import { db } from "@/lib/db";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { normalizarCodigo } from "@/lib/codigo";
import { leerHuella } from "@/lib/huella";
import { leerClaveBloque, nombreDia, etiquetaDeBloque } from "@/lib/horarios";
import { Filtros } from "./Filtros";
import { apoyar } from "./acciones";
import { ReportarError } from "./ReportarError";

export const dynamic = "force-dynamic";

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

export default async function PaginaSolicitudes({
  searchParams,
}: {
  searchParams: Promise<{ carrera?: string; codigo?: string }>;
}) {
  const parametros = await searchParams;
  const codigoBuscado = parametros.codigo
    ? normalizarCodigo(parametros.codigo)
    : null;
  const carreraFiltro = parametros.carrera ?? "";

  const [carrerasCrudas, solicitudes, huella] = await Promise.all([
    db.carrera.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        clave: true,
        _count: { select: { materias: true } },
      },
    }),
    db.solicitud.findMany({
      where: {
        estado: { in: ["abierta", "agendada"] },
        ...(codigoBuscado ? { codigo_publico: codigoBuscado } : {}),
        ...(carreraFiltro && !codigoBuscado
          ? { carrera_id: carreraFiltro }
          : {}),
      },
      orderBy: [{ apoyos: "desc" }, { creada_en: "desc" }],
      take: 100,
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
    }),
    leerHuella(),
  ]);

  const carreras = carrerasCrudas.map((carrera) => ({
    id: carrera.id,
    nombre: carrera.nombre,
    clave: carrera.clave,
    cuantas: carrera._count.materias,
  }));

  const vacio: { solicitud_id: string }[] = [];

  const [mios, reportadas] = huella
    ? await Promise.all([
        db.apoyo_solicitud.findMany({
          where: {
            huella,
            solicitud_id: { in: solicitudes.map((s) => s.id) },
          },
          select: { solicitud_id: true },
        }),
        db.reporte_error_solicitud.findMany({
          where: {
            huella,
            solicitud_id: { in: solicitudes.map((s) => s.id) },
          },
          select: { solicitud_id: true },
        }),
      ])
    : [vacio, vacio];

  const yaApoyadas = new Set(mios.map((fila) => fila.solicitud_id));
  const yaReportadas = new Set(reportadas.map((fila) => fila.solicitud_id));

  const hayBusqueda = Boolean(parametros.codigo || carreraFiltro);

  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <div className="flex flex-col gap-2 pb-7">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Lo que la gente está pidiendo
          </h1>
          <p className="leading-relaxed text-tinta-suave">
            Si alguien ya pidió lo que tú necesitas, no mandes otra solicitud:
            presiona <strong>yo también lo necesito</strong>. Entre más gente lo
            pida, más rápido se agenda.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Suspense fallback={null}>
            <Filtros carreras={carreras} />
          </Suspense>

          {parametros.codigo && !codigoBuscado ? (
            <Tarjeta className="py-8 text-center text-sm text-tinta-suave">
              Ese código no tiene la forma correcta. Debe verse como LUM-A3K9.
            </Tarjeta>
          ) : solicitudes.length === 0 ? (
            <Tarjeta className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="max-w-sm leading-relaxed text-tinta-suave">
                {hayBusqueda
                  ? "No hay ninguna solicitud que coincida. Prueba quitando el filtro."
                  : "Todavía nadie ha pedido nada. Puedes ser el primero."}
              </p>
              <BotonEnlace href="/pedir-ayuda">Pedir ayuda</BotonEnlace>
            </Tarjeta>
          ) : (
            <ul className="flex flex-col gap-3">
              {solicitudes.map((solicitud) => {
                const franjas = resumirFranjas(solicitud.franjas_preferidas);
                const apoyada = yaApoyadas.has(solicitud.id);

                return (
                  <li key={solicitud.id}>
                    <Tarjeta elevada className="flex flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <Etiqueta tono="apagado">
                          {solicitud.codigo_publico}
                        </Etiqueta>
                        {solicitud.carrera ? (
                          <Etiqueta tono="marino">
                            {solicitud.carrera.clave}
                          </Etiqueta>
                        ) : null}
                        {solicitud.estado === "agendada" ? (
                          <Etiqueta tono="dorado">ya se agendó</Etiqueta>
                        ) : null}
                        <span className="ml-auto text-sm font-semibold text-marino">
                          {solicitud.apoyos === 1
                            ? "1 persona"
                            : `${solicitud.apoyos} personas`}
                        </span>
                      </div>

                      <h2 className="font-titulos text-xl font-semibold text-marino">
                        {solicitud.tipo === "materia"
                          ? (solicitud.materia?.nombre ?? "Materia")
                          : solicitud.titulo_tema}
                      </h2>

                      <p className="leading-relaxed break-words text-tinta-suave">
                        {solicitud.descripcion}
                      </p>

                      {franjas.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold tracking-wide text-tinta-suave uppercase">
                            Horarios que pidieron
                          </span>
                          {franjas.map((linea) => (
                            <span
                              key={linea}
                              className="text-sm text-tinta-suave"
                            >
                              {linea}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {solicitud.estado === "abierta" ? (
                        apoyada ? (
                          <p className="text-sm font-medium text-exito">
                            Ya dijiste que tú también lo necesitas.
                          </p>
                        ) : (
                          <form action={apoyar} className="pt-1">
                            <input
                              type="hidden"
                              name="solicitud_id"
                              value={solicitud.id}
                            />
                            <button
                              type="submit"
                              className="inline-flex min-h-[44px] items-center rounded-suave bg-dorado px-4 text-sm font-semibold text-marino-hondo transition-colors hover:bg-dorado-hondo"
                            >
                              Yo también lo necesito
                            </button>
                          </form>
                        )
                      ) : (
                        <p className="text-sm text-tinta-suave">
                          Esta ya tiene sesión asignada. Aparecerá en el inicio
                          con su día y su salón.
                        </p>
                      )}

                      {solicitud.estado === "abierta" ? (
                        <div className="border-t border-marino/10 pt-2">
                          <ReportarError
                            solicitudId={solicitud.id}
                            yaReportada={yaReportadas.has(solicitud.id)}
                          />
                        </div>
                      ) : null}
                    </Tarjeta>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <PiePublico />
    </div>
  );
}
