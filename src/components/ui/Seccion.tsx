import type { ReactNode } from "react";

export function Seccion({
  titulo,
  descripcion,
  accion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{titulo}</h2>
          {descripcion ? (
            <p className="text-sm leading-relaxed text-tinta-suave">
              {descripcion}
            </p>
          ) : null}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}
