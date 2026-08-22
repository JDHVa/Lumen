# Lumen — Especificación funcional

Documento maestro del proyecto. Toda decisión de producto vive aquí.
Si algo no está en este documento, no se construye sin preguntar primero.

---

## 1. Qué es Lumen

Lumen es una red de apoyo estudiantil. Alumnos destacados dan sesiones de
apoyo académico gratuitas a compañeros que lo necesitan. Esta plataforma
sustituye la gestión que hoy se hace por WhatsApp.

El sistema resuelve tres cosas:

1. Que un alumno pueda pedir ayuda de un tema sin tener que conocer a nadie.
2. Que el liderazgo pueda asignar rápido al mentor correcto según demanda y
   disponibilidad.
3. Que quede registro medible de todo lo que Lumen hace.

## 2. Glosario

Estos términos se usan tal cual en la interfaz, en el código y en la base de
datos. No se traducen ni se sustituyen por sinónimos.

- **Schüler**: cualquier alumno que busca ayuda. Nunca tiene cuenta.
- **Zhenshi**: alumno destacado que da las sesiones. Tiene cuenta.
- **Admin**: coordina el proyecto. Tiene cuenta. Todos los admin son también
  zhensi.
- **Solicitud**: petición pública de ayuda sobre una materia o un tema
  especial.
- **Sesión**: encuentro presencial ya agendado, con zhensi, salón y hora.
- **Apunte**: material de estudio subido por un zhensi.

## 3. Principios de diseño (no negociables)

1. **El schüler nunca crea una cuenta.** Ni para ver, ni para pedir, ni para
   asistir. Ningún dato obligatorio que lo identifique.
2. **El schüler no se inscribe a las sesiones.** Ve el tablero y va si quiere.
   No hay cupo, ni lista, ni confirmación, ni código de asistencia.
3. **Lo simple es para ellos, lo complejo es para el admin.** Cualquier acción
   pública debe lograrse en tres toques o menos.
4. **Primero móvil.** El sitio público se diseña para celular y luego se adapta
   a escritorio.
5. **Todo en español.** Interfaz, mensajes de error, correos.
6. **Nada automático que sustituya el criterio del admin.** El sistema filtra y
   sugiere; la asignación siempre la hace una persona.

## 4. Roles y accesos

| | Zona pública | Zona zhensi | Panel admin |
|---|---|---|---|
| Schüler (sin cuenta) | Sí | No | No |
| Zhensi | Sí | Sí | No |
| Admin | Sí | Sí | Sí |

Un usuario tiene dos marcas independientes: `es_zhensi` y `es_admin`. Los
cinco admin tienen ambas activas y pueden alternar entre "Mi vista de zhensi" y
"Panel de administración" con un botón, sin cerrar sesión.

Los cinco admin tienen permisos idénticos. No hay superadministrador.

## 5. Modelo de datos

### usuario
`id`, `nombre`, `usuario`, `contrasena_hash`, `es_zhensi` (bool),
`es_admin` (bool), `activo` (bool), `creado_en`

`usuario` es un nombre de acceso corto que asigna el admin al crear la cuenta.
**No se guarda ningún correo electrónico de zhensis ni de admin.** El sistema
no envía correos, así que el dato no hace falta, y no guardarlo es la forma más
segura de que no se pueda filtrar.

### perfil_zhensi
`usuario_id`, `foto_url`, `carrera_id`, `semestre`, `descripcion_corta`
(máx. 200 caracteres, responde a "así explico yo"), `visible_publico` (bool)

### zhensi_materia
`usuario_id`, `materia_id` — relación muchos a muchos. Define qué puede dar
cada zhensi.

### carrera
`id`, `nombre`, `clave`

Son 7 carreras técnicas.

### materia
`id`, `nombre`, `carrera_id` (nulo = materia de tronco común), `semestre`
(opcional), `activa` (bool)

