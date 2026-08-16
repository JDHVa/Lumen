import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";

const pendientes = [
  { titulo: "Catálogo de carreras y materias", fase: "Fase 1" },
  { titulo: "Demanda y asignación", fase: "Fase 4" },
  { titulo: "Sesiones", fase: "Fase 4" },
  { titulo: "Dashboard", fase: "Fase 6" },
  { titulo: "Buzón", fase: "Fase 7" },
  { titulo: "Apuntes", fase: "Fase 8" },
];

export default function PaginaAdmin() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <p className="leading-relaxed text-tinta-suave">
          Por ahora solo está lista el alta de cuentas. Las demás pantallas
          llegan en las siguientes fases.
        </p>
      </div>

      <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Usuarios</h2>
          <p className="text-sm text-tinta-suave">
            Da de alta zhensis y admin.
          </p>
        </div>
        <BotonEnlace href="/admin/usuarios">Abrir</BotonEnlace>
      </Tarjeta>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Lo que falta</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {pendientes.map((item) => (
            <li key={item.titulo}>
              <Tarjeta className="flex h-full items-center justify-between gap-3">
                <span className="text-sm font-medium text-marino">
                  {item.titulo}
                </span>
                <Etiqueta tono="apagado">{item.fase}</Etiqueta>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
