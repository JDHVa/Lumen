-- CreateTable
CREATE TABLE "intento_acceso" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "logrado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intento_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intento_acceso_usuario_creado_en_idx" ON "intento_acceso"("usuario", "creado_en");

-- CreateIndex
CREATE INDEX "intento_acceso_origen_creado_en_idx" ON "intento_acceso"("origen", "creado_en");
