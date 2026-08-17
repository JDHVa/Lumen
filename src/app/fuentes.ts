import { Fraunces, Inter } from "next/font/google";

export const fuenteTitulos = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--fuente-titulos",
});

export const fuenteTexto = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--fuente-texto",
});
