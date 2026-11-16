-- AlterTable reservas: permitir reservas sem conta (contacto directo)
ALTER TABLE "reservas" ALTER COLUMN "clienteId" DROP NOT NULL;
ALTER TABLE "reservas" ADD COLUMN IF NOT EXISTS "nomeContacto" TEXT;
ALTER TABLE "reservas" ADD COLUMN IF NOT EXISTS "emailContacto" TEXT;
ALTER TABLE "reservas" ADD COLUMN IF NOT EXISTS "telefoneContacto" TEXT;

UPDATE "reservas" r
SET
  "nomeContacto" = COALESCE(r."nomeContacto", u."nome"),
  "emailContacto" = COALESCE(r."emailContacto", u."email"),
  "telefoneContacto" = COALESCE(r."telefoneContacto", u."telefone")
FROM "usuarios" u
WHERE r."clienteId" = u."id"
  AND (r."nomeContacto" IS NULL OR r."emailContacto" IS NULL OR r."telefoneContacto" IS NULL);

-- AlterTable produtos: disponibilidade, destaque e alergénios
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "disponivel" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "destaque" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "alergenios" TEXT;

-- Índices de desempenho
CREATE INDEX IF NOT EXISTS "produtos_categoria_idx" ON "produtos"("categoria");
CREATE INDEX IF NOT EXISTS "produtos_disponivel_destaque_idx" ON "produtos"("disponivel", "destaque");
CREATE INDEX IF NOT EXISTS "pedidos_clienteId_dataPedido_idx" ON "pedidos"("clienteId", "dataPedido");
CREATE INDEX IF NOT EXISTS "pedidos_agenteId_status_idx" ON "pedidos"("agenteId", "status");
CREATE INDEX IF NOT EXISTS "pedidos_status_idx" ON "pedidos"("status");
CREATE INDEX IF NOT EXISTS "itens_pedido_pedidoId_idx" ON "itens_pedido"("pedidoId");
CREATE INDEX IF NOT EXISTS "reservas_mesaId_dataHora_status_idx" ON "reservas"("mesaId", "dataHora", "status");
CREATE INDEX IF NOT EXISTS "reservas_clienteId_dataHora_idx" ON "reservas"("clienteId", "dataHora");
CREATE INDEX IF NOT EXISTS "reservas_status_idx" ON "reservas"("status");
CREATE INDEX IF NOT EXISTS "localizacoes_agente_agenteId_createdAt_idx" ON "localizacoes_agente"("agenteId", "createdAt");
CREATE INDEX IF NOT EXISTS "usuarios_role_ativo_idx" ON "usuarios"("role", "ativo");
