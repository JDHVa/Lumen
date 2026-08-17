import { db } from "@/lib/db";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { CONTACTO, ligaWhatsapp } from "@/lib/contacto";
import { FiltroZhensis, type ZhenshiVista } from "./FiltroZhensis";

export const dynamic = "force-dynamic";

export default async function PaginaZhensis() {
  const [cuentas, carreras] = await Promise.all([
    db.usuario.findMany({
      where: {
        activo: true,
        es_zhensi: true,
        perfil: { is: { visible_publico: true } },
        materias: { some: {} },
      },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        perfil: {
          select: {
            semestre: true,
            descripcion_corta: true,
            carrera_id: true,
            carrera: { select: { clave: true } },
          },
        },
        materias: {
          select: { materia: { select: { nombre: true, activa: true } } },
        },
      },
    }),
    db.carrera.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, clave: true, nombre: true },
    }),
  ]);

  const zhenshis: ZhenshiVista[] = cuentas.map((cuenta) => ({
    id: cuenta.id,
    nombre: cuenta.nombre,
    semestre: cuenta.perfil?.semestre ?? null,
    descripcion: cuenta.perfil?.descripcion_corta ?? null,
    carreraId: cuenta.perfil?.carrera_id ?? null,
    carreraClave: cuenta.perfil?.carrera?.clave ?? null,
    materias: cuenta.materias
      .filter((fila) => fila.materia.activa)
      .map((fila) => fila.materia.nombre)
      .sort((a, b) => a.localeCompare(b, "es")),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <div className="flex flex-col gap-2 pb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Los zhenshis</h1>
          <p className="max-w-2xl leading-relaxed text-tinta-suave">
            Son alumnos como tú que ya pasaron por esa materia y aceptaron
            explicarla. No son maestros ni les pagan por esto. Búscalos por
            materia y luego pide ayuda: nosotros los conectamos.
          </p>
        </div>

        {zhenshis.length === 0 ? (
          <Tarjeta className="flex flex-col items-center gap-4 py-14 text-center">
            <p className="max-w-md leading-relaxed text-tinta-suave">
              Todavía no hay ningún zhenshi publicado. Están terminando de
              armar sus perfiles.
            </p>
            <p className="max-w-md leading-relaxed text-tinta-suave">
              Mientras tanto puedes pedir ayuda de todos modos: la solicitud se
              queda guardada y se agenda en cuanto haya quién.
            </p>
            <BotonEnlace href="/pedir-ayuda">Pedir ayuda</BotonEnlace>
          </Tarjeta>
        ) : (
          <FiltroZhensis zhenshis={zhenshis} carreras={carreras} />
        )}

        <section className="pt-12">
          <div className="overflow-hidden rounded-tarjeta bg-marino px-6 py-10 text-center text-white sm:px-12">
            <h2 className="text-2xl font-semibold text-white">
              ¿Quieres ser zhenshi?
            </h2>
            <p className="mx-auto max-w-lg pt-3 leading-relaxed text-white/80">
              Si hay una materia que se te da bien y no te da flojera
              explicarla, escríbenos y te contactaremos pronto.
            </p>
            <div className="flex flex-col justify-center gap-3 pt-6 sm:flex-row">
              <BotonEnlace
                href={ligaWhatsapp(
                  "Hola, me interesa ser zhenshi en Lumen.",
                )}
                variante="principal"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escríbenos por WhatsApp
              </BotonEnlace>
              <BotonEnlace
                href={CONTACTO.instagram}
                variante="contorno"
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACTO.instagramLegible}
              </BotonEnlace>
            </div>
          </div>
        </section>
      </main>

      <PiePublico />
    </div>
  );
}
