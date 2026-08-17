import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { auth } from "@/lib/auth";
import { FormularioAlta } from "./FormularioAlta";
import { CambioContrasena } from "./CambioContrasena";

export const dynamic = "force-dynamic";

export default async function PaginaUsuarios() {
  const sesion = await auth();

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="leading-relaxed text-tinta-suave">
          Las cuentas se crean aquí. Los schüler nunca tienen cuenta.
        </p>
      </div>

      <Seccion
        titulo="Crear una cuenta"
        descripcion="Elige los roles antes de guardar. Se pueden marcar los dos."
      >
        <Tarjeta elevada className="p-6">
          <FormularioAlta />
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Cuentas"
        descripcion={`${cuentas.length} en total.`}
      >
        {cuentas.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay cuentas.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {cuentas.map((cuenta) => (
              <li key={cuenta.id}>
                <Tarjeta className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-marino">
                        {cuenta.nombre}
                      </span>
                      <span className="truncate text-sm text-tinta-suave">
                        {cuenta.usuario}
                      </span>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-1.5">
                      {cuenta.es_zhensi ? (
                        <Etiqueta tono="marino">zhenshi</Etiqueta>
                      ) : null}
                      {cuenta.es_admin ? (
                        <Etiqueta tono="dorado">admin</Etiqueta>
                      ) : null}
                      {!cuenta.activo ? (
                        <Etiqueta tono="alerta">inactivo</Etiqueta>
                      ) : null}
                    </div>
                  </div>

                  <CambioContrasena
                    id={cuenta.id}
                    nombre={cuenta.nombre}
                    esTuya={cuenta.id === sesion?.user.id}
                  />
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
