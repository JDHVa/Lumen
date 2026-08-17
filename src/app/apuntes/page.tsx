import { db } from "@/lib/db";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { extensionDe } from "@/lib/almacenamiento";
import { FiltroApuntes, type ApunteVista } from "./FiltroApuntes";

export const dynamic = "force-dynamic";

export default async function PaginaApuntes() {
  const [crudos, carreras] = await Promise.all([
    db.apunte.findMany({
      orderBy: { creado_en: "desc" },
      take: 300,
      select: {
        id: true,
        titulo: true,
        generacion: true,
        archivo_url: true,
        materia: { select: { nombre: true, carrera_id: true } },
        zhensi: { select: { nombre: true } },
      },
    }),
    db.carrera.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, clave: true, nombre: true },
    }),
  ]);

  const apuntes: ApunteVista[] = crudos.map((uno) => ({
    id: uno.id,
    titulo: uno.titulo,
    generacion: uno.generacion,
    archivo: uno.archivo_url,
    extension: extensionDe(uno.archivo_url),
    materia: uno.materia.nombre,
    carreraId: uno.materia.carrera_id,
    zhenshi: uno.zhensi.nombre,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <div className="flex flex-col gap-2 pb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Apuntes</h1>
          <p className="max-w-2xl leading-relaxed text-tinta-suave">
            Resúmenes y material que dejaron los que ya pasaron por esa
            materia. Es gratis y no necesitas cuenta para bajarlo.
          </p>
        </div>

        {apuntes.length === 0 ? (
          <Tarjeta className="flex flex-col items-center gap-4 py-14 text-center">
            <p className="max-w-md leading-relaxed text-tinta-suave">
              Todavía no hay apuntes publicados. Se están juntando.
            </p>
            <BotonEnlace href="/pedir-ayuda">Pedir ayuda</BotonEnlace>
          </Tarjeta>
        ) : (
          <FiltroApuntes apuntes={apuntes} carreras={carreras} />
        )}
      </main>

      <PiePublico />
    </div>
  );
}