Volumen esperado: unas 5 materias de tronco común y unas 20 por cada una de
las 7 carreras, es decir alrededor de 145 registros. **Nunca se muestran en un
menú desplegable plano.** El schüler elige primero su carrera y solo ve sus
materias más las de tronco común. El admin usa buscador con autocompletado.

### disponibilidad
`id`, `usuario_id`, `dia_semana` (1–7), `hora_inicio`, `hora_fin`

Es recurrente semanal. El zhensi la captura una vez y aplica todas las semanas
hasta que la cambie.

### solicitud
`id`, `codigo_publico`, `tipo` (`materia` | `tema_especial`), `materia_id`
(nulo si es tema especial), `titulo_tema` (requerido si es tema especial),
`descripcion`, `carrera_id` (contexto, opcional), `franjas_preferidas`,
`apoyos` (contador), `estado` (`abierta` | `agendada` | `cerrada` | `oculta`),
`sesiones_deseadas` (opcional), `creada_en`

`sesiones_deseadas` es el cálculo del propio schüler de con cuántas sesiones
cree que le alcanza, de 1 a 4 o más. Puede dejarlo en blanco. No es un
compromiso ni obliga a nada: es una pista para que el admin sepa si agenda un
solo día o varios. La liga con las sesiones vive en `sesion.solicitud_id`, así
que una misma solicitud puede terminar en varias sesiones.

Dos tipos de solicitud conviven en el mismo tablero:

- **Por materia**: elige una materia del catálogo y describe el tema concreto,
  por ejemplo "derivadas por regla de la cadena".
- **Tema especial**: escribe libremente lo que necesita aunque no corresponda a
  ninguna materia, por ejemplo "cómo estudiar para el examen de admisión" o
  "Excel para el proyecto integrador".

`codigo_publico` es un identificador corto y legible (formato `LUM-XXXX`) que
se le muestra al schüler al enviar la solicitud, para que pueda buscarla
después en el tablero.

`franjas_preferidas` guarda en qué días y rangos de hora le queda bien al
solicitante. Es la entrada del cruce automático del panel de asignación.

### pregunta_solicitud
`id`, `solicitud_id`, `zhensi_id`, `texto` (máx. 300 caracteres), `creada_en`

Un zhensi puede preguntarle algo a una solicitud abierta desde su panel, por
ejemplo qué temas en específico se quieren ver. La pregunta se publica en el
tablero público con el nombre del zhensi. Máximo tres preguntas por zhensi por
solicitud, y la puede borrar mientras nadie la haya contestado.

### respuesta_pregunta
`id`, `pregunta_id`, `texto` (máx. 500 caracteres), `huella`, `creada_en`

Cualquiera puede contestar desde el tablero, **sin cuenta y sin dar su
nombre**. La respuesta se publica ahí mismo, anónima. La `huella` es la misma
marca anónima del navegador que usan los apoyos: solo sirve para que el mismo
navegador no conteste dos veces la misma pregunta. No identifica a nadie.

### apoyo_solicitud
`id`, `solicitud_id`, `huella`, `creado_en`

Registra cada "yo también lo necesito". `huella` es un identificador anónimo
del navegador para evitar votos repetidos. No identifica a la persona.

### sesion
`id`, `solicitud_id` (nulo si el admin la crea por su cuenta; varias sesiones
pueden apuntar a la misma solicitud), `zhensi_id`,
`materia_id` (nulo en temas especiales), `titulo`, `fecha`, `hora_inicio`,
`hora_fin`, `salon`, `estado` (`borrador` | `publicada` | `realizada` |
`cancelada`), `creada_por`, `notas_publicas`

Todas las sesiones son presenciales. No existe campo de enlace ni modalidad.

### asistencia
`sesion_id`, `cantidad`, `capturada_por`, `capturada_en`

La captura un admin a mano después de la sesión. Es un número, no una lista de
personas.

### apunte
`id`, `titulo`, `materia_id`, `zhensi_id`, `generacion`, `archivo_url`,
`aprobado` (bool), `aprobado_por`, `creado_en`

