import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { alternarActivo } from "./acciones";
import { BorrarCuenta } from "./BorrarCuenta";

export const dynamic = "force-dynamic";

export default async function PaginaZhensis() {
  const sesion = await auth();

  const zhensis = await db.usuario.findMany({
    where: { es_zhensi: true },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      usuario: true,
      activo: true,
      es_admin: true,
      perfil: {
        select: {
          visible_publico: true,
          semestre: true,
          carrera: { select: { clave: true } },
        },
      },
      _count: { select: { materias: true, disponibilidades: true } },
    },
  });

  const activos = zhensis.filter((zhensi) => zhensi.activo);
  const archivados = zhensis.filter((zhensi) => !zhensi.activo);
  const visibles = activos.filter(
    (zhensi) => zhensi.perfil?.visible_publico,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Zhenshis</h1>
        <p className="leading-relaxed text-tinta-suave">
          Aquí ves quién ya llenó su perfil y quién no. Si a alguien le da
          flojera entrar, tú puedes llenárselo desde aquí. Al archivar a alguien
          desaparece de esta lista y de la galería pública.
        </p>
      </div>

      <Seccion
        titulo="Activos"
        descripcion={`${activos.length} en total, ${visibles} apareciendo en la galería pública.`}
      >
        {activos.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay zhenshis. Créalos en la pestaña de Usuarios.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {activos.map((zhensi) => (
              <li key={zhensi.id}>
                <Tarjeta className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-marino">
                        {zhensi.nombre}
                      </span>
                      <span className="truncate text-sm text-tinta-suave">
                        {zhensi.usuario}
                        {zhensi.perfil?.carrera
                          ? ` · ${zhensi.perfil.carrera.clave}`
                          : ""}
                        {zhensi.perfil?.semestre
                          ? ` · ${zhensi.perfil.semestre}º semestre`
                          : ""}
                      </span>
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-1.5">
                      {zhensi.perfil?.visible_publico ? (
                        <Etiqueta tono="dorado">en galería</Etiqueta>
                      ) : null}
                      {!zhensi.activo ? (
                        <Etiqueta tono="alerta">inactivo</Etiqueta>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-tinta-suave">
                    <span>
                      {zhensi._count.materias === 1
                        ? "1 materia"
                        : `${zhensi._count.materias} materias`}
                    </span>
                    <span>
                      {zhensi._count.disponibilidades === 1
                        ? "1 bloque libre"
                        : `${zhensi._count.disponibilidades} bloques libres`}
                    </span>

                    <div className="ml-auto flex flex-wrap items-center gap-3">
                      <BotonEnlace
                        href={`/admin/zhensis/${zhensi.id}`}
                        variante="contorno"
                      >
                        Editar perfil
                      </BotonEnlace>

                      {zhensi.id === sesion?.user.id ? null : (
                        <form action={alternarActivo}>
                          <input type="hidden" name="id" value={zhensi.id} />
                          <BotonAccion
                            type="submit"
                            tono={zhensi.activo ? "peligro" : "afirmar"}
                          >
                            {zhensi.activo ? "Archivar" : "Reactivar"}
                          </BotonAccion>
                        </form>
                      )}
                    </div>
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      {archivados.length > 0 ? (
        <Seccion
          titulo="Archivados"
          descripcion="Ya no aparecen arriba ni en la galería, y no salen como candidatos al agendar. Su historial se conserva."
        >
          <ul className="flex flex-col gap-2.5">
            {archivados.map((zhensi) => (
              <li key={zhensi.id}>
                <Tarjeta className="flex flex-col gap-3 py-4 opacity-80">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-marino">
                        {zhensi.nombre}
                      </span>
                      <span className="truncate text-sm text-tinta-suave">
                        {zhensi.usuario}
                      </span>
                    </div>
                    <Etiqueta tono="apagado">archivado</Etiqueta>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <form action={alternarActivo}>
                      <input type="hidden" name="id" value={zhensi.id} />
                      <BotonAccion type="submit" tono="afirmar">
                        Reactivar
                      </BotonAccion>
                    </form>

                    <BorrarCuenta
                      id={zhensi.id}
                      nombre={zhensi.nombre}
                      usuario={zhensi.usuario}
                    />
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        </Seccion>
      ) : null}
    </div>
  );
}
