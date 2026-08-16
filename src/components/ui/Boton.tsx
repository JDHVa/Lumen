import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "principal" | "secundario" | "contorno" | "texto";
type Tamano = "normal" | "grande";

const base =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-suave px-5 text-base font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55";

const variantes: Record<Variante, string> = {
  principal:
    "bg-dorado text-marino-hondo shadow-tarjeta hover:bg-dorado-hondo active:bg-dorado-hondo",
  secundario: "bg-marino text-white hover:bg-marino-claro active:bg-marino-hondo",
  contorno:
    "border border-marino/25 bg-white text-marino hover:border-marino/50 hover:bg-marino-tenue",
  texto: "px-2 text-marino underline underline-offset-4 hover:text-marino-claro",
};

const tamanos: Record<Tamano, string> = {
  normal: "py-3",
  grande: "min-h-[52px] py-4 text-lg",
};

function clases(variante: Variante, tamano: Tamano, extra?: string) {
  return [base, variantes[variante], tamanos[tamano], extra]
    .filter(Boolean)
    .join(" ");
}

export function Boton({
  variante = "principal",
  tamano = "normal",
  className,
  ...resto
}: ComponentProps<"button"> & { variante?: Variante; tamano?: Tamano }) {
  return <button className={clases(variante, tamano, className)} {...resto} />;
}

export function BotonEnlace({
  variante = "principal",
  tamano = "normal",
  className,
  ...resto
}: ComponentProps<typeof Link> & { variante?: Variante; tamano?: Tamano }) {
  return <Link className={clases(variante, tamano, className)} {...resto} />;
}
