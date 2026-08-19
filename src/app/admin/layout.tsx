import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BarraSesion } from "@/components/BarraSesion";
import { NavegacionAdmin } from "@/components/NavegacionAdmin";
import { nombreActual } from "@/lib/cuenta";

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await auth();

  if (!sesion?.user) redirect("/iniciarsesion?regresar=/admin");
  if (!sesion.user.es_admin) redirect("/zhensi");

  const avisos = await db.solicitud.count({
    where: {
      reportes_error: { gt: 0 },
      estado: { not: "agendada" },
      archivada: false,
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <BarraSesion
        nombre={await nombreActual(sesion.user.id, sesion.user.nombre)}
        esAdmin={sesion.user.es_admin}
        zona="admin"
      />
      <NavegacionAdmin avisos={avisos} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
