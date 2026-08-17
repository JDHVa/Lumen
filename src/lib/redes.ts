export type ClaveRed =
  | "instagram"
  | "whatsapp"
  | "facebook"
  | "linkedin"
  | "github"
  | "tiktok";

export type Red = {
  clave: ClaveRed;
  nombre: string;
  ejemplo: string;
  ayuda: string;
};

export const REDES: Red[] = [
  {
    clave: "instagram",
    nombre: "Instagram",
    ejemplo: "@tuusuario",
    ayuda: "Tu usuario o la liga completa.",
  },
  {
    clave: "whatsapp",
    nombre: "WhatsApp",
    ejemplo: "8112345678",
    ayuda: "Solo el número, a 10 dígitos. Piénsalo bien: queda público.",
  },
  {
    clave: "facebook",
    nombre: "Facebook",
    ejemplo: "tu.perfil",
    ayuda: "Tu usuario o la liga completa.",
  },
  {
    clave: "linkedin",
    nombre: "LinkedIn",
    ejemplo: "tu-nombre",
    ayuda: "Tu usuario o la liga completa.",
  },
  {
    clave: "github",
    nombre: "GitHub",
    ejemplo: "tuusuario",
    ayuda: "Tu usuario o la liga completa.",
  },
  {
    clave: "tiktok",
    nombre: "TikTok",
    ejemplo: "@tuusuario",
    ayuda: "Tu usuario o la liga completa.",
  },
];

const BASES: Record<ClaveRed, string> = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  linkedin: "https://linkedin.com/in/",
  github: "https://github.com/",
  tiktok: "https://tiktok.com/@",
  whatsapp: "https://wa.me/",
};

const DOMINIOS: Record<ClaveRed, string[]> = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com", "m.facebook.com"],
  linkedin: ["linkedin.com"],
  github: ["github.com"],
  tiktok: ["tiktok.com"],
  whatsapp: ["wa.me", "api.whatsapp.com", "whatsapp.com"],
};

export type Normalizado =
  | { ok: true; valor: string | null }
  | { ok: false; error: string };

export function normalizarRed(clave: ClaveRed, crudo: string): Normalizado {
  const texto = crudo.trim();
  if (!texto) return { ok: true, valor: null };

  if (clave === "whatsapp") {
    const digitos = texto.replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 13) {
      return {
        ok: false,
        error: "El WhatsApp debe ser un número de 10 dígitos.",
      };
    }
    const conLada = digitos.length === 10 ? `52${digitos}` : digitos;
    return { ok: true, valor: `${BASES.whatsapp}${conLada}` };
  }

  if (/^https?:\/\//i.test(texto)) {
    let liga: URL;
    try {
      liga = new URL(texto);
    } catch {
      return { ok: false, error: "Esa liga no se entiende." };
    }

    const anfitrion = liga.hostname.replace(/^www\./, "").toLowerCase();
    if (!DOMINIOS[clave].includes(anfitrion)) {
      return {
        ok: false,
        error: `Esa liga no es de ${clave}. Revisa que la hayas pegado en el lugar correcto.`,
      };
    }

    return { ok: true, valor: `https://${anfitrion}${liga.pathname}` };
  }

  const usuario = texto.replace(/^@/, "");
  if (!/^[A-Za-z0-9._-]{2,40}$/.test(usuario)) {
    return {
      ok: false,
      error:
        "El usuario solo puede llevar letras, números, punto, guion o guion bajo.",
    };
  }

  return { ok: true, valor: `${BASES[clave]}${usuario}` };
}

export function comoSeLee(clave: ClaveRed, direccion: string) {
  if (clave === "whatsapp") {
    const digitos = direccion.replace(/\D/g, "");
    const diez = digitos.slice(-10);
    return `${diez.slice(0, 2)} ${diez.slice(2, 6)} ${diez.slice(6)}`;
  }

  try {
    const liga = new URL(direccion);
    const cola = liga.pathname.replace(/^\/(in\/)?/, "").replace(/\/$/, "");
    return cola ? `@${cola.replace(/^@/, "")}` : direccion;
  } catch {
    return direccion;
  }
}
