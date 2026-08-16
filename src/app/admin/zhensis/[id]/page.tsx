import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BotonEnlace } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { FormularioPerfil } from "@/app/zhensi/perfil/FormularioPerfil";
import { cargarDatosPerfil } from "@/app/zhensi/perfil/datos";
import { BLOQUES, DIAS } from "@/lib/horarios";

export const dynamic = "force-dynamic";

export default async function PaginaZhensiAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const zhensi = await db.usuario.findUnique({
    where: { id },
    select: { id: true, nombre: true, usuario: true, es_zhensi: true },
  });

  if (!zhensi || !zhensi.es_zhensi) notFound();

  const [datos, bloques] = await Promise.all([
    cargarDatosPerfil(zhensi.id),
    db.disponibilidad.findMany({
      where: { usuario_id: zhensi.id },
      orderBy: [{ dia_semana: "asc" }, { hora_inicio: "asc" }],
      select: { dia_semana: true, hora_inicio: true },
    }),
  ]);

  const porDia = DIAS.map((dia) => ({
    nombre: dia.nombre,
    horas: bloques
      .filter((bloque) => bloque.dia_semana === dia.numero)
      .map(
        (bloque) =>
          BLOQUES.find((item) => item.inicio === bloque.hora_inicio)?.etiqueta ??
          bloque.hora_inicio,
      ),
  })).filter((dia) => dia.horas.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <BotonEnlace
          href="/admin/zhensis"
          variante="texto"
          className="self-start"
        >
          ← Volver a zhensis
        </BotonEnlace>
        <h1 className="text-3xl font-bold">{zhensi.nombre}</h1>
        <p className="leading-relaxed text-tinta-suave">
          Estás editando el perfil de <strong>{zhensi.usuario}</strong>, no el
          tuyo. Lo que guardes aquí es lo mismo que él vería en su pantalla.
        </p>
      </div>

      <Aviso tono="neutral">
        La disponibilidad solo la puede capturar el zhensi desde su cuenta.
        {porDia.length === 0
          ? " Todavía no ha marcado ningún horario."
          : ""}
      </Aviso>

      {porDia.length > 0 ? (
        <Tarjeta className="flex flex-col gap-2 py-4">
          <span className="text-sm font-semibold text-marino">
            Horarios que ya marcó
          </span>
          {porDia.map((dia) => (
            <span key={dia.nombre} className="text-sm text-tinta-suave">
              {dia.nombre}: {dia.horas.join(", ")}
            </span>
          ))}
        </Tarjeta>
      ) : null}

      <FormularioPerfil
        usuarioId={zhensi.id}
        perfil={datos.perfil}
        carreras={datos.carreras}
        materias={datos.materias}
        materiasElegidas={datos.materiasElegidas}
      />
    </div>
  );
}
