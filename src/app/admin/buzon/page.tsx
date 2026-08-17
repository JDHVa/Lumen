import { db } from "@/lib/db";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { Aviso } from "@/components/ui/Aviso";
import { BotonAccion } from "@/components/ui/BotonAccion";
import { ORIENTACION } from "@/lib/contacto";
import { cambiarEstadoMensaje } from "./acciones";

export const dynamic = "force-dynamic";

const tonosCategoria = {
  sugerencia: "marino",
  agradecimiento: "dorado",
  apoyo: "alerta",
} as const;

const tonosEstado = {
  nuevo: "marino",
  en_revision: "dorado",
  atendido: "apagado",
} as const;

const nombresEstado = {
  nuevo: "nuevo",
  en_revision: "en revisión",
  atendido: "atendido",
} as const;

function Accion({
  id,
  destino,
  texto,
  tono,
}: {
  id: string;
  destino: string;
  texto: string;
  tono?: "neutral" | "afirmar" | "peligro";
}) {
  return (
    <form action={cambiarEstadoMensaje}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={destino} />
      <BotonAccion type="submit" tono={tono}>
        {texto}
      </BotonAccion>
    </form>
  );
}

function cuandoFue(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const hora = String(fecha.getHours()).padStart(2, "0");
  const minuto = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} a las ${hora}:${minuto}`;
}

export default async function PaginaBuzonAdmin() {
  const mensajes = await db.mensaje_buzon.findMany({
    orderBy: [{ prioritario: "desc" }, { creado_en: "desc" }],
    take: 200,
    select: {
      id: true,
      categoria: true,
      contenido: true,
      nombre_opcional: true,
      prioritario: true,
      estado: true,
      creado_en: true,
      atendedor: { select: { nombre: true } },
    },
  });

  const apoyoPendiente = mensajes.filter(
    (uno) => uno.categoria === "apoyo" && uno.estado !== "atendido",
  ).length;

  const nuevos = mensajes.filter((uno) => uno.estado === "nuevo").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Buzón</h1>
        <p className="leading-relaxed text-tinta-suave">
          Lo que manda la gente. Los mensajes de apoyo salen hasta arriba. No se
          pueden borrar: se marcan como atendidos.
        </p>
      </div>

      {apoyoPendiente > 0 ? (
        <Aviso tono="error">
          Hay {apoyoPendiente}{" "}
          {apoyoPendiente === 1
            ? "mensaje de apoyo sin atender"
            : "mensajes de apoyo sin atender"}
          . Lumen no atiende esto: hay que pasarlo con orientación. Psicóloga{" "}
          {ORIENTACION.psicologa.legible} · Prepa {ORIENTACION.escuela.legible}.
        </Aviso>
      ) : null}

      <Seccion
        titulo="Mensajes"
        descripcion={`${mensajes.length} en total, ${nuevos} sin abrir.`}
      >
        {mensajes.length === 0 ? (
          <Tarjeta className="py-10 text-center text-sm text-tinta-suave">
            Todavía no hay mensajes.
          </Tarjeta>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {mensajes.map((mensaje) => (
              <li key={mensaje.id}>
                <Tarjeta
                  className={`flex flex-col gap-3 py-4 ${
                    mensaje.prioritario && mensaje.estado !== "atendido"
                      ? "border-alerta/40 bg-alerta-tenue"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Etiqueta tono={tonosCategoria[mensaje.categoria]}>
                      {mensaje.categoria}
                    </Etiqueta>
                    <Etiqueta tono={tonosEstado[mensaje.estado]}>
                      {nombresEstado[mensaje.estado]}
                    </Etiqueta>
                    <span className="ml-auto text-sm text-tinta-suave">
                      {cuandoFue(mensaje.creado_en)}
                    </span>
                  </div>

                  <p className="leading-relaxed break-words whitespace-pre-line text-tinta">
                    {mensaje.contenido}
                  </p>

                  <span className="text-sm text-tinta-suave">
                    {mensaje.nombre_opcional
                      ? `Lo firma: ${mensaje.nombre_opcional}`
                      : "Sin firmar"}
                    {mensaje.atendedor
                      ? ` · Lo tomó ${mensaje.atendedor.nombre}`
                      : ""}
                  </span>

                  <div className="flex flex-wrap items-center gap-4">
                    {mensaje.estado !== "en_revision" ? (
                      <Accion
                        id={mensaje.id}
                        destino="en_revision"
                        texto="Lo estoy viendo"
                      />
                    ) : null}
                    {mensaje.estado !== "atendido" ? (
                      <Accion
                        id={mensaje.id}
                        destino="atendido"
                        texto="Marcar como atendido"
                        tono="afirmar"
                      />
                    ) : (
                      <Accion
                        id={mensaje.id}
                        destino="nuevo"
                        texto="Regresar a nuevo"
                      />
                    )}
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
