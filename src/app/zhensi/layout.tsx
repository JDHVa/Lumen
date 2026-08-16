import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BarraSesion } from "@/components/BarraSesion";

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
        nombre={sesion.user.nombre}
        esAdmin={sesion.user.es_admin}
        zona="zhensi"
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
