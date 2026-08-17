import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { alternarActivo } from "./acciones";

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

  const visibles = zhensis.filter(
    (zhensi) => zhensi.perfil?.visible_publico,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Zhenshis</h1>
        <p className="leading-relaxed text-tinta-suave">
          Aquí ves quién ya llenó su perfil y quién no. Si a alguien le da flojera
          entrar, tú puedes llenárselo desde aquí.
        </p>
      </div>

      <Seccion
        titulo="Todos"
        descripcion={`${zhensis.length} en total, ${visibles} apareciendo en la galería pública.`}
      >
        {zhensis.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay zhenshis. Créalos en la pestaña de Usuarios.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {zhensis.map((zhensi) => (
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
                          <button
                            type="submit"
                            className="min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
                          >
                            {zhensi.activo ? "Desactivar" : "Reactivar"}
                          </button>
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
    </div>
  );
}
