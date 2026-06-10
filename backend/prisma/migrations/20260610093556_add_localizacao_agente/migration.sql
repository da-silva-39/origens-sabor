-- CreateTable
CREATE TABLE "localizacoes_agente" (
    "id" SERIAL NOT NULL,
    "agenteId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "endereco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "localizacoes_agente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "localizacoes_agente" ADD CONSTRAINT "localizacoes_agente_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
