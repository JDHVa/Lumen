-- AlterTable
ALTER TABLE "apunte" ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "rechazado" BOOLEAN NOT NULL DEFAULT false;
