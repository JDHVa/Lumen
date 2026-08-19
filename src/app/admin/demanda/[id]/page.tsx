import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { cruzar, limpiarFranjas } from "@/lib/cruce";
import { leerClaveBloque, nombreDia, etiquetaDeBloque } from "@/lib/horarios";
import { proximaFechaCon, comoTexto, fechaLegible } from "@/lib/fechas";
import { FormularioAgendar, type CandidatoVista } from "./FormularioAgendar";

export const dynamic = "force-dynamic";

export default async function PaginaAgendar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const solicitud = await db.solicitud.findUnique({
    where: { id },
    select: {
      id: true,
      codigo_publico: true,
      tipo: true,
      titulo_tema: true,
      descripcion: true,
      apoyos: true,
      estado: true,
      materia_id: true,
      franjas_preferidas: true,
      materia: { select: { nombre: true } },
      carrera: { select: { clave: true, nombre: true } },
      propuestas: {
        orderBy: { creada_en: "asc" },
        select: {
          id: true,
          mensaje: true,
          creada_en: true,
          zhensi: { select: { id: true, nombre: true, activo: true } },
        },
      },
    },
  });

  if (!solicitud) notFound();

  const franjas = limpiarFranjas(solicitud.franjas_preferidas);

  const zhensis = await db.usuario.findMany({
    where: {
      es_zhensi: true,
      activo: true,
      ...(solicitud.materia_id
        ? { materias: { some: { materia_id: solicitud.materia_id } } }
        : {}),
    },
    select: {
      id: true,
      nombre: true,
      disponibilidades: { select: { dia_semana: true, hora_inicio: true } },
    },
  });

  const candidatos = cruzar(
    franjas,
    zhensis.map((zhensi) => ({
      id: zhensi.id,
      nombre: zhensi.nombre,
      bloques: zhensi.disponibilidades,
    })),
  );

  const propuestos = new Set(
    solicitud.propuestas.map((propuesta) => propuesta.zhensi.id),
  );

  const paraFormulario: CandidatoVista[] = candidatos.map((candidato) => ({
    id: candidato.id,
    nombre: candidato.nombre,
    propuso: propuestos.has(candidato.id),
    bloques: candidato.coincidencias
      .map((clave) => {
        const bloque = leerClaveBloque(clave);
        if (!bloque) return null;
        const fecha = proximaFechaCon(bloque.dia);
        return {
          clave,
          texto: `${nombreDia(bloque.dia)} de ${etiquetaDeBloque(bloque.dia, bloque.inicio)} · ${fechaLegible(fecha)}`,
          fechaSugerida: comoTexto(fecha),
        };
      })
      .filter((bloque) => bloque !== null),
  }));

  paraFormulario.sort(
    (a, b) => Number(b.propuso) - Number(a.propuso),
  );

  const nombreCosa =
    solicitud.tipo === "materia"
      ? (solicitud.materia?.nombre ?? "Materia")
      : (solicitud.titulo_tema ?? "Tema especial");

  const franjasLegibles = franjas
    .map((clave) => leerClaveBloque(clave))
    .filter((bloque) => bloque !== null)
    .sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio))
    .map(
      (bloque) =>
        `${nombreDia(bloque.dia)} ${etiquetaDeBloque(bloque.dia, bloque.inicio)}`,
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <BotonEnlace
          href="/admin/demanda"
          variante="texto"
          className="self-start"
        >
          ← Volver a demanda
        </BotonEnlace>
        <div className="flex flex-wrap items-center gap-3">
          <Etiqueta tono="apagado">{solicitud.codigo_publico}</Etiqueta>
          <Etiqueta tono="marino">
            {solicitud.apoyos === 1
              ? "1 apoyo"
              : `${solicitud.apoyos} apoyos`}
          </Etiqueta>
        </div>
        <h1 className="text-3xl font-bold">{nombreCosa}</h1>
        <p className="leading-relaxed break-words text-tinta-suave">
          {solicitud.descripcion}
        </p>
      </div>

      {solicitud.estado === "agendada" ? (
        <Aviso tono="exito">
          Esta solicitud ya tiene sesión asignada. Se administra desde Sesiones.
        </Aviso>
      ) : null}

      <Tarjeta className="flex flex-col gap-1 py-4">
        <span className="text-sm font-semibold text-marino">
          Horarios que pidieron
        </span>
        <span className="text-sm text-tinta-suave">
          {franjasLegibles.join(" · ")}
        </span>
        {solicitud.carrera ? (
          <span className="pt-2 text-sm text-tinta-suave">
            Carrera: {solicitud.carrera.nombre}
          </span>
        ) : null}
      </Tarjeta>

      {solicitud.propuestas.length > 0 ? (
        <Seccion
          titulo="Se propusieron"
          descripcion="Levantaron la mano solos desde su panel. Tú sigues decidiendo quién la da."
        >
          <ul className="flex flex-col gap-2.5">
            {solicitud.propuestas.map((propuesta) => {
              const cruza = candidatos.some(
                (candidato) => candidato.id === propuesta.zhensi.id,
              );

              return (
                <li key={propuesta.id}>
                  <Tarjeta className="flex flex-col gap-2 border-dorado/50 bg-dorado-tenue py-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="font-medium text-marino">
                        {propuesta.zhensi.nombre}
                      </span>
                      {propuesta.zhensi.activo ? null : (
                        <Etiqueta tono="alerta">cuenta archivada</Etiqueta>
                      )}
                      <span className="ml-auto text-sm text-tinta-suave">
                        {fechaLegible(propuesta.creada_en)}
                      </span>
                    </div>

                    {propuesta.mensaje ? (
                      <p className="text-sm leading-relaxed break-words text-tinta-suave">
                        “{propuesta.mensaje}”
                      </p>
                    ) : null}

                    <span className="text-sm text-tinta-suave">
                      {cruza
                        ? "Sí coincide con los horarios que pidieron: sale abajo para agendarlo."
                        : "No coincide con los horarios que pidieron, o no tiene la materia marcada. Si de todos modos va, agenda la sesión a mano desde Sesiones."}
                    </span>
                  </Tarjeta>
                </li>
              );
            })}
          </ul>
        </Seccion>
      ) : null}

      {solicitud.estado === "agendada" ? null : candidatos.length === 0 ? (
        <Seccion titulo="Quién puede darla">
          <Aviso tono="error">
            {zhensis.length === 0
              ? solicitud.materia_id
                ? "Ningún zhenshi activo tiene esta materia marcada en su perfil. Pídele a alguien que la marque, o agenda la sesión a mano desde Sesiones."
                : "No hay zhenshis activos con disponibilidad capturada."
              : `Hay ${zhensis.length} ${zhensis.length === 1 ? "zhenshi que puede" : "zhenshis que pueden"} dar esto, pero ninguno coincide con los horarios que pidieron. Toca negociar otro horario o agendarla a mano desde Sesiones.`}
          </Aviso>
        </Seccion>
      ) : (
        <>
          <Seccion
            titulo="Quién puede darla"
            descripcion={
              candidatos.length === 1
                ? "1 zhenshi da esta materia y coincide en horario."
                : `${candidatos.length} zhenshis dan esta materia y coinciden en horario.`
            }
          >
            <ul className="flex flex-col gap-2.5">
              {candidatos.map((candidato) => (
                <li key={candidato.id}>
                  <Tarjeta className="flex flex-col gap-1 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-marino">
                        {candidato.nombre}
                      </span>
                      {propuestos.has(candidato.id) ? (
                        <Etiqueta tono="dorado">se propuso</Etiqueta>
                      ) : null}
                    </div>
                    <span className="text-sm text-tinta-suave">
                      Coincide en{" "}
                      {candidato.coincidencias
                        .map((clave) => {
                          const bloque = leerClaveBloque(clave);
                          if (!bloque) return "";
                          return `${nombreDia(bloque.dia)} ${etiquetaDeBloque(bloque.dia, bloque.inicio)}`;
                        })
                        .join(", ")}
                    </span>
                  </Tarjeta>
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion titulo="Agendar">
            <FormularioAgendar
              solicitudId={solicitud.id}
              tituloSugerido={nombreCosa}
              candidatos={paraFormulario}
            />
          </Seccion>
        </>
      )}
    </div>
  );
}
