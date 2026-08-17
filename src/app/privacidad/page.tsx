import { EncabezadoPublico } from "@/components/EncabezadoPublico";
import { PiePublico } from "@/components/PiePublico";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { CONTACTO, ORIENTACION, ligaWhatsapp } from "@/lib/contacto";

export const metadata = {
  title: "Aviso de privacidad · Lumen",
};

function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">{titulo}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-tinta-suave">
        {children}
      </div>
    </section>
  );
}

export default function PaginaPrivacidad() {
  return (
    <div className="flex min-h-screen flex-col">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <div className="flex flex-col gap-3 pb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Qué guardamos y qué no
          </h1>
          <p className="leading-relaxed text-tinta-suave">
            Este es el aviso de privacidad de Lumen, escrito para que se
            entienda. Si algo no queda claro, escríbenos.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <Tarjeta elevada className="flex flex-col gap-3 p-6">
            <h2 className="font-titulos text-xl font-semibold text-marino">
              Lo más corto posible
            </h2>
            <p className="leading-relaxed text-tinta">
              Si vienes a pedir ayuda, <strong>no guardamos nada tuyo</strong>:
              ni nombre, ni correo, ni matrícula, ni tu grupo. No hay cuentas
              para alumnos y nunca las va a haber.
            </p>
          </Tarjeta>

          <Bloque titulo="Si pides ayuda o usas el buzón">
            <p>
              Guardamos únicamente lo que escribes: la materia o el tema, tu
              descripción y los horarios que marcaste. Nada de eso te identifica
              a menos que tú escribas tu nombre dentro del mensaje.
            </p>
            <p>
              Tu solicitud se publica en la lista de solicitudes con un código
              tipo <strong>LUM-A3K9</strong>. Ese código es lo único que te
              conecta con lo que pediste, y solo tú lo tienes.
            </p>
            <p>
              En el buzón, el nombre es opcional y libre: puedes dejarlo vacío o
              poner lo que quieras. No pedimos correo, así que{" "}
              <strong>no hay forma de contestarte</strong>.
            </p>
          </Bloque>

          <Bloque titulo="La marca de tu navegador">
            <p>
              Cuando pides ayuda o apoyas una solicitud, guardamos en tu
              navegador un número al azar. No dice quién eres, ni de dónde te
              conectas, ni qué más visitas. Sirve para dos cosas: que no puedas
              apoyar dos veces la misma solicitud, y que nadie llene el sitio de
              solicitudes falsas.
            </p>
            <p>
              Si borras los datos del navegador, ese número desaparece y
              empiezas de cero. No usamos ninguna herramienta de rastreo ni de
              publicidad.
            </p>
          </Bloque>

          <Bloque titulo="Si eres zhenshi o admin">
            <p>
              De ti sí guardamos: tu nombre, tu nombre de usuario, tu contraseña
              cifrada, y lo que llenes en tu perfil — carrera, semestre, tu
              línea de presentación, las materias que puedes dar y tus horarios
              disponibles.
            </p>
            <p>
              <strong>No guardamos tu correo electrónico.</strong> Lumen no
              manda correos, así que el dato no hace falta, y no tenerlo es la
              forma más segura de que no se pueda filtrar.
            </p>
            <p>
              Las contraseñas se guardan cifradas: ni nosotros podemos leerlas.
              Si se te olvida una, se cambia, no se recupera.
            </p>
          </Bloque>

          <Bloque titulo="Tu foto">
            <p>
              Subirla es opcional y <strong>solo se publica si tú prendes el
              interruptor</strong> de aparecer en la galería. Puedes apagarlo o
              borrar la foto cuando quieras, desde tu propio perfil.
            </p>
            <p>
              Al quitarla desaparece del sitio de inmediato, aunque el archivo
              puede seguir accesible unas horas para quien tuviera la dirección
              exacta, por cómo funciona el servicio donde se guarda.
            </p>
          </Bloque>

          <Bloque titulo="Los apuntes">
            <p>
              Todo lo que se sube lo revisa una persona del equipo antes de
              publicarse. Se muestra el nombre de quien lo compartió.
            </p>
            <p>
              No subas material con datos de otras personas, ni cosas que no
              sean tuyas para compartir. Si ves algo que no debería estar,
              avísanos y lo quitamos.
            </p>
          </Bloque>

          <Bloque titulo="Lo que Lumen no es">
            <p>
              Lumen es una red de apoyo académico entre compañeros.{" "}
              <strong>No es un servicio de atención psicológica.</strong>
            </p>
            <p>
              Si escribes al buzón por algo que no es de la escuela, te vamos a
              mostrar de inmediato con quién sí acudir, y ese mensaje lo lee
              alguien del equipo para pasarlo con orientación. Nadie de Lumen va
              a intentar atenderte, porque no estamos preparados para eso.
            </p>
            <p className="text-tinta">
              Orientación de la prepa: {ORIENTACION.psicologa.legible} ·{" "}
              {ORIENTACION.escuela.legible}
            </p>
          </Bloque>

          <Bloque titulo="Quién puede ver qué">
            <p>
              Los admin ven todo lo que se manda por el sitio, porque les toca
              agendar y moderar. Un zhenshi solo ve lo suyo: su perfil, sus
              horarios, sus sesiones y sus apuntes.
            </p>
            <p>
              No compartimos nada con nadie fuera del proyecto, ni vendemos
              información, ni la usamos para otra cosa que no sea hacer que las
              sesiones ocurran.
            </p>
          </Bloque>

          <Bloque titulo="Si quieres que borremos algo">
            <p>
              Escríbenos y lo hacemos. Si eres zhenshi puedes borrar tus apuntes
              y tu foto tú mismo desde tu cuenta. Si mandaste una solicitud o un
              mensaje al buzón y quieres que lo quitemos, dinos el código o
              cuéntanos cuál era.
            </p>
            <div className="flex flex-col gap-1 pt-1">
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
            </div>
          </Bloque>
        </div>
      </main>

      <PiePublico />
    </div>
  );
}
