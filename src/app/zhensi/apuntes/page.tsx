import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { Aviso } from "@/components/ui/Aviso";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { hayAlmacenamiento } from "@/lib/almacenamiento";
import { cargarDatosPerfil } from "../perfil/datos";
import { FormularioApunte } from "./FormularioApunte";
import { borrarApunte } from "./acciones";

export const dynamic = "force-dynamic";

export default async function PaginaMisApuntes() {
  const sesion = await auth();
  if (!sesion?.user) redirect("/iniciarsesion?regresar=/zhensi/apuntes");

  const [datos, mios] = await Promise.all([
    cargarDatosPerfil(sesion.user.id),
    db.apunte.findMany({
      where: { zhensi_id: sesion.user.id },
      orderBy: { creado_en: "desc" },
      select: {
        id: true,
        titulo: true,
        generacion: true,
        archivo_url: true,
        materia: { select: { nombre: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mis apuntes</h1>
        <p className="leading-relaxed text-tinta-suave">
          Sube lo que te sirvió a ti: resúmenes, formularios, fotos de la
          libreta. Se publica de inmediato y cualquiera puede bajarlo.
        </p>
      </div>

      {!hayAlmacenamiento() ? (
        <Aviso tono="error">
          Todavía no está configurado el guardado de archivos, así que subir no
          va a funcionar. Avísale a quien administra el sitio.
        </Aviso>
      ) : null}

      <Seccion titulo="Subir uno nuevo">
        <FormularioApunte
          carreras={datos.carreras}
          materias={datos.materias}
          carreraPropia={datos.perfil?.carrera_id ?? null}
        />
      </Seccion>

      <Seccion
        titulo="Los que has subido"
        descripcion={
          mios.length === 1 ? "1 apunte." : `${mios.length} apuntes.`
        }
      >
        {mios.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no subes ninguno.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {mios.map((apunte) => (
              <li key={apunte.id}>
                <Tarjeta className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-marino">
                      {apunte.titulo}
                    </span>
                    <Etiqueta tono="dorado">publicado</Etiqueta>
                  </div>

                  <span className="text-sm text-tinta-suave">
                    {apunte.materia.nombre}
                    {apunte.generacion ? ` · ${apunte.generacion}` : ""}
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={apunte.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center rounded-suave border border-marino/25 bg-white px-3.5 text-sm font-medium text-marino transition-colors hover:bg-marino-tenue"
                    >
                      Ver el archivo
                    </a>
                    <form action={borrarApunte}>
                      <input type="hidden" name="id" value={apunte.id} />
                      <BotonAccion type="submit" tono="peligro">
                        Quitarlo
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
