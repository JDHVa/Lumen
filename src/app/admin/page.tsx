import Link from "next/link";

export default function PaginaAdmin() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Panel de administración</h1>
      <p className="text-marino/80">
        Por ahora solo está lista el alta de cuentas. Las demás pantallas llegan
        en las siguientes fases.
      </p>
      <Link
        href="/admin/usuarios"
        className="rounded-lg bg-marino px-5 py-3 text-center font-medium text-white"
      >
        Usuarios
      </Link>
      <ul className="flex flex-col gap-2 text-sm text-marino/70">
        <li className="rounded-lg bg-white px-4 py-3">Catálogo — fase 1</li>
        <li className="rounded-lg bg-white px-4 py-3">Demanda — fase 4</li>
        <li className="rounded-lg bg-white px-4 py-3">Sesiones — fase 4</li>
        <li className="rounded-lg bg-white px-4 py-3">Dashboard — fase 6</li>
        <li className="rounded-lg bg-white px-4 py-3">Buzón — fase 7</li>
        <li className="rounded-lg bg-white px-4 py-3">Apuntes — fase 8</li>
      </ul>
    </section>
  );
}
