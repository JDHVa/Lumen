# Operación de Lumen

Esto no es documentación de código. Es lo que hay que saber para mantener el
sitio vivo: respaldos, publicación y qué hacer si algo se rompe.

## Respaldos

### Sacar uno a mano

```
npm run respaldo
```

Baja todas las tablas a `respaldos/lumen-FECHA.json`. Esa carpeta está fuera de
git a propósito: **un respaldo trae las contraseñas cifradas de todas las
cuentas y los mensajes del buzón.** Nunca lo subas a ningún lado sin cifrar.

### El respaldo automático

Corre solo cada **sábado a las 9 de la mañana** con GitHub Actions, y también se
puede disparar a mano desde la pestaña *Actions* del repositorio.

Para que funcione hay que crear dos secretos en
*Settings → Secrets and variables → Actions*:

| Secreto | Qué es |
|---|---|
| `DATABASE_URL` | La misma cadena que tienes en tu `.env` |
| `CLAVE_RESPALDO` | Una contraseña que te inventes, para cifrar el archivo |

**Guarda `CLAVE_RESPALDO` en tu gestor de contraseñas.** Si se pierde, los
respaldos cifrados no se pueden abrir nunca más. No hay forma de recuperarlos.

El respaldo queda guardado 90 días como artefacto de la ejecución, siempre
cifrado.

### Abrir un respaldo cifrado

```
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
  -in lumen-FECHA.json.enc -out lumen-FECHA.json
```

Te va a pedir la clave.

### Restaurar

El archivo es JSON plano, una lista por tabla. Para volver a meterlo hay que
insertarlo respetando el orden de dependencias:

1. `carrera`, `usuario`
2. `materia`, `perfil_zhensi`, `zhensi_materia`, `disponibilidad`
3. `solicitud`, `sesion`
4. `apoyo_solicitud`, `asistencia`, `apunte`, `mensaje_buzon`

**Los archivos de los apuntes y las fotos no van en el respaldo**, solo sus
direcciones. Esos viven en el bucket `lumen` de Supabase Storage y hay que
bajarlos aparte si se quiere un respaldo completo.

## Publicar el sitio

Se publica en Vercel, que es gratis para este tamaño.

1. Entra a vercel.com y conecta el repositorio de GitHub.
2. Vercel detecta Next.js solo. No hay que cambiar nada de la configuración.
3. Copia **todas** las variables de tu `.env` a
   *Settings → Environment Variables*:

   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

4. Agrega una más, que solo hace falta en producción:

   - `AUTH_TRUST_HOST` con valor `true`

5. Publica.

### Después de publicar

- Entra a `/iniciarsesion` y confirma que puedas entrar.
- **Cambia la contraseña del admin inicial**, porque la que está en el `.env`
  pasó por varios lados.
- Rota `AUTH_SECRET` y la contraseña de la base de datos si alguna vez las
  compartiste. Al rotar `AUTH_SECRET` se cierran todas las sesiones abiertas,
  lo cual es justo lo que se quiere.

## Cuentas

Las cuentas se crean desde *Panel de admin → Usuarios*. No hay registro público
y no debe haberlo: el schüler nunca tiene cuenta.

### Cambiar una contraseña

En *Panel de admin → Usuarios*, cada cuenta trae el botón **Cambiar su
contraseña**. Hay que escribirla dos veces, y el botón *Inventar una* genera
una al azar sin letras que se confundan.

**No hay recuperación por cuenta propia**: si alguien pierde la suya, un admin
se la cambia y se la entrega en persona. Lumen no manda correos, así que no
existe el "olvidé mi contraseña".

Cambiar la contraseña **no cierra las sesiones que ya estén abiertas**. Si el
motivo es que alguien perdió su celular, hay que rotar además el `AUTH_SECRET`,
lo cual saca a todo el mundo.

## Si algo se rompe

**"Unknown field" o errores raros de Prisma después de una migración:** el
servidor se quedó con la versión vieja en memoria. Bájalo y vuelve a levantarlo.

**Los archivos no suben:** revisa que existan `SUPABASE_URL` y
`SUPABASE_SERVICE_KEY`, y que el bucket `lumen` exista y esté marcado como
público.

**Un archivo borrado se sigue abriendo:** es la caché de Supabase. Se cae solo
en unas horas.
