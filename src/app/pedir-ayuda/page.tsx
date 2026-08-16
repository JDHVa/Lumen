import { db } from "@/lib/db";
import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { MODALIDAD_EN_LINEA } from "@/lib/horarios";
import { FormularioAyuda } from "./FormularioAyuda";

export const dynamic = "force-dynamic";

export default async function PaginaPedirAyuda() {
  const [carrerasCrudas, materias] = await Promise.all([
    db.carrera.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        clave: true,
        _count: { select: { materias: true } },
      },
    }),
    db.materia.findMany({
      where: { activa: true },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        carrera_id: true,
        semestre: true,
        activa: true,
      },
    }),
  ]);

  const carreras = carrerasCrudas.map((carrera) => ({
    id: carrera.id,
    nombre: carrera.nombre,
    clave: carrera.clave,
    cuantas: carrera._count.materias,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <div className="flex flex-col gap-2 pb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Pedir ayuda</h1>
          <p className="leading-relaxed text-tinta-suave">
            No necesitas cuenta ni dar tu nombre. Nos dices qué no te sale y
            cuándo puedes, y nosotros buscamos quién te lo explique.{" "}
            {MODALIDAD_EN_LINEA}
          </p>
        </div>

        {carreras.length === 0 ? (
          <Tarjeta className="py-12 text-center text-sm text-tinta-suave">
            Todavía no hay carreras cargadas, así que no se pueden recibir
            solicitudes. Vuelve en unos días.
          </Tarjeta>
        ) : (
          <FormularioAyuda carreras={carreras} materias={materias} />
        )}
      </main>

      <PiePublico />
    </div>
  );
}
