import { auth } from "@/lib/auth";

export default async function PaginaZhensi() {
  const sesion = await auth();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Mi vista de zhensi</h1>
      <p className="text-marino/80">
        Hola, {sesion?.user.nombre}. Aquí verás tu disponibilidad, tus sesiones
        y tu perfil cuando estén listos.
      </p>
      <ul className="flex flex-col gap-2 text-sm text-marino/70">
        <li className="rounded-lg bg-white px-4 py-3">
          Mi disponibilidad — fase 2
        </li>
        <li className="rounded-lg bg-white px-4 py-3">Mis sesiones — fase 4</li>
        <li className="rounded-lg bg-white px-4 py-3">Mi perfil — fase 2</li>
        <li className="rounded-lg bg-white px-4 py-3">
          Subir apuntes — fase 8
        </li>
      </ul>
    </section>
  );
}
