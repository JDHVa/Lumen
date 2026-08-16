# Reglas de trabajo — Lumen

Antes de escribir cualquier código, lee `docs/ESPECIFICACION.md`. Es la fuente
de verdad del producto. Este archivo solo contiene reglas de cómo trabajar.

## Terminología obligatoria

Se usa tal cual en interfaz, código, nombres de tablas y variables:
**schüler**, **zhensi**, **admin**, **solicitud**, **sesión**, **apunte**.
No los traduzcas al inglés ni uses sinónimos como "estudiante", "mentor",
"tutoría", "petición" o "clase".

Toda la interfaz, incluidos mensajes de error y textos vacíos, va en español.

## Cómo avanzamos

1. **Una fase por sesión de trabajo.** Las fases están en la sección 12 de la
   especificación. No empieces la siguiente sin autorización explícita.
2. **Rama por fase**, con el nombre `fase-N-descripcion`.
3. **Antes de tocar código, escribe el plan** de la fase y espera aprobación.
   Incluye qué archivos vas a crear o modificar y qué decisiones estás tomando.
4. **Al terminar, entrega dos cosas**: una explicación del cambio en lenguaje
   normal, sin jerga, y una lista numerada de pasos para probarlo a mano en el
   navegador.
5. Commits pequeños y con mensaje descriptivo en español.

## Reglas duras

- **No instales dependencias nuevas sin preguntar.** Explica qué problema
  resuelve y qué alternativa hay sin ella.
- **No construyas nada de la sección 10 "Fuera de alcance"**, aunque parezca
  una mejora obvia o un complemento natural de lo que estás haciendo.
- **No agregues cuentas, registro ni inscripción para el schüler.** Es el
  principio central del producto.
- **Las horas del zhensi siempre se calculan**, nunca se guardan como campo
  editable.
- Si la especificación es ambigua o contradictoria en algún punto, **pregunta
  antes de decidir por tu cuenta.** No inventes reglas de negocio.
- No borres ni reescribas archivos que no pertenecen a la fase actual.
- No hagas refactors grandes sin avisar. Prefiero un diff que pueda leer
  completo.
- No uses comentarios en el sistema