export function textoSesionesDeseadas(cuantas: number | null) {
  if (cuantas === null) return "No dijeron cuántas sesiones necesitan";
  if (cuantas === 1) return "Pidieron una sola sesión";
  if (cuantas >= 4) return "Pidieron cuatro sesiones o más";
  return `Pidieron como ${cuantas === 2 ? "dos" : "tres"} sesiones`;
}

export function etiquetaSesionesDeseadas(cuantas: number | null) {
  if (cuantas === null) return "sin decir cuántas";
  if (cuantas === 1) return "1 sesión";
  if (cuantas >= 4) return "4 o más sesiones";
  return `${cuantas} sesiones`;
}
