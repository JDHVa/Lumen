"use client";

import { useActionState, useState } from "react";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { AreaTexto } from "@/components/ui/Selector";
import { Canalizacion } from "./Canalizacion";
import { enviarMensaje, type EstadoBuzon } from "./acciones";

const estadoInicial: EstadoBuzon = {};

type Categoria = "sugerencia" | "agradecimiento" | "apoyo";

const opciones: {
  valor: Categoria;
  titulo: string;
  texto: string;
}[] = [
  {
    valor: "sugerencia",
    titulo: "Una sugerencia",
    texto:
      "Algo que se podría hacer mejor, una materia que hace falta, una queja.",
  },
  {
    valor: "agradecimiento",
    titulo: "Un agradecimiento",
    texto:
      "Alguien te ayudó y quieres que se sepa. A los zhenshis les llega.",
  },
  {
    valor: "apoyo",
    titulo: "No estoy bien",
    texto:
      "Algo te está pasando y no es de la escuela. Aquí te decimos con quién sí.",
  },
];

export function FormularioBuzon() {
  const [estado, accion, enviando] = useActionState(
    enviarMensaje,
    estadoInicial,
  );
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [contenido, setContenido] = useState("");
  const [nombre, setNombre] = useState("");

  if (estado.enviado) {
    return (
      <Tarjeta elevada className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="font-titulos text-2xl font-bold text-marino">
          Ya lo recibimos
        </span>
        <p className="max-w-sm leading-relaxed text-tinta-suave">
          Gracias por escribir. Alguien del equipo lo va a leer.
        </p>
        {categoria === "apoyo" ? (
          <p className="max-w-sm leading-relaxed text-tinta">
            No esperes respuesta por aquí. Si lo tuyo es urgente, marca los
            números de arriba.
          </p>
        ) : null}
        <BotonEnlace href="/" variante="contorno">
          Volver al inicio
        </BotonEnlace>
      </Tarjeta>
    );
  }

  if (categoria === null) {
    return (
      <div className="flex flex-col gap-4">
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setCategoria(opcion.valor)}
            className={`flex flex-col gap-2 rounded-tarjeta border p-6 text-left shadow-tarjeta transition-colors ${
              opcion.valor === "apoyo"
                ? "border-dorado/50 bg-dorado-tenue hover:border-dorado"
                : "border-marino/15 bg-white hover:border-marino/45"
            }`}
          >
            <span className="font-titulos text-xl font-semibold text-marino">
              {opcion.titulo}
            </span>
            <span className="text-sm leading-relaxed text-tinta-suave">
              {opcion.texto}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-6">
      <input type="hidden" name="categoria" value={categoria} />

      <button
        type="button"
        onClick={() => setCategoria(null)}
        className="self-start text-sm text-marino underline underline-offset-4 hover:text-marino-claro"
      >
        ← Cambiar de tema
      </button>

      {categoria === "apoyo" ? <Canalizacion /> : null}

      <Tarjeta elevada className="flex flex-col gap-5 p-6">
        <AreaTexto
          etiqueta="Tu mensaje"
          name="contenido"
          required
          maxLength={2000}
          value={contenido}
          onChange={(evento) => setContenido(evento.target.value)}
          placeholder={
            categoria === "agradecimiento"
              ? "Quiero agradecerle a…"
              : categoria === "sugerencia"
                ? "Estaría bueno que…"
                : "Escribe lo que quieras contarnos."
          }
        />

        <Campo
          etiqueta="Tu nombre"
          name="nombre_opcional"
          maxLength={80}
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Opcional"
          ayuda="Puedes dejarlo en blanco, poner tu nombre o poner lo que quieras. No pedimos correo ni matrícula."
        />
      </Tarjeta>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <Boton type="submit" tamano="grande" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar"}
      </Boton>

      <p className="text-center text-sm leading-relaxed text-tinta-suave">
        Esto es un mensaje de una sola vía: no hay forma de contestarte, porque
        no guardamos ningún dato tuyo.
      </p>
    </form>
  );
}
