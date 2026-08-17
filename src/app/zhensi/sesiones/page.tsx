import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { etiquetaDeBloque, esEnLinea } from "@/lib/horarios";
import { diaSemanaDe, fechaLegible } from "@/lib/fechas";
import { horasDe, conUnDecimal } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function PaginaMisSesiones() {
  const sesion = await auth();
  if (!sesion?.user) redirect("/iniciarsesion?regresar=/zhensi/sesiones");

  const hoy = new Date();
  const desde = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
  );

  const todas = await db.sesion.findMany({
    where: {
      zhensi_id: sesion.user.id,
      estado: { in: ["publicada", "realizada"] },
    },
    orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
    select: {
      id: true,
      titulo: true,
      fecha: true,
      hora_inicio: true,
      hora_fin: true,
      salon: true,
      estado: true,
      notas_publicas: true,
      asistencia: { select: { cantidad: true } },
    },
  });

  const proximas = todas.filter((una) => una.fecha >= desde);
  const pasadas = todas.filter((una) => una.fecha < desde).reverse();

  const realizadas = todas.filter((una) => una.estado === "realizada");
  const horas = conUnDecimal(horasDe(realizadas));
  const atendidos = realizadas.reduce(
    (suma, una) => suma + (una.asistencia?.cantidad ?? 0),
    0,
  );

  function Lista({ lista }: { lista: typeof todas }) {
    return (
      <ul className="flex flex-col gap-2.5">
        {lista.map((una) => {
          const dia = diaSemanaDe(una.fecha);
          return (
            <li key={una.id}>
              <Tarjeta className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-semibold text-marino">
                    {fechaLegible(una.fecha)} ·{" "}
                    {etiquetaDeBloque(dia, una.hora_inicio)}
                  </span>
                  {esEnLinea(dia) ? (
                    <Etiqueta tono="dorado">en línea</Etiqueta>
                  ) : null}
                  {una.estado === "realizada" ? (
                    <Etiqueta tono="apagado">ya se dio</Etiqueta>
                  ) : null}
                </div>
                <span className="font-titulos text-lg font-semibold text-marino">
                  {una.titulo}
                </span>
                <span className="text-sm text-tinta-suave">{una.salon}</span>
                {una.notas_publicas ? (
                  <span className="text-sm text-tinta-suave">
                    {una.notas_publicas}
                  </span>
                ) : null}
              </Tarjeta>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mis sesiones</h1>
        <p className="leading-relaxed text-tinta-suave">
          Lo que te asignaron. Si algo no te queda, avísale a un admin para que
          la mueva o la cancele.
        </p>
      </div>

      {realizadas.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Tarjeta className="flex flex-col gap-1 py-5">
            <span className="font-titulos text-3xl font-bold text-marino">
              {horas}
            </span>
            <span className="text-sm font-medium text-tinta">
              Horas acumuladas
            </span>
            <span className="text-xs text-tinta-suave">
              Se calculan solas de tus sesiones dadas
            </span>
          </Tarjeta>
          <Tarjeta className="flex flex-col gap-1 py-5">
            <span className="font-titulos text-3xl font-bold text-marino">
              {realizadas.length}
            </span>
            <span className="text-sm font-medium text-tinta">
              Sesiones dadas
            </span>
          </Tarjeta>
          <Tarjeta className="flex flex-col gap-1 py-5">
            <span className="font-titulos text-3xl font-bold text-marino">
              {atendidos}
            </span>
            <span className="text-sm font-medium text-tinta">
              Compañeros atendidos
            </span>
          </Tarjeta>
        </div>
      ) : null}

      <Seccion
        titulo="Lo que viene"
        descripcion={
          proximas.length === 1
            ? "1 sesión por delante."
            : `${proximas.length} sesiones por delante.`
        }
      >
        {proximas.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            No tienes nada agendado. Entre mejor esté tu perfil y tu
            disponibilidad, más fácil es que te toque.
          </Tarjeta>
        ) : (
          <Lista lista={proximas} />
        )}
      </Seccion>

      {pasadas.length > 0 ? (
        <Seccion titulo="Ya pasaron">
          <Lista lista={pasadas} />
        </Seccion>
      ) : null}
    </div>
  );
}
