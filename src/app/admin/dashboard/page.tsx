import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { cargarMetricas } from "./datos";

export const dynamic = "force-dynamic";

function Numero({
  valor,
  etiqueta,
  nota,
}: {
  valor: string | number;
  etiqueta: string;
  nota?: string;
}) {
  return (
    <Tarjeta className="flex flex-col gap-1 py-5">
      <span className="font-titulos text-3xl font-bold text-marino">
        {valor}
      </span>
      <span className="text-sm font-medium text-tinta">{etiqueta}</span>
      {nota ? <span className="text-xs text-tinta-suave">{nota}</span> : null}
    </Tarjeta>
  );
}

function Descarga({ tabla, texto }: { tabla: string; texto: string }) {
  return (
    <a
      href={`/admin/dashboard/csv?tabla=${tabla}`}
      className="inline-flex min-h-[40px] items-center text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
    >
      {texto}
    </a>
  );
}

export default async function PaginaDashboard() {
  const datos = await cargarMetricas();

  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="leading-relaxed text-tinta-suave">
          Solo cuentan las sesiones marcadas como realizadas. Las horas no se
          capturan: se calculan sumando la duración de esas sesiones.
        </p>
      </div>

      <Seccion titulo="Lo que ha pasado" accion={<Descarga tabla="resumen" texto="Descargar CSV" />}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Numero
            valor={datos.resumen.semana}
            etiqueta="Sesiones esta semana"
            nota="Desde el lunes"
          />
          <Numero valor={datos.resumen.mes} etiqueta="Sesiones este mes" />
          <Numero valor={datos.resumen.total} etiqueta="Sesiones en total" />
          <Numero
            valor={datos.resumen.asistentes}
            etiqueta="Schüler atendidos"
            nota="Suma de las asistencias capturadas"
          />
          <Numero
            valor={datos.resumen.horas}
            etiqueta="Horas de mentoría"
            nota="Calculadas, nunca capturadas"
          />
          <Numero
            valor={datos.resumen.promedioPorSesion}
            etiqueta="Asistentes por sesión"
            nota="Promedio"
          />
        </div>

        {datos.resumen.sinCapturar > 0 ? (
          <p className="text-sm text-tinta-suave">
            Ojo: hay {datos.resumen.sinCapturar}{" "}
            {datos.resumen.sinCapturar === 1
              ? "sesión realizada sin asistencia capturada"
              : "sesiones realizadas sin asistencia capturada"}
            , así que estos números se quedan cortos.
          </p>
        ) : null}
      </Seccion>

      <Seccion titulo="Zhenshis">
        <div className="grid gap-3 sm:grid-cols-3">
          <Numero
            valor={datos.zhenshisRegistrados}
            etiqueta="Zhenshis activos"
            nota="Cuentas dadas de alta"
          />
          <Numero
            valor={datos.resumen.zhenshisActivos}
            etiqueta="Ya dieron una sesión"
          />
          <Numero
            valor={
              datos.espera === null ? "—" : `${datos.espera} d`
            }
            etiqueta="Espera promedio"
            nota="De que se pide a que se agenda"
          />
        </div>
      </Seccion>

      <Seccion
        titulo="Horas por zhenshi"
        accion={<Descarga tabla="zhenshis" texto="Descargar CSV" />}
      >
        {datos.zhenshis.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Nadie ha dado una sesión todavía.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {datos.zhenshis.map((fila) => (
              <li key={fila.nombre}>
                <Tarjeta className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                  <span className="min-w-0 flex-1 truncate font-medium text-marino">
                    {fila.nombre}
                  </span>
                  <span className="text-sm text-tinta-suave">
                    {fila.sesiones === 1
                      ? "1 sesión"
                      : `${fila.sesiones} sesiones`}
                  </span>
                  <span className="text-sm text-tinta-suave">
                    {fila.asistentes} atendidos
                  </span>
                  <Etiqueta tono="dorado">{fila.horas} h</Etiqueta>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion
        titulo="Lo más pedido"
        descripcion={`${datos.totalSolicitudes} solicitudes en total.`}
        accion={<Descarga tabla="materias" texto="Descargar CSV" />}
      >
        {datos.pedidas.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay solicitudes.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2">
            {datos.pedidas.map((fila) => (
              <li key={fila.nombre}>
                <Tarjeta className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0 truncate text-sm font-medium text-marino">
                    {fila.nombre}
                  </span>
                  <span className="text-sm text-tinta-suave">
                    {fila.cuantas === 1
                      ? "1 vez"
                      : `${fila.cuantas} veces`}
                  </span>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Solicitudes por estado">
        <div className="grid gap-3 sm:grid-cols-4">
          <Numero valor={datos.porEstado.abierta} etiqueta="Abiertas" />
          <Numero valor={datos.porEstado.agendada} etiqueta="Agendadas" />
          <Numero valor={datos.porEstado.cerrada} etiqueta="Cerradas" />
          <Numero valor={datos.porEstado.oculta} etiqueta="Ocultas" />
        </div>
      </Seccion>

      <Seccion
        titulo="Buzón"
        descripcion={`${datos.buzon.total} mensajes, ${datos.buzon.sinAtender} sin atender.`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Numero valor={datos.buzon.sugerencia} etiqueta="Sugerencias" />
          <Numero
            valor={datos.buzon.agradecimiento}
            etiqueta="Agradecimientos"
          />
          <Numero
            valor={datos.buzon.apoyo}
            etiqueta="De apoyo"
            nota="Se canalizan, no se atienden aquí"
          />
        </div>
      </Seccion>
    </div>
  );
}
