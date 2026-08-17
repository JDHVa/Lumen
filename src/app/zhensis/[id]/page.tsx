import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { Iniciales } from "@/components/Iniciales";
import { LigasRedes } from "@/components/LigasRedes";
import { etiquetaDeBloque, esEnLinea } from "@/lib/horarios";
import { diaSemanaDe, fechaLegible } from "@/lib/fechas";

export const dynamic = "force-dynamic";

export default async function PaginaZhenshi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const zhenshi = await db.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      activo: true,
      es_zhensi: true,
      perfil: {
        select: {
          foto_url: true,
          semestre: true,
          descripcion_corta: true,
          visible_publico: true,
          instagram: true,
          whatsapp: true,
          facebook: true,
          linkedin: true,
          github: true,
          tiktok: true,
          carrera: { select: { clave: true, nombre: true } },
        },
      },
      materias: {
        select: { materia: { select: { nombre: true, activa: true } } },
      },
    },
  });

  if (
    !zhenshi ||
    !zhenshi.es_zhensi ||
    !zhenshi.activo ||
    !zhenshi.perfil?.visible_publico
  ) {
    notFound();
  }

  const hoy = new Date();
  const desde = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
  );

  const proximas = await db.sesion.findMany({
    where: { zhensi_id: zhenshi.id, estado: "publicada", fecha: { gte: desde } },
    orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
    take: 6,
    select: {
      id: true,
      titulo: true,
      fecha: true,
      hora_inicio: true,
      salon: true,
    },
  });

  const materias = zhenshi.materias
    .filter((fila) => fila.materia.activa)
    .map((fila) => fila.materia.nombre)
    .sort((a, b) => a.localeCompare(b, "es"));

  const perfil = zhenshi.perfil;

  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <BotonEnlace href="/zhensis" variante="texto" className="mb-6 self-start">
          ← Todos los zhenshis
        </BotonEnlace>

        <Tarjeta elevada className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-4">
            {perfil.foto_url ? (
              <img
                src={perfil.foto_url}
                alt={zhenshi.nombre}
                className="size-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <Iniciales nombre={zhenshi.nombre} grande />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="text-3xl font-bold">{zhenshi.nombre}</h1>
              <span className="text-tinta-suave">
                {[
                  perfil.carrera?.nombre,
                  perfil.semestre ? `${perfil.semestre}º semestre` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Zhenshi de Lumen"}
              </span>
            </div>
          </div>

          {perfil.descripcion_corta ? (
            <p className="leading-relaxed break-words text-tinta">
              “{perfil.descripcion_corta}”
            </p>
          ) : null}

          <LigasRedes redes={perfil} />
        </Tarjeta>

        <div className="flex flex-col gap-9 pt-9">
          <Seccion
            titulo="Lo que puede explicarte"
            descripcion={
              materias.length === 1
                ? "1 materia."
                : `${materias.length} materias.`
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {materias.map((materia) => (
                <Etiqueta key={materia} tono="marino">
                  {materia}
                </Etiqueta>
              ))}
            </div>
          </Seccion>

          {proximas.length > 0 ? (
            <Seccion titulo="Sus próximas sesiones">
              <ul className="flex flex-col gap-2.5">
                {proximas.map((sesion) => {
                  const dia = diaSemanaDe(sesion.fecha);
                  return (
                    <li key={sesion.id}>
                      <Tarjeta className="flex flex-col gap-1 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Etiqueta tono="marino">
                            {fechaLegible(sesion.fecha)}
                          </Etiqueta>
                          <Etiqueta tono="apagado">
                            {etiquetaDeBloque(dia, sesion.hora_inicio)}
                          </Etiqueta>
                          {esEnLinea(dia) ? (
                            <Etiqueta tono="dorado">en línea</Etiqueta>
                          ) : null}
                        </div>
                        <span className="font-medium text-marino">
                          {sesion.titulo}
                        </span>
                        <span className="text-sm text-tinta-suave">
                          {sesion.salon}
                        </span>
                      </Tarjeta>
                    </li>
                  );
                })}
              </ul>
            </Seccion>
          ) : null}

          <Tarjeta className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="max-w-sm leading-relaxed text-tinta-suave">
              ¿Necesitas ayuda con algo de esto? No le escribas directo: pide
              ayuda por aquí y nosotros armamos la sesión.
            </p>
            <BotonEnlace href="/pedir-ayuda">Pedir ayuda</BotonEnlace>
          </Tarjeta>
        </div>
      </main>

      <PiePublico />
    </div>
  );
}
