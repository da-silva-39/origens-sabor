-- =====================================================
-- Origens do Sabor - schema PostgreSQL (Neon)
-- Gerado a partir de prisma/schema.prisma
--
-- AVISO: este script cria o schema completo. Execute numa base
-- de dados vazia. Para atualizar uma base ja existente use:
--   npx prisma db push
-- =====================================================

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENTE', 'AGENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isOAuth" BOOLEAN NOT NULL DEFAULT false,
    "endereco" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "agenteId" INTEGER,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "frete" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER,
    "produtoNome" TEXT NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "qrCode" TEXT,
    "ocupada" BOOLEAN NOT NULL DEFAULT false,
    "pedidoAtualId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "quantidadePessoas" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "codigoRecibo" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxas_frete" (
    "id" SERIAL NOT NULL,
    "bairro" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tempoEstimado" TEXT NOT NULL,

    CONSTRAINT "taxas_frete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("chave")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_key" ON "mesas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_qrCode_key" ON "mesas"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_codigoRecibo_key" ON "reservas"("codigoRecibo");

-- CreateIndex
CREATE UNIQUE INDEX "taxas_frete_bairro_key" ON "taxas_frete"("bairro");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localizacoes_agente" ADD CONSTRAINT "localizacoes_agente_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Administrador (email: admin@origens.com / senha: OrigensAdm@2026)
INSERT INTO usuarios (nome, email, senha, role, "updatedAt") VALUES
('OrigensAdmin', 'admin@origens.com', '$2b$10$FYu4nwOeuxbYUntsMJirT.FCKvUI0kVevpu5yciISajDuJwBIb0ZW', 'ADMIN', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Taxas de frete (bairros)
INSERT INTO taxas_frete (bairro, valor, "tempoEstimado") VALUES
('Centro', 50.00, '30-40 min'),
('Matundo', 80.00, '45-60 min'),
('Mutarara', 120.00, '60-90 min'),
('Mundine', 100.00, '50-70 min'),
('Soalpo', 110.00, '55-80 min'),
('Bloco 9', 85.00, '40-60 min')
ON CONFLICT (bairro) DO NOTHING;

-- Mesas (1 a 10)
INSERT INTO mesas (numero, "qrCode", "updatedAt") VALUES
(1, 'mesa-1', CURRENT_TIMESTAMP), (2, 'mesa-2', CURRENT_TIMESTAMP),
(3, 'mesa-3', CURRENT_TIMESTAMP), (4, 'mesa-4', CURRENT_TIMESTAMP),
(5, 'mesa-5', CURRENT_TIMESTAMP), (6, 'mesa-6', CURRENT_TIMESTAMP),
(7, 'mesa-7', CURRENT_TIMESTAMP), (8, 'mesa-8', CURRENT_TIMESTAMP),
(9, 'mesa-9', CURRENT_TIMESTAMP), (10, 'mesa-10', CURRENT_TIMESTAMP)
ON CONFLICT (numero) DO NOTHING;

-- Horario de funcionamento
INSERT INTO configuracoes (chave, valor) VALUES
('abertura_hora', '07:30'),
('fechamento_hora', '22:00'),
('abertura_domingo', '09:00'),
('fechamento_domingo', '22:00'),
('dias_funcionamento', '1,2,3,4,5,6,7')
ON CONFLICT (chave) DO NOTHING;

-- Produtos de exemplo (podem ser geridos no painel admin)
INSERT INTO produtos (nome, descricao, preco, categoria, "imagemUrl", "updatedAt") VALUES
('Pizza Margherita', 'Molho de tomate, mussarela, manjericao', 450.00, 'Pizza', '/pizza.jpg', CURRENT_TIMESTAMP),
('Hamburguer Artesanal', '180g carne, queijo cheddar, alface, tomate', 320.00, 'Hamburguer', '/lanche.jpg', CURRENT_TIMESTAMP),
('Frango Grelhado', '1/4 frango com batata e arroz', 400.00, 'Refeicao', '/Imagens Corretas/frango e btt.jpg', CURRENT_TIMESTAMP);
