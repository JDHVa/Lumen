import { auth } from "@/lib/auth";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";

const pendientes = [
  { titulo: "Mi disponibilidad", fase: "Fase 2" },
  { titulo: "Mi perfil", fase: "Fase 2" },
  { titulo: "Mis sesiones", fase: "Fase 4" },
  { titulo: "Subir apuntes", fase: "Fase 8" },
];

export default async function PaginaZhensi() {
  const sesion = await auth();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Hola, {sesion?.user.nombre}</h1>
        <p className="leading-relaxed text-tinta-suave">
          Esta es tu vista de zhensi. Aquí vas a llevar tu disponibilidad, tus
          sesiones y tu perfil.
        </p>
      </div>

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
