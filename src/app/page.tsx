import Image from "next/image";
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
import { diaSemanaDe, fechaLegible } from "@/lib/fechas";
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
  const hoy = new Date();
  const desde = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
  );

  const proximas = await db.sesion.findMany({
    where: { estado: "publicada", fecha: { gte: desde } },
    orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
    take: 8,
    select: {
      id: true,
      titulo: true,
      fecha: true,
      hora_inicio: true,
      salon: true,
      notas_publicas: true,
      zhensi: { select: { nombre: true } },
    },
  });

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
            <ul className="grid gap-4 sm:grid-cols-2">
              {proximas.map((sesion) => {
                const dia = diaSemanaDe(sesion.fecha);
                return (
                  <li key={sesion.id}>
                    <Tarjeta
                      elevada
                      className="flex h-full flex-col gap-2 p-5 text-left"
                    >
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
                      <span className="font-titulos text-xl font-semibold text-marino">
                        {sesion.titulo}
                      </span>
                      <span className="text-sm text-tinta-suave">
                        Con {sesion.zhensi.nombre} · {sesion.salon}
                      </span>
                      {sesion.notas_publicas ? (
                        <span className="text-sm text-tinta-suave">
                          {sesion.notas_publicas}
                        </span>
                      ) : null}
                    </Tarjeta>
                  </li>
                );
              })}
            </ul>
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
              compañeros. Si te interesa entrarle, habla con alguien del equipo
              de Lumen y te damos tu cuenta.
            </p>
            <div className="flex justify-center pt-6">
              <BotonEnlace href="/zhensis" variante="principal">
                Conoce a los zhenshis
              </BotonEnlace>
            </div>
          </div>
        </section>
      </main>

      <PiePublico />
    </div>
  );
}
