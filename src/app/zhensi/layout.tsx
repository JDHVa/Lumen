import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BarraSesion } from "@/components/BarraSesion";
import { NavegacionZhensi } from "@/components/NavegacionZhensi";
import { nombreActual } from "@/lib/cuenta";

export default async function LayoutZhensi({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await auth();

  if (!sesion?.user) redirect("/iniciarsesion?regresar=/zhensi");

  return (
    <div className="flex min-h-screen flex-col">
      <BarraSesion
        nombre={await nombreActual(sesion.user.id, sesion.user.nombre)}
        esAdmin={sesion.user.es_admin}
        zona="zhensi"
      />
      <NavegacionZhensi />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
