const TONOS = [
  "bg-marino text-white",
  "bg-marino-claro text-white",
  "bg-dorado text-marino-hondo",
  "bg-marino-hondo text-white",
  "bg-dorado-hondo text-marino-hondo",
];

function iniciales(nombre: string) {
  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter((parte) => parte.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(parte));

  const primera = partes[0]?.[0] ?? nombre[0] ?? "?";
  const segunda = partes[1]?.[0] ?? "";

  return (primera + segunda).toUpperCase();
}

function tonoDe(nombre: string) {
  let suma = 0;
  for (const letra of nombre) suma += letra.charCodeAt(0);
  return TONOS[suma % TONOS.length];
}

export function Iniciales({
  nombre,
  grande = false,
}: {
  nombre: string;
  grande?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-titulos font-bold ${
        grande ? "size-16 text-2xl" : "size-12 text-lg"
      } ${tonoDe(nombre)}`}
    >
      {iniciales(nombre)}
    </span>
  );
}
