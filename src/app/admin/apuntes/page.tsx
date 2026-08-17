import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { extensionDe } from "@/lib/almacenamiento";
import { borrarApunte } from "@/app/zhensi/apuntes/acciones";

export const dynamic = "force-dynamic";

export default async function PaginaApuntesAdmin() {
  const apuntes = await db.apunte.findMany({
    orderBy: { creado_en: "desc" },
    take: 200,
    select: {
      id: true,
      titulo: true,
      generacion: true,
      archivo_url: true,
      materia: {
        select: { nombre: true, carrera: { select: { clave: true } } },
      },
      zhensi: { select: { nombre: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Apuntes</h1>
        <p className="leading-relaxed text-tinta-suave">
          Todo lo que han compartido los zhenshis. Se publica solo al subirse.
          Si algo no debería estar ahí, bórralo.
        </p>
      </div>

      <Seccion
        titulo="Todos"
        descripcion={
          apuntes.length === 1 ? "1 apunte." : `${apuntes.length} apuntes.`
        }
      >
        {apuntes.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía nadie ha subido apuntes.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {apuntes.map((apunte) => (
              <li key={apunte.id}>
                <Tarjeta className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-marino">
                      {apunte.titulo}
                    </span>
                    <Etiqueta tono="apagado">
                      {extensionDe(apunte.archivo_url)}
                    </Etiqueta>
                  </div>

                  <span className="text-sm text-tinta-suave">
                    {apunte.materia.nombre}
                    {apunte.materia.carrera
                      ? ` · ${apunte.materia.carrera.clave}`
                      : " · tronco común"}
                    {apunte.generacion ? ` · ${apunte.generacion}` : ""}
                  </span>

                  <span className="text-sm text-tinta-suave">
                    Lo subió {apunte.zhensi.nombre}
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={apunte.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center rounded-suave border border-marino/25 bg-white px-3.5 text-sm font-medium text-marino transition-colors hover:bg-marino-tenue"
                    >
                      Abrirlo
                    </a>

                    <form action={borrarApunte}>
                      <input type="hidden" name="id" value={apunte.id} />
                      <BotonAccion type="submit" tono="peligro">
                        Borrar
                      </BotonAccion>
                    </form>
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
