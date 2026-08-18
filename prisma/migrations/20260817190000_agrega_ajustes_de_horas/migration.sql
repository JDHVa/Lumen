-- CreateTable
CREATE TABLE "ajuste_horas" (
    "id" TEXT NOT NULL,
    "zhensi_id" TEXT NOT NULL,
    "minutos" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "creado_por" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ajuste_horas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ajuste_horas" ADD CONSTRAINT "ajuste_horas_zhensi_id_fkey" FOREIGN KEY ("zhensi_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajuste_horas" ADD CONSTRAINT "ajuste_horas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
