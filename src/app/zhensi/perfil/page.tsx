import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { FormularioPerfil } from "./FormularioPerfil";
import { cargarDatosPerfil } from "./datos";
import { nombreActual } from "@/lib/cuenta";
import { MiContrasena } from "./MiContrasena";

export const dynamic = "force-dynamic";

export default async function PaginaPerfil() {
  const sesion = await auth();
  if (!sesion?.user) redirect("/iniciarsesion?regresar=/zhensi/perfil");

  const datos = await cargarDatosPerfil(sesion.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="leading-relaxed text-tinta-suave">
          Marca las materias que sí te sientes capaz de explicar. De aquí sale
          la lista de candidatos cuando alguien pide ayuda, así que entre mejor
          esté esto, mejor te van a caer las sesiones.
        </p>
      </div>

      <FormularioPerfil
        usuarioId={sesion.user.id}
        nombre={await nombreActual(sesion.user.id, sesion.user.nombre)}
        perfil={datos.perfil}
        carreras={datos.carreras}
        materias={datos.materias}
        materiasElegidas={datos.materiasElegidas}
      />

      <MiContrasena />
    </div>
  );
}
