/*
  Warnings:

  - A unique constraint covering the columns `[codigoRecibo]` on the table `reservas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigoRecibo` to the `reservas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `reservas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "codigoRecibo" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reservas_codigoRecibo_key" ON "reservas"("codigoRecibo");
