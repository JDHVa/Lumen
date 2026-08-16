"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";

function IconoOjo({ abierto }: { abierto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
      {abierto ? <path d="m4 20 16-16" /> : null}
    </svg>
  );
}

export function CampoContrasena({
  etiqueta,
  ayuda,
  visibleInicial = false,
  className,
  ...resto
}: Omit<ComponentProps<"input">, "type"> & {
  etiqueta: string;
  ayuda?: ReactNode;
  visibleInicial?: boolean;
}) {
  const [visible, setVisible] = useState(visibleInicial);
  const idCampo = useId();
  const idAyuda = `${idCampo}-ayuda`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idCampo} className="text-sm font-semibold text-marino">
        {etiqueta}
      </label>

      <div className="relative">
        <input
          id={idCampo}
          type={visible ? "text" : "password"}
          aria-describedby={ayuda ? idAyuda : undefined}
          className={[
            "w-full min-h-[48px] rounded-suave border border-marino/20 bg-white py-3 pl-4 pr-14 text-base text-tinta transition-colors duration-150",
            "placeholder:text-tinta-suave/70 hover:border-marino/35 focus:border-marino focus:outline-none focus:ring-2 focus:ring-marino/15",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...resto}
        />

        <button
          type="button"
          onClick={() => setVisible((anterior) => !anterior)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-suave text-tinta-suave transition-colors duration-150 hover:text-marino"
        >
          <IconoOjo abierto={visible} />
        </button>
      </div>

      {ayuda ? (
        <span id={idAyuda} className="text-xs leading-relaxed text-tinta-suave">
          {ayuda}
        </span>
      ) : null}
    </div>
  );
}