Repositorio de apuntes de generaciones pasadas.

### mensaje_buzon
`id`, `categoria` (`sugerencia` | `agradecimiento` | `apoyo`), `contenido`,
`nombre_opcional`, `prioritario` (bool), `estado` (`nuevo` | `en_revision` |
`atendido`), `creado_en`, `atendido_por`

## 6. Flujo principal

1. Un schüler entra sin cuenta y crea una solicitud: materia o tema especial,
   descripción y en qué horarios le queda bien.
2. Si otro schüler ya pidió lo mismo, no crea una nueva: presiona "yo también
   lo necesito" y sube el contador.
3. Un admin abre el panel de demanda, ordenado por número de apoyos. Al abrir
   una solicitud, el sistema le muestra **solo los zhensis que pueden dar esa
   materia y cuya disponibilidad empata con las franjas pedidas.**
4. El admin elige zhensi, salón y hora, y publica. Puede agendar una sola
   sesión o varias de un jalón, incluyendo el mismo horario repetido varias
   semanas seguidas. La solicitud pasa a `agendada` y queda ligada a todas
   esas sesiones. Vuelve a `abierta` solo si se cancelan todas.
5. La sesión aparece en el tablero público. El schüler regresa, ve que su
   solicitud ya tiene fecha y salón, y asiste si quiere.
6. Después de la sesión, un admin captura cuánta gente llegó.

### Sobre la demanda esperada

El contador de apoyos es la única señal de cuánta gente puede asistir. No se
construye ningún modelo de predicción. Una solicitud con 14 apoyos pide salón
grande; una con 2 es tutoría chica. Esa es toda la lógica.

## 7. Pantallas

### Zona pública (sin cuenta)

- **Inicio**: sesiones de esta semana en tarjetas grandes con materia o tema,
  zhensi, día, hora y salón. Sin botones de acción, solo información.
- **Pedir ayuda**: formulario en dos caminos, "una materia" o "un tema
  especial". Al enviar, muestra el código público de la solicitud.
- **Tablero de demanda**: solicitudes abiertas ordenadas por apoyos, con
  filtro por carrera y buscador por código. Cada tarjeta trae el botón "yo
  también lo necesito", las preguntas que hicieron los zhensis con su caja
  para contestarlas de forma anónima, y el aviso de "¿te equivocaste?", que
  nunca promete que la solicitud se borre, solo que alguien la va a revisar.
  Las agendadas muestran su fecha y salón.
- **Zhensis**: galería con foto, carrera, materias y la línea de "así explico
  yo".
- **Apuntes**: repositorio filtrable por carrera y materia.
- **Buzón**: sugerencia, agradecimiento o apoyo.

### Zona zhensi

- **Solicitudes abiertas**: lo que está pidiendo la gente. Puede proponerse
  para darla y puede preguntarle algo a la solicitud.
- **Mi disponibilidad**: cuadrícula semanal, un toque por bloque.
- **Mis sesiones**: las asignadas, más el contador de horas acumuladas.
- **Mi perfil**: foto, materias que puede dar, descripción corta.
- **Subir apuntes**.

### Panel admin

- **Demanda**: solicitudes por apoyos, con el cruce automático de zhensis
  candidatos y el botón de agendar.
- **Sesiones**: calendario de la semana, publicar, cancelar, capturar
  asistencia.
- **Zhensis**: alta, baja, activar, desactivar, asignar materias.
- **Catálogo**: carreras y materias, con alta y edición desde la interfaz.
- **Buzón**: bandeja con estados, los prioritarios hasta arriba.
- **Apuntes**: aprobar o rechazar.
- **Dashboard**.

## 8. Reglas de negocio

1. Solo las sesiones en estado `publicada` o `realizada` son visibles al
   público.
2. Solo las sesiones `realizada` cuentan para las métricas.
3. **Las horas del zhensi no se capturan, se calculan** sumando la duración de
   sus sesiones realizadas. Es un valor derivado, jamás un campo editable.
