-- AlterTable
ALTER TABLE "solicitud" ADD COLUMN "reportes_error" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reportada_en" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "reporte_error_solicitud" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "huella" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporte_error_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reporte_error_solicitud_solicitud_id_huella_key" ON "reporte_error_solicitud"("solicitud_id", "huella");

-- AddForeignKey
ALTER TABLE "reporte_error_solicitud" ADD CONSTRAINT "reporte_error_solicitud_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;
