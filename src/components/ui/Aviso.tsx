import type { ReactNode } from "react";

type Tono = "error" | "exito" | "neutral";

const tonos: Record<Tono, string> = {
  error: "border-alerta/25 bg-alerta-tenue text-alerta",
  exito: "border-exito/25 bg-exito-tenue text-exito",
  neutral: "border-marino/15 bg-marino-tenue text-marino",
};

export function Aviso({
  tono = "neutral",
  children,
}: {
  tono?: Tono;
  children: ReactNode;
}) {
  return (
    <p
      role={tono === "error" ? "alert" : "status"}
      className={`rounded-suave border px-4 py-3 text-sm leading-relaxed ${tonos[tono]}`}
    >
      {children}
    </p>
  );
}
