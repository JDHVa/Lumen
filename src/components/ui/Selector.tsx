import type { ComponentProps, ReactNode } from "react";

export function Selector({
  etiqueta,
  ayuda,
  className,
  children,
  ...resto
}: ComponentProps<"select"> & { etiqueta: string; ayuda?: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-marino">{etiqueta}</span>
      <select
        className={[
          "min-h-[48px] appearance-none rounded-suave border border-marino/20 bg-white px-4 py-3 text-base text-tinta transition-colors duration-150",
          "bg-[length:1.1rem] bg-[right_0.9rem_center] bg-no-repeat pr-11",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235a6c7d%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
          "hover:border-marino/35 focus:border-marino focus:outline-none focus:ring-2 focus:ring-marino/15",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...resto}
      >
        {children}
      </select>
      {ayuda ? (
        <span className="text-xs leading-relaxed text-tinta-suave">{ayuda}</span>
      ) : null}
    </label>
  );
}

export function AreaTexto({
  etiqueta,
  ayuda,
  className,
  ...resto
}: ComponentProps<"textarea"> & { etiqueta: string; ayuda?: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-marino">{etiqueta}</span>
      <textarea
        className={[
          "min-h-[9rem] rounded-suave border border-marino/20 bg-white px-4 py-3 text-base leading-relaxed text-tinta transition-colors duration-150",
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
