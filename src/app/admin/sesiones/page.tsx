import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { etiquetaDeBloque } from "@/lib/horarios";
import { diaSemanaDe, fechaLegible } from "@/lib/fechas";
import { cambiarEstadoSesion } from "./acciones";
import { FormularioSesion } from "./FormularioSesion";
import { FormularioAsistencia } from "./FormularioAsistencia";

export const dynamic = "force-dynamic";

const tonos = {
  borrador: "apagado",
  publicada: "marino",
  realizada: "dorado",
  cancelada: "alerta",
} as const;

export default async function PaginaSesiones() {
  const [sesiones, zhensis] = await Promise.all([
    db.sesion.findMany({
      orderBy: [{ fecha: "desc" }, { hora_inicio: "asc" }],
      take: 100,
      select: {
        id: true,
        titulo: true,
        fecha: true,
        hora_inicio: true,
        hora_fin: true,
        salon: true,
        estado: true,
        notas_publicas: true,
        zhensi: { select: { nombre: true } },
        creador: { select: { nombre: true } },
        solicitud: { select: { codigo_publico: true } },
        asistencia: { select: { cantidad: true } },
      },
    }),
    db.usuario.findMany({
      where: { es_zhensi: true, activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  const publicadas = sesiones.filter((s) => s.estado === "publicada").length;

  const hoy = new Date();
  const corte = new Date(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
  );
  const porCapturar = sesiones.filter(
    (s) => s.estado !== "cancelada" && s.fecha <= corte && !s.asistencia,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Sesiones</h1>
        <p className="leading-relaxed text-tinta-suave">
          Todo lo agendado. Las publicadas son las que ve la gente en el inicio.
          Cancelar no borra nada: la solicitud se reabre para que no se pierda
          la demanda.
        </p>
      </div>

      <FormularioSesion zhensis={zhensis} />

      <Seccion
        titulo="Agenda"
        descripcion={`${sesiones.length} en total, ${publicadas} publicadas${porCapturar > 0 ? `, ${porCapturar} ya pasaron y les falta capturar asistencia` : ""}.`}
      >
        {sesiones.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay ninguna sesión. Agenda la primera desde Demanda.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {sesiones.map((sesion) => (
              <li key={sesion.id}>
                <Tarjeta className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Etiqueta tono={tonos[sesion.estado]}>
                      {sesion.estado}
                    </Etiqueta>
                    {sesion.solicitud ? (
                      <Etiqueta tono="apagado">
                        {sesion.solicitud.codigo_publico}
                      </Etiqueta>
                    ) : (
                      <Etiqueta tono="apagado">a mano</Etiqueta>
                    )}
                    <span className="ml-auto text-sm font-semibold text-marino">
                      {fechaLegible(sesion.fecha)} ·{" "}
                      {etiquetaDeBloque(
                        diaSemanaDe(sesion.fecha),
                        sesion.hora_inicio,
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-marino">
                      {sesion.titulo}
                    </span>
                    <span className="text-sm text-tinta-suave">
                      {sesion.zhensi.nombre} · {sesion.salon}
                    </span>
                    {sesion.notas_publicas ? (
                      <span className="text-sm text-tinta-suave">
                        {sesion.notas_publicas}
                      </span>
                    ) : null}
                    <span className="text-xs text-tinta-suave">
                      La agendó {sesion.creador.nombre}
                    </span>
                    {sesion.asistencia ? (
                      <span className="text-sm font-medium text-exito">
                        {sesion.asistencia.cantidad === 0
                          ? "No llegó nadie."
                          : sesion.asistencia.cantidad === 1
                            ? "Llegó 1 persona."
                            : `Llegaron ${sesion.asistencia.cantidad} personas.`}
                      </span>
                    ) : null}
                  </div>

                  {sesion.estado !== "cancelada" && sesion.fecha <= corte ? (
                    <FormularioAsistencia
                      sesionId={sesion.id}
                      cantidadPrevia={sesion.asistencia?.cantidad ?? null}
                    />
                  ) : null}

                  {sesion.estado === "realizada" ? null : (
                    <div className="flex flex-wrap items-center gap-4">
                      {sesion.estado !== "publicada" ? (
                        <form action={cambiarEstadoSesion}>
                          <input type="hidden" name="id" value={sesion.id} />
                          <input
                            type="hidden"
                            name="estado"
                            value="publicada"
                          />
                          <button
                            type="submit"
                            className="min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
                          >
                            Publicar
                          </button>
                        </form>
                      ) : null}

                      {sesion.estado !== "cancelada" ? (
                        <form action={cambiarEstadoSesion}>
                          <input type="hidden" name="id" value={sesion.id} />
                          <input
                            type="hidden"
                            name="estado"
                            value="cancelada"
                          />
                          <button
                            type="submit"
                            className="min-h-[40px] px-1 text-sm text-tinta-suave underline underline-offset-4 hover:text-marino"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : null}
                    </div>
                  )}
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
