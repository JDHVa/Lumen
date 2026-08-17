import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";

export const dynamic = "force-dynamic";

const pendientes: { titulo: string; fase: string }[] = [];

export default async function PaginaZhensi() {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const [materias, bloques, perfil] = await Promise.all([
    db.zhensi_materia.count({ where: { usuario_id: sesion.user.id } }),
    db.disponibilidad.count({ where: { usuario_id: sesion.user.id } }),
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
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Hola, {sesion.user.nombre}</h1>
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

      <ul className="grid gap-3 sm:grid-cols-2">
        {pendientes.map((item) => (
          <li key={item.titulo}>
            <Tarjeta className="flex h-full items-center justify-between gap-3">
              <span className="font-titulos text-lg font-semibold text-marino">
                {item.titulo}
              </span>
              <Etiqueta tono="apagado">{item.fase}</Etiqueta>
            </Tarjeta>
          </li>
        ))}
      </ul>
    </div>
  );
}
