import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { claveBloque } from "@/lib/horarios";
import { Cuadricula } from "./Cuadricula";

export const dynamic = "force-dynamic";

export default async function PaginaDisponibilidad() {
  const sesion = await auth();
  if (!sesion?.user) redirect("/iniciarsesion?regresar=/zhensi/disponibilidad");

  const bloques = await db.disponibilidad.findMany({
    where: { usuario_id: sesion.user.id },
    select: { dia_semana: true, hora_inicio: true },
  });

  const marcados = bloques.map((bloque) =>
    claveBloque(bloque.dia_semana, bloque.hora_inicio),
  );

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mi disponibilidad</h1>
        <p className="leading-relaxed text-tinta-suave">
          Marca las horas en las que sí puedes dar una sesión. Esto se repite
          todas las semanas hasta que lo cambies, así que no tienes que volver a
          capturarlo cada lunes. Marcar una hora no te compromete a nada: solo
          le dice al admin cuándo buscarte.
        </p>
      </div>

      <Cuadricula marcados={marcados} />
    </div>
  );
}
