import Link from "next/link";
import { CONTACTO, ligaWhatsapp } from "@/lib/contacto";

export function PiePublico() {
  return (
    <footer className="mt-16 border-t border-marino/10 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8 text-sm text-tinta-suave sm:flex-row sm:justify-between">
        <p className="max-w-sm leading-relaxed">
          Lumen es una red de apoyo académico entre pares. No es un servicio de
          atención psicológica.
        </p>

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-marino">¿Dudas del proyecto?</span>
          <a
            href={ligaWhatsapp()}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-marino"
          >
            WhatsApp {CONTACTO.telefonoLegible}
          </a>
          <a
            href={CONTACTO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-marino"
          >
            Instagram {CONTACTO.instagramLegible}
          </a>
          <Link
            href="/privacidad"
            className="underline underline-offset-4 hover:text-marino"
          >
            Aviso de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
