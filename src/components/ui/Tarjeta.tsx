import type { ComponentProps } from "react";

export function Tarjeta({
  className,
  elevada = false,
  ...resto
}: ComponentProps<"div"> & { elevada?: boolean }) {
  return (
    <div
      className={[
        "rounded-tarjeta border border-marino/10 bg-white p-5",
        elevada ? "shadow-elevada" : "shadow-tarjeta",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...resto}
    />
  );
}
