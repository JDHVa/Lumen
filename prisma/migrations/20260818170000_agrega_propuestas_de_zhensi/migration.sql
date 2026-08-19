-- CreateTable
CREATE TABLE "propuesta_zhensi" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "zhensi_id" TEXT NOT NULL,
    "mensaje" TEXT,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propuesta_zhensi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "propuesta_zhensi_solicitud_id_zhensi_id_key" ON "propuesta_zhensi"("solicitud_id", "zhensi_id");

-- AddForeignKey
ALTER TABLE "propuesta_zhensi" ADD CONSTRAINT "propuesta_zhensi_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuesta_zhensi" ADD CONSTRAINT "propuesta_zhensi_zhensi_id_fkey" FOREIGN KEY ("zhensi_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
