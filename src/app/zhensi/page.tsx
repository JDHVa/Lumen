import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { nombreActual } from "@/lib/cuenta";

export const dynamic = "force-dynamic";

export default async function PaginaZhensi() {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const [materias, bloques, sesiones, apuntes, abiertas, perfil] =
    await Promise.all([
      db.zhensi_materia.count({ where: { usuario_id: sesion.user.id } }),
      db.disponibilidad.count({ where: { usuario_id: sesion.user.id } }),
      db.sesion.count({
        where: {
          zhensi_id: sesion.user.id,
          estado: { in: ["publicada", "realizada"] },
        },
      }),
      db.apunte.count({ where: { zhensi_id: sesion.user.id } }),
      db.solicitud.count({ where: { estado: "abierta", archivada: false } }),
      db.perfil_zhensi.findUnique({
        where: { usuario_id: sesion.user.id },
        select: { visible_publico: true },
      }),
    ]);

  const listas = [
    {
      titulo: "Mi perfil",
      href: "/zhensi/perfil",
      resumen:
        materias === 0
          ? "Todavía no marcas ninguna materia."
          : materias === 1
            ? "1 materia marcada."
            : `${materias} materias marcadas.`,
      pendiente: materias === 0,
    },
    {
      titulo: "Mi disponibilidad",
      href: "/zhensi/disponibilidad",
      resumen:
        bloques === 0
          ? "Todavía no marcas ningún horario."
          : bloques === 1
            ? "1 bloque a la semana."
            : `${bloques} bloques a la semana.`,
      pendiente: bloques === 0,
    },
    {
      titulo: "Mis sesiones",
      href: "/zhensi/sesiones",
      resumen:
        sesiones === 0
          ? "Todavía no tienes sesiones asignadas."
          : sesiones === 1
            ? "1 sesión asignada."
            : `${sesiones} sesiones asignadas.`,
      pendiente: false,
    },
    {
      titulo: "Mis apuntes",
      href: "/zhensi/apuntes",
      resumen:
        apuntes === 0
          ? "Todavía no subes ningún apunte."
          : apuntes === 1
            ? "1 apunte publicado."
            : `${apuntes} apuntes publicados.`,
      pendiente: apuntes === 0,
    },
    {
      titulo: "Solicitudes abiertas",
      href: "/zhensi/solicitudes",
      resumen:
        abiertas === 0
          ? "Ahora mismo no hay solicitudes abiertas."
          : abiertas === 1
            ? "1 solicitud esperando. Puedes proponerte para darla."
            : `${abiertas} solicitudes esperando. Puedes proponerte para darlas.`,
      pendiente: false,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Hola, {await nombreActual(sesion.user.id, sesion.user.nombre)}</h1>
        <p className="leading-relaxed text-tinta-suave">
          Esta es tu vista de zhenshi. Aquí vas a llevar tu disponibilidad, tus
          sesiones y tu perfil.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {listas.map((item) => (
          <li key={item.titulo}>
            <Tarjeta
              elevada
              className="flex h-full flex-col items-start gap-3 py-5"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <span className="font-titulos text-lg font-semibold text-marino">
                  {item.titulo}
                </span>
                {item.pendiente ? (
                  <Etiqueta tono="dorado">falta</Etiqueta>
                ) : null}
              </div>
              <p className="text-sm text-tinta-suave">{item.resumen}</p>
              <BotonEnlace
                href={item.href}
                variante="contorno"
                className="mt-auto"
              >
                Abrir
              </BotonEnlace>
            </Tarjeta>
          </li>
        ))}
      </ul>

      {perfil?.visible_publico ? (
        <p className="text-sm text-tinta-suave">
          Estás apareciendo en la galería pública de zhenshis.
        </p>
      ) : null}

    </div>
  );
}
