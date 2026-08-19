-- AlterTable
ALTER TABLE "solicitud" ADD COLUMN "archivada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archivada_en" TIMESTAMP(3);
