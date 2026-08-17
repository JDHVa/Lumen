import { BotonEnlace } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Etiqueta } from "@/components/ui/Etiqueta";

const pendientes: { titulo: string; fase: string }[] = [
  { titulo: "Apuntes", fase: "Fase 8" },
];

export default function PaginaAdmin() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <p className="leading-relaxed text-tinta-suave">
          Por ahora están listas las cuentas y el catálogo. Las demás pantallas
          llegan en las siguientes fases.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Usuarios</h2>
            <p className="text-sm text-tinta-suave">
              Da de alta zhenshis y admin.
            </p>
          </div>
          <BotonEnlace href="/admin/usuarios">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-sm text-tinta-suave">
              Los números: sesiones, horas y lo más pedido.
            </p>
          </div>
          <BotonEnlace href="/admin/dashboard">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Demanda</h2>
            <p className="text-sm text-tinta-suave">
              Lo que falta agendar, con los candidatos ya cruzados.
            </p>
          </div>
          <BotonEnlace href="/admin/demanda">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Sesiones</h2>
            <p className="text-sm text-tinta-suave">
              La agenda completa: publicar y cancelar.
            </p>
          </div>
          <BotonEnlace href="/admin/sesiones">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Solicitudes</h2>
            <p className="text-sm text-tinta-suave">
              Lo que está pidiendo la gente, y la limpieza.
            </p>
          </div>
          <BotonEnlace href="/admin/solicitudes">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Buzón</h2>
            <p className="text-sm text-tinta-suave">
              Sugerencias, agradecimientos y lo que hay que canalizar.
            </p>
          </div>
          <BotonEnlace href="/admin/buzon">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Catálogo</h2>
            <p className="text-sm text-tinta-suave">
              Carga las carreras y sus materias.
            </p>
          </div>
          <BotonEnlace href="/admin/catalogo">Abrir</BotonEnlace>
        </Tarjeta>

        <Tarjeta elevada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Zhenshis</h2>
            <p className="text-sm text-tinta-suave">
              Revisa perfiles, asigna materias y da de baja.
            </p>
          </div>
          <BotonEnlace href="/admin/zhensis">Abrir</BotonEnlace>
        </Tarjeta>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Lo que falta</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {pendientes.map((item) => (
            <li key={item.titulo}>
              <Tarjeta className="flex h-full items-center justify-between gap-3">
                <span className="text-sm font-medium text-marino">
                  {item.titulo}
                </span>
                <Etiqueta tono="apagado">{item.fase}</Etiqueta>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
