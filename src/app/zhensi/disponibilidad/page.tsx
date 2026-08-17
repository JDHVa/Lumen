import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { claveBloque, MODALIDAD_EN_LINEA } from "@/lib/horarios";
import { Aviso } from "@/components/ui/Aviso";
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

      <Aviso tono="neutral">
        Entre semana las sesiones son presenciales, de 12 a 6 de la tarde, en
        bloques de una hora. {MODALIDAD_EN_LINEA} Van de 7 de la mañana a 7 de
        la noche en bloques de dos horas, y así se le va a mostrar al schüler
        cuando vea las sesiones.
      </Aviso>

      <Cuadricula marcados={marcados} />
    </div>
  );
}
