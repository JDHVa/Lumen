import { Tarjeta } from "@/components/ui/Tarjeta";
import { ORIENTACION } from "@/lib/contacto";

export function Canalizacion() {
  return (
    <Tarjeta elevada className="flex flex-col gap-4 border-dorado/40 bg-dorado-tenue p-6">
      <h2 className="font-titulos text-xl font-semibold text-marino">
        Antes de que escribas, léelo
      </h2>

      <p className="leading-relaxed text-tinta">
        Lumen es una red de apoyo entre compañeros para materias.{" "}
        <strong>No somos psicólogos y no atendemos crisis.</strong> Si lo que
        traes es de cómo te sientes, hay gente en tu escuela preparada para
        eso, y es a ellos a quienes hay que buscar.
      </p>

      <div className="flex flex-col gap-3">
        <a
          href={`tel:${ORIENTACION.psicologa.marcar}`}
          className="flex min-h-[56px] flex-col justify-center rounded-suave bg-white px-4 py-3 transition-colors hover:bg-arena"
        >
          <span className="text-sm text-tinta-suave">
            {ORIENTACION.psicologa.etiqueta}
          </span>
          <span className="font-titulos text-xl font-semibold text-marino">
            {ORIENTACION.psicologa.legible}
          </span>
        </a>

        <a
          href={`tel:${ORIENTACION.escuela.marcar}`}
          className="flex min-h-[56px] flex-col justify-center rounded-suave bg-white px-4 py-3 transition-colors hover:bg-arena"
        >
          <span className="text-sm text-tinta-suave">
            {ORIENTACION.escuela.etiqueta}
          </span>
          <span className="font-titulos text-xl font-semibold text-marino">
            {ORIENTACION.escuela.legible}
          </span>
        </a>
      </div>

      <p className="text-sm leading-relaxed text-tinta-suave">
        También puedes ir en persona: {ORIENTACION.direccion}
      </p>

      <p className="text-sm leading-relaxed text-tinta">
        Si de todos modos quieres dejarnos el mensaje, escríbelo abajo. Lo va a
        leer alguien del equipo y lo va a pasar con orientación. No es rápido y
        no vas a recibir respuesta por aquí, por eso los teléfonos van primero.
      </p>
    </Tarjeta>
  );
}
