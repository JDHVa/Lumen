import type { Metadata, Viewport } from "next";
import { fuenteTexto, fuenteTitulos } from "./fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Red de apoyo estudiantil. Alumnos que ayudan a otros alumnos.",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fuenteTitulos.variable} ${fuenteTexto.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
