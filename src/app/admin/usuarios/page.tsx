import { db } from "@/lib/db";
import { FormularioAlta } from "./FormularioAlta";

export const dynamic = "force-dynamic";

export default async function PaginaUsuarios() {
  const cuentas = await db.usuario.findMany({
    orderBy: { creado_en: "asc" },
    select: {
      id: true,
      nombre: true,
      usuario: true,
      es_zhensi: true,
      es_admin: true,
      activo: true,
    },
  });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Usuarios</h1>

      <FormularioAlta />

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Cuentas ({cuentas.length})</h2>
        {cuentas.length === 0 ? (
          <p className="rounded-lg bg-white px-4 py-3 text-sm text-marino/70">
            Todavía no hay cuentas.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {cuentas.map((cuenta) => (
              <li
                key={cuenta.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-4 py-3"
              >
                <span className="font-medium">{cuenta.nombre}</span>
                <span className="text-sm text-marino/60">{cuenta.usuario}</span>
                <span className="ml-auto flex gap-1 text-xs">
                  {cuenta.es_zhensi ? (
                    <span className="rounded bg-marino/10 px-2 py-1">
                      zhensi
                    </span>
                  ) : null}
                  {cuenta.es_admin ? (
                    <span className="rounded bg-dorado/30 px-2 py-1">
                      admin
                    </span>
                  ) : null}
                  {!cuenta.activo ? (
                    <span className="rounded bg-red-100 px-2 py-1 text-red-700">
                      inactivo
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
