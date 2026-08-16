import type { ReactNode } from "react";

type Tono = "marino" | "dorado" | "apagado" | "alerta";

const tonos: Record<Tono, string> = {
  marino: "bg-marino-tenue text-marino",
  dorado: "bg-dorado-tenue text-dorado-hondo",
  apagado: "bg-arena-honda text-tinta-suave",
  alerta: "bg-alerta-tenue text-alerta",
};

export function Etiqueta({
  tono = "marino",
  children,
}: {
  tono?: Tono;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${tonos[tono]}`}
    >
      {children}
    </span>
  );
}