4. Al agendar, si el zhensi ya tiene otra sesión que se traslapa, el sistema
   muestra una advertencia y pide confirmación. No bloquea, advierte.
5. Cada sesión guarda quién la creó, porque cinco admin trabajan en paralelo.
6. Las solicitudes se publican de inmediato, sin moderación previa, para que el
   contador de apoyos funcione. Cualquier admin puede ocultarlas, fusionarlas o
   borrarlas después.
7. Los apuntes sí requieren aprobación de un admin antes de ser visibles.
8. Los formularios públicos llevan límite de envíos por navegador para evitar
   abuso, ya que no hay cuentas.
9. Al elegir la categoría "apoyo" en el buzón, la pantalla muestra de inmediato
   los datos de contacto de orientación escolar y el mensaje entra marcado como
   prioritario. **Lumen es una red de apoyo académico entre pares, no un
   servicio de atención psicológica.** Esta ruta existe para derivar, no para
   atender.

## 9. Métricas del dashboard

- Sesiones realizadas (semana, mes, total)
- Schüler atendidos, sumando las asistencias capturadas
- Horas de mentoría acumuladas
- Zhensis activos
- Materias y temas más solicitados
- Solicitudes abiertas contra agendadas
- Días promedio entre que se pide una solicitud y se agenda
- Mensajes del buzón por categoría

Todo debe poder exportarse a CSV.

## 10. Fuera de alcance

No se construye, aunque parezca buena idea:

- Cuentas o registro para schüler
- Inscripción o reserva de lugar en sesiones
- Códigos o pases de lista de asistencia
- Recordatorios automáticos por correo o WhatsApp
- Constancias en PDF
- Sesiones en línea o híbridas
- Aplicación móvil nativa
- Cualquier tipo de pago
- Predicción de asistencia

## 11. Privacidad y seguridad

- Del schüler no se guarda ningún dato identificable. El nombre en el buzón es
  opcional y libre.
- Aviso de privacidad visible desde el pie de página, mencionando qué se guarda
  de zhensis y admin.
- Las fotos de perfil solo se publican con consentimiento explícito del zhensi,
  y existe el interruptor `visible_publico` para retirarlas.
- Contraseñas con hash. Nunca en texto plano, nunca en logs.
- Un zhensi no debe poder acceder a ninguna pantalla ni endpoint de admin.
- Respaldo automático de la base de datos.

## 12. Plan de fases

Una fase por sesión de trabajo, una rama por fase. No se avanza a la siguiente
hasta que el admin la haya probado a mano y aprobado.

| Fase | Contenido | Cómo se aprueba |
|---|---|---|
| 0 | Stack, repo, base de datos, login con doble rol, separación de zonas | Entrar como zhensi y como admin; confirmar que el zhensi no alcanza el panel |
| 1 | Catálogo de carreras y materias, más pantalla de alta | Cargar una carrera completa desde la interfaz |
| 2 | Perfil del zhensi y disponibilidad semanal | Capturar la disponibilidad real de un zhensi |
| 3 | Solicitudes públicas y botón de apoyo | Crear los dos tipos de solicitud desde el celular, sin sesión iniciada |
| 4 | Panel de asignación con cruce automático | Agendar una sesión real de principio a fin |
| 5 | Tablero público de sesiones y galería de zhensis | Abrirlo en el celular de alguien ajeno al proyecto, sin explicarle nada |
| 6 | Captura de asistencia, KPI de horas y dashboard | Capturar tres sesiones y verificar que los números cuadren |
| 7 | Buzón con ruta de canalización | Enviar un mensaje de cada categoría |
| 8 | Apuntes de generaciones pasadas | Subir, aprobar y descargar un apunte |
| 9 | Ajuste móvil, aviso de privacidad, respaldos | Revisión completa en celular |

Al terminar la fase 4, la plataforma ya sustituye lo que hoy se hace por
WhatsApp. Todo lo demás es mejora.
