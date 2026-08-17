-- CreateEnum
CREATE TYPE "tipo_solicitud" AS ENUM ('materia', 'tema_especial');

-- CreateEnum
CREATE TYPE "estado_solicitud" AS ENUM ('abierta', 'agendada', 'cerrada', 'oculta');

-- CreateEnum
CREATE TYPE "estado_sesion" AS ENUM ('borrador', 'publicada', 'realizada', 'cancelada');

-- CreateEnum
CREATE TYPE "categoria_buzon" AS ENUM ('sugerencia', 'agradecimiento', 'apoyo');

-- CreateEnum
CREATE TYPE "estado_buzon" AS ENUM ('nuevo', 'en_revision', 'atendido');

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "es_zhensi" BOOLEAN NOT NULL DEFAULT true,
    "es_admin" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_zhensi" (
    "usuario_id" TEXT NOT NULL,
    "foto_url" TEXT,
    "carrera_id" TEXT,
    "semestre" INTEGER,
    "descripcion_corta" VARCHAR(200),
    "visible_publico" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "perfil_zhensi_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "zhensi_materia" (
    "usuario_id" TEXT NOT NULL,
    "materia_id" TEXT NOT NULL,

    CONSTRAINT "zhensi_materia_pkey" PRIMARY KEY ("usuario_id","materia_id")
);

-- CreateTable
CREATE TABLE "carrera" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clave" TEXT NOT NULL,

    CONSTRAINT "carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "carrera_id" TEXT,
    "semestre" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,

    CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud" (
    "id" TEXT NOT NULL,
    "codigo_publico" TEXT NOT NULL,
    "tipo" "tipo_solicitud" NOT NULL,
    "materia_id" TEXT,
    "titulo_tema" TEXT,
    "descripcion" TEXT NOT NULL,
    "carrera_id" TEXT,
    "franjas_preferidas" JSONB NOT NULL,
    "apoyos" INTEGER NOT NULL DEFAULT 0,
    "estado" "estado_solicitud" NOT NULL DEFAULT 'abierta',
    "sesion_id" TEXT,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apoyo_solicitud" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "huella" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apoyo_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesion" (
    "id" TEXT NOT NULL,
    "zhensi_id" TEXT NOT NULL,
    "materia_id" TEXT,
    "titulo" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "salon" TEXT NOT NULL,
    "estado" "estado_sesion" NOT NULL DEFAULT 'borrador',
    "creada_por" TEXT NOT NULL,
    "notas_publicas" TEXT,

    CONSTRAINT "sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencia" (
    "sesion_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "capturada_por" TEXT NOT NULL,
    "capturada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencia_pkey" PRIMARY KEY ("sesion_id")
);

-- CreateTable
CREATE TABLE "apunte" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "materia_id" TEXT NOT NULL,
    "zhensi_id" TEXT NOT NULL,
    "generacion" TEXT,
    "archivo_url" TEXT NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "aprobado_por" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apunte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensaje_buzon" (
    "id" TEXT NOT NULL,
    "categoria" "categoria_buzon" NOT NULL,
    "contenido" TEXT NOT NULL,
    "nombre_opcional" TEXT,
    "prioritario" BOOLEAN NOT NULL DEFAULT false,
    "estado" "estado_buzon" NOT NULL DEFAULT 'nuevo',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendido_por" TEXT,

    CONSTRAINT "mensaje_buzon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_key" ON "usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "carrera_clave_key" ON "carrera"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_codigo_publico_key" ON "solicitud"("codigo_publico");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_sesion_id_key" ON "solicitud"("sesion_id");

-- CreateIndex
CREATE UNIQUE INDEX "apoyo_solicitud_solicitud_id_huella_key" ON "apoyo_solicitud"("solicitud_id", "huella");

-- AddForeignKey
ALTER TABLE "perfil_zhensi" ADD CONSTRAINT "perfil_zhensi_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_zhensi" ADD CONSTRAINT "perfil_zhensi_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zhensi_materia" ADD CONSTRAINT "zhensi_materia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zhensi_materia" ADD CONSTRAINT "zhensi_materia_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materia" ADD CONSTRAINT "materia_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad" ADD CONSTRAINT "disponibilidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apoyo_solicitud" ADD CONSTRAINT "apoyo_solicitud_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_zhensi_id_fkey" FOREIGN KEY ("zhensi_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_creada_por_fkey" FOREIGN KEY ("creada_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_capturada_por_fkey" FOREIGN KEY ("capturada_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apunte" ADD CONSTRAINT "apunte_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apunte" ADD CONSTRAINT "apunte_zhensi_id_fkey" FOREIGN KEY ("zhensi_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apunte" ADD CONSTRAINT "apunte_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje_buzon" ADD CONSTRAINT "mensaje_buzon_atendido_por_fkey" FOREIGN KEY ("atendido_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
