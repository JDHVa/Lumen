export const CONTACTO = {
  telefono: "8128926313",
  telefonoLegible: "81 2892 6313",
  paisLada: "52",
  instagram: "https://www.instagram.com/proyectolumenn/",
  instagramLegible: "@proyectolumenn",
};

export const ORIENTACION = {
  psicologa: {
    etiqueta: "Psicóloga de la prepa",
    legible: "81 3115 6931",
    marcar: "+528131156931",
  },
  escuela: {
    etiqueta: "Recepción de la prepa",
    legible: "81 8354 5407",
    marcar: "+528183545407",
  },
  direccion:
    "Av. Churubusco 935, Venustiano Carranza, 67130 Monterrey, N.L.",
};

export function ligaWhatsapp(mensaje?: string) {
  const base = `https://wa.me/${CONTACTO.paisLada}${CONTACTO.telefono}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
