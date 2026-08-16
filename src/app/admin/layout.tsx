import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { BarraSesion } from "@/components/BarraSesion";

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await auth();

  if (!sesion?.user) redirect("/entrar?regresar=/admin");
  if (!sesion.user.es_admin) redirect("/zhensi");

  return (
    <div className="min-h-screen">
      <BarraSesion
        nombre={sesion.user.nombre}
        esAdmin={sesion.user.es_admin}
        zona="admin"
      />
      <nav className="border-b border-marino/10 bg-white">
        <div className="mx-auto flex max-w-3xl gap-4 px-4 py-2 text-sm">
          <Link href="/admin">Inicio</Link>
          <Link href="/admin/usuarios">Usuarios</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
