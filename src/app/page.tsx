import Image from "next/image";
import Link from "next/link";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import {
  MODALIDAD_EN_LINEA,
  etiquetaDeBloque,
  esEnLinea,
} from "@/lib/horarios";
import { diaSemanaDe, fechaLegible, hoyEnFecha, yaTermino } from "@/lib/fechas";
import { ligaWhatsapp } from "@/lib/contacto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const pasos = [
  {
    numero: "1",
    titulo: "Pides ayuda",
    texto:
      "Eliges tu materia o escribes el tema que sea. Sin cuenta, sin correo, sin registro.",
  },
  {
    numero: "2",
    titulo: "Se junta la demanda",
    texto:
      "Si alguien ya pidió lo mismo, presionas “yo también lo necesito” y sube el contador.",
  },
  {
    numero: "3",
    titulo: "Alguien lo agenda",
    texto:
      "Un admin busca al zhenshi indicado, aparta salón y hora, y la sesión se publica aquí.",
  },
  {
    numero: "4",
    titulo: "Llegas y ya",
    texto:
      "Ves el día y el salón aquí en el inicio. No hay lista, ni cupo, ni confirmación.",
  },
];

export default async function PaginaInicio() {
  const ahora = new Date();

  const agendadas = await db.sesion.findMany({
    where: { estado: "publicada", fecha: { gte: hoyEnFecha(ahora) } },
    orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
    take: 24,
    select: {
      id: true,
      titulo: true,
      fecha: true,
      hora_inicio: true,
      hora_fin: true,
      salon: true,
      notas_publicas: true,
      zhensi: {
        select: {
          id: true,
          nombre: true,
          perfil: { select: { visible_publico: true } },
        },
      },
    },
  });

  const proximas = agendadas
    .filter((una) => !yaTermino(una, ahora))
    .slice(0, 8);

  const porDia: {
    etiqueta: string;
    dia: number;
    sesiones: typeof proximas;
  }[] = [];

  for (const sesion of proximas) {
    const etiqueta = fechaLegible(sesion.fecha);
    const ultimo = porDia.at(-1);
    if (ultimo && ultimo.etiqueta === etiqueta) ultimo.sesiones.push(sesion);
    else
      porDia.push({
        etiqueta,
        dia: diaSemanaDe(sesion.fecha),
        sesiones: [sesion],
      });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="flex-1">
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 pb-12 pt-12 text-center sm:pt-20">
          <Image
            src="/logo.png"
            alt="Lumen"
            width={200}
            height={107}
            priority
            className="h-auto w-40 mix-blend-multiply sm:w-52"
          />
          <h1 className="max-w-2xl text-4xl leading-tight font-bold sm:text-5xl">
            Alguien de tu escuela ya entendió eso que no te sale
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-tinta-suave">
            Lumen conecta a quien necesita ayuda con alumnos que la pueden dar.
            Es gratis, es presencial y no tienes que crear ninguna cuenta.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <BotonEnlace href="/pedir-ayuda" tamano="grande">
              Pedir ayuda
            </BotonEnlace>
            <BotonEnlace href="/solicitudes" variante="contorno" tamano="grande">
              Ver las solicitudes
            </BotonEnlace>
          </div>
          <p className="text-sm text-tinta-suave">
            Sin cuenta · Sin costo · Sin inscripción
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
            <h2 className="text-2xl font-semibold">Próximas sesiones</h2>
          </div>

          {proximas.length === 0 ? (
            <Tarjeta className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="max-w-sm leading-relaxed text-tinta-suave">
                Ahorita no hay ninguna sesión agendada. Pide ayuda y en cuanto
                se junte gente se agenda una.
              </p>
              <p className="max-w-sm leading-relaxed text-tinta-suave">
                Entre semana son presenciales, de 12 a 6 de la tarde.{" "}
                <strong className="text-marino">{MODALIDAD_EN_LINEA}</strong>
              </p>
            </Tarjeta>
          ) : (
            <div className="flex flex-col gap-8">
              {porDia.map((grupo) => (
                <div key={grupo.etiqueta} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-titulos text-lg font-semibold text-marino">
                      {grupo.etiqueta}
                    </h3>
                    {esEnLinea(grupo.dia) ? (
                      <Etiqueta tono="dorado">en línea</Etiqueta>
                    ) : null}
                    <span className="h-px flex-1 bg-marino/10" />
                  </div>

                  <ul className="grid gap-4 sm:grid-cols-2">
                    {grupo.sesiones.map((sesion) => (
                      <li key={sesion.id}>
                        <Tarjeta
                          elevada
                          className="flex h-full flex-col gap-2 p-5 text-left"
                        >
                          <Etiqueta tono="marino">
                            {etiquetaDeBloque(grupo.dia, sesion.hora_inicio)}
                          </Etiqueta>
                          <span className="font-titulos text-xl font-semibold text-marino">
                            {sesion.titulo}
                          </span>
                          <span className="text-sm text-tinta-suave">
                            Con{" "}
                            {sesion.zhensi.perfil?.visible_publico ? (
                              <Link
                                href={`/zhensis/${sesion.zhensi.id}`}
                                className="font-medium text-marino underline underline-offset-4 hover:text-marino-claro"
                              >
                                {sesion.zhensi.nombre}
                              </Link>
                            ) : (
                              sesion.zhensi.nombre
                            )}{" "}
                            · {sesion.salon}
                          </span>
                          {sesion.notas_publicas ? (
                            <span className="text-sm text-tinta-suave">
                              {sesion.notas_publicas}
                            </span>
                          ) : null}
                        </Tarjeta>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <Link
                href="/zhensis"
                className="text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
              >
                ¿Quiénes son los que dan las sesiones?
              </Link>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="pb-5 text-2xl font-semibold">Cómo funciona</h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {pasos.map((paso) => (
              <li key={paso.numero}>
                <Tarjeta className="flex h-full items-start gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-dorado font-titulos text-lg font-bold text-marino-hondo">
                    {paso.numero}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-titulos text-lg font-semibold text-marino">
                      {paso.titulo}
                    </span>
                    <span className="text-sm leading-relaxed text-tinta-suave">
                      {paso.texto}
                    </span>
                  </span>
                </Tarjeta>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-8">
          <div className="overflow-hidden rounded-tarjeta bg-marino px-6 py-10 text-center text-white sm:px-12 sm:py-14">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              ¿Te late explicar lo que ya dominas?
            </h2>
            <p className="mx-auto max-w-lg pt-3 leading-relaxed text-white/80">
              Los zhenshis son alumnos que dan sesiones de apoyo a sus
              compañeros. Si te interesa entrarle, escríbenos y te contactaremos
              pronto.
            </p>
            <div className="flex flex-col justify-center gap-3 pt-6 sm:flex-row">
              <BotonEnlace href="/zhensis" variante="principal">
                Conoce a los zhenshis
              </BotonEnlace>
              <BotonEnlace
                href={ligaWhatsapp("Hola, me interesa ser zhenshi en Lumen.")}
                variante="contorno"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escríbenos
              </BotonEnlace>
            </div>
          </div>
        </section>
      </main>

      <PiePublico />
    </div>
  );
}
