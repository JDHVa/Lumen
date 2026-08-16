import type { ComponentProps, ReactNode } from "react";

export function Campo({
  etiqueta,
  ayuda,
  className,
  children,
  ...resto
}: ComponentProps<"input"> & { etiqueta: string; ayuda?: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-marino">{etiqueta}</span>
      <input
        className={[
          "min-h-[48px] rounded-suave border border-marino/20 bg-white px-4 py-3 text-base text-tinta transition-colors duration-150",
          "placeholder:text-tinta-suave/70 hover:border-marino/35 focus:border-marino focus:outline-none focus:ring-2 focus:ring-marino/15",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...resto}
      />
      {ayuda ? (
        <span className="text-xs leading-relaxed text-tinta-suave">{ayuda}</span>
      ) : null}
    </label>
  );
}

export function Casilla({
  etiqueta,
  ayuda,
  ...resto
}: ComponentProps<"input"> & { etiqueta: string; ayuda?: string }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-suave border border-marino/15 bg-white px-4 py-3 transition-colors duration-150 hover:border-marino/35">
      <input
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 accent-marino"
        {...resto}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-marino">{etiqueta}</span>
        {ayuda ? (
          <span className="text-xs text-tinta-suave">{ayuda}</span>
        ) : null}
      </span>
    </label>
  );
}
