import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Seccion } from "@/components/ui/Seccion";
import { FormularioCarrera } from "./FormularioCarrera";
import { ListaCarreras } from "./ListaCarreras";
import { PanelMaterias } from "./PanelMaterias";

export const dynamic = "force-dynamic";

export default async function PaginaCatalogo() {
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

  const troncoComun = materias.filter(
    (materia) => materia.carrera_id === null,
  ).length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="leading-relaxed text-tinta-suave">
          Aquí se cargan las carreras y sus materias. Es lo único que los
          zhenshis y los schüler van a poder elegir más adelante, así que lo que
          no esté aquí no existe para ellos.
        </p>
      </div>

      <Seccion
        titulo="Carreras"
        descripcion={`${carreras.length} cargadas. La clave es el nombre corto, tipo ISC.`}
      >
        <Tarjeta elevada className="p-6">
          <FormularioCarrera />
        </Tarjeta>
        <ListaCarreras carreras={carreras} />
      </Seccion>

      <Seccion
        titulo="Materias"
        descripcion={`${materias.length} en total, ${troncoComun} de tronco común. Elige la carrera y pega la lista completa de un jalón.`}
      >
        <PanelMaterias carreras={carreras} materias={materias} />
      </Seccion>
    </div>
  );
}
