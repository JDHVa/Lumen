import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BarraSesion } from "@/components/BarraSesion";

export default async function LayoutZhensi({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await auth();

  if (!sesion?.user) redirect("/entrar?regresar=/zhensi");

  return (
    <div className="min-h-screen">
      <BarraSesion
        nombre={sesion.user.nombre}
        esAdmin={sesion.user.es_admin}
        zona="zhensi"
      />
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
