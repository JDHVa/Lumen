"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

type Tono = "neutral" | "peligro" | "afirmar";

const tonos: Record<Tono, string> = {
  neutral:
    "border-marino/25 bg-white text-marino hover:border-marino/50 hover:bg-marino-tenue active:bg-marino active:text-white active:border-marino",
  afirmar:
    "border-exito/30 bg-white text-exito hover:bg-exito-tenue active:bg-exito active:text-white active:border-exito",
  peligro:
    "border-alerta/30 bg-white text-alerta hover:bg-alerta-tenue active:bg-alerta active:text-white active:border-alerta",
};

const base =
  "inline-flex min-h-[40px] items-center justify-center rounded-suave border px-3.5 text-sm font-medium transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-55";

export function BotonAccion({
  tono = "neutral",
  className,
  children,
  ...resto
}: ComponentProps<"button"> & { tono?: Tono }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={[base, tonos[tono], className].filter(Boolean).join(" ")}
      disabled={pending || resto.disabled}
      {...resto}
    >
      {pending ? "Un momento…" : children}
    </button>
  );
}

export function BotonSimple({
  tono = "neutral",
  className,
  ...resto
}: ComponentProps<"button"> & { tono?: Tono }) {
  return (
    <button
      type="button"
      className={[base, tonos[tono], className].filter(Boolean).join(" ")}
      {...resto}
    />
  );
}
