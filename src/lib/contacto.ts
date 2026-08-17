export const CONTACTO = {
  telefono: "8128926313",
  telefonoLegible: "81 2892 6313",
  paisLada: "52",
  instagram: "https://www.instagram.com/proyectolumenn/",
  instagramLegible: "@proyectolumenn",
};

export function ligaWhatsapp(mensaje?: string) {
  const base = `https://wa.me/${CONTACTO.paisLada}${CONTACTO.telefono}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
