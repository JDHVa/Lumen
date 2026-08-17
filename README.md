# Lumen

Una red de apoyo académico entre alumnos de preparatoria. Quien necesita ayuda
con una materia la pide sin crear cuenta; quien ya pasó por esa materia la
explica. En medio, alguien del equipo agenda la sesión.

Este repositorio es público para que cualquier escuela pueda copiarlo y montar
el suyo.

## La idea

Casi toda la ayuda entre compañeros se organiza hoy por WhatsApp: alguien
pregunta en un grupo, otro contesta, y todo se pierde. Lumen convierte eso en
algo que se puede ver, medir y sostener, sin volverlo burocrático.

El principio que ordena todo lo demás:

> **El alumno que necesita ayuda nunca tiene cuenta.**

Nada de registro, correo, matrícula ni contraseña para pedir ayuda. Pedir ayuda
cuando no le entiendes a algo ya cuesta suficiente; poner un formulario de
registro enfrente hace que la mitad no lo haga. Solo tienen cuenta quienes dan
las sesiones y quienes las coordinan.

## Cómo funciona

1. Un alumno entra sin cuenta y pide ayuda: elige una materia o escribe un tema
   libre, y marca en qué horarios puede. Recibe un código tipo `LUM-A3K9`.
2. Si alguien más necesita lo mismo, no crea otra solicitud: presiona **yo
   también lo necesito** y sube el contador. Ese contador es la única señal de
   cuánta gente va a llegar.
3. Un coordinador abre el panel y ve las solicitudes ordenadas por apoyos. Al
   abrir una, el sistema le muestra **solo a quienes pueden dar esa materia y
   además coinciden en horario** con lo que se pidió.
4. Elige persona, salón y hora, y publica. La sesión aparece en el inicio.
5. Después de la sesión se captura cuánta gente llegó. Las horas de cada
   mentor se calculan solas a partir de eso.

## Las tres palabras del proyecto

Se usan tal cual en la interfaz, en el código y en la base de datos:

| Palabra | Qué es |
|---|---|
| **schüler** | Cualquier alumno que busca ayuda. Nunca tiene cuenta. |
| **zhenshi** | Alumno que da las sesiones. Tiene cuenta. |
| **admin** | Coordina el proyecto. Tiene cuenta. Todos los admin son también zhenshi. |

Vienen del nombre del equipo que arrancó Lumen. Si copias el proyecto puedes
cambiarlas, pero cámbialas en todos lados: son parte de cómo la gente habla del
proyecto, no solo etiquetas de la pantalla.

## Qué incluye

**Para cualquiera, sin cuenta**

- Inicio con las próximas sesiones agrupadas por día
- Pedir ayuda, por materia o por tema libre
- Lista de solicitudes con filtro por carrera y buscador por código
- Galería de zhenshis, con perfil individual
- Repositorio de apuntes
- Buzón, con ruta de canalización para lo que no es académico
- Aviso de privacidad

**Para el zhenshi**

- Perfil: carrera, semestre, foto, materias que puede dar y redes
- Disponibilidad semanal en una cuadrícula
- Sus sesiones asignadas y sus horas acumuladas
- Subir apuntes

**Para el admin**

- Demanda, con el cruce automático de candidatos
- Sesiones: agendar, publicar, cancelar y capturar asistencia
- Solicitudes: ocultar, cerrar, reabrir
- Buzón, con lo prioritario hasta arriba
- Apuntes: aprobar o rechazar
- Catálogo de carreras y materias
- Usuarios: alta y cambio de contraseñas
- Dashboard con exportación a CSV

## Con qué está hecho

Next.js con App Router, TypeScript, Tailwind, Prisma y Postgres en Supabase.
Auth.js para las sesiones. Las contraseñas se cifran con bcrypt. Los archivos
viven en Supabase Storage, sin librería extra: se le habla por HTTP.

Todo el sitio funciona con lo gratuito de Supabase y Vercel.

## Cómo levantarlo

Necesitas Node 22 o más nuevo y una cuenta de Supabase.

```
git clone https://github.com/JDHVa/Lumen.git
cd Lumen
npm install
cp .env.example .env
```

Abre el `.env` y llena los valores: ahí está explicado de dónde sale cada uno.
Después:

```
npx prisma migrate deploy
npm run db:seed
npm run dev
```

El `db:seed` crea la primera cuenta de admin con el usuario y la contraseña que
pusiste en el `.env`. Entra a `http://localhost:3000/iniciarsesion`, y lo
primero que conviene hacer es cambiar esa contraseña desde el panel.

Para que funcionen los apuntes y las fotos, crea en Supabase un bucket llamado
`lumen` marcado como público.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en tu computadora |
| `npm run build` | Compila para producción |
| `npm run db:migrar` | Crea y aplica una migración |
| `npm run db:seed` | Crea la primera cuenta de admin |
| `npm run respaldo` | Baja toda la base a un archivo |

## Publicar y mantener

Los pasos para subirlo a Vercel, cómo configurar los respaldos automáticos y
qué hacer cuando algo se rompe están en **[docs/OPERACION.md](docs/OPERACION.md)**.

Los respaldos traen mensajes del buzón, teléfonos y horarios de menores de
edad. Nunca los subas a un lugar público, aunque vayan cifrados. La guía
explica cómo automatizarlos sin exponerlos.

## Cómo se decidió cada cosa

**[ESPECIFICACION.md](ESPECIFICACION.md)** es la fuente de verdad del producto:
qué se construye, qué no, y por qué. Si vas a modificar Lumen, léelo antes que
el código. Incluye una sección de lo que queda deliberadamente fuera, que
suele ser más útil que la lista de lo que sí hace.

## Lo que falta

- No hay recuperación de contraseña por cuenta propia: un admin la cambia y la
  entrega en persona.
- Cambiar una contraseña no cierra las sesiones ya abiertas.
- El contador de apoyos se puede inflar borrando las cookies del navegador.
- Falta la cabecera que bloquea scripts ajenos (CSP).

## Licencia

Todavía no tiene. Sin una licencia, legalmente nadie puede reutilizar el
código, aunque esté a la vista. Si quieres que otras escuelas lo copien, hace
falta agregar una.
