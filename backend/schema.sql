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


-- Produtos cadastrados no sistema
INSERT INTO produtos (nome, descricao, preco, categoria, "imagemUrl", "createdAt", "updatedAt") VALUES
('SOPA DO DIA', 'Sopa caseira preparada no dia, com legumes e temperos frescos.', 100, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHAMUSSAS DE CARNE (4 UNID)', 'Quatro chamussas crocantes recheadas com carne picante.', 100, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHAMUSSAS DE FRANGO (4 UNID)', 'Quatro chamussas crocantes recheadas com frango desfiado.', 100, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHAMUSSAS DE PEIXE (4 UNID)', 'Quatro chamussas crocantes recheadas com peixe temperado.', 100, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('COXINHAS DE FRANGO (4 UNID)', 'Quatro coxinhas de frango empanadas e fritas.', 150, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('RISSÓIS DE CAMARÃO (4 UNID)', 'Quatro rissóis de camarão cremosos e crocantes.', 150, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SPRING ROLL (4 UNID)', 'Quatro rolinhos primavera com legumes e carne.', 150, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PÃO AO ALHO', 'Pão artesanal com manteiga de alho assado.', 150, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TOURADAS', 'Tiras de carne bovina temperadas e grelhadas.', 100, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('COMBO DE SALGADOS', 'Combo com variedade de salgados (coxinhas, rissóis, chamussas).', 425, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SANDES DE OVO', 'Sanduíche simples com ovo estrelado.', 60, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SANDES DE OVO E QUEIJO', 'Sanduíche com ovo e queijo derretido.', 100, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SANDES DE OVO, QUEIJO E FIAMBRE', 'Sanduíche com ovo, queijo e fiambre.', 130, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('UNIDADE DE BOLINHOS DA SORTE (4)', 'Quatro bolinhos da sorte com mensagens.', 60, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DOUNATS', 'Donut coberto com glacé ou chocolate.', 40, 'Entradas', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER SIMPLES', 'Pão, hambúrguer de carne, alface e tomate.', 120, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER COM OVO/QUEIJO', 'Hambúrguer simples com ovo e queijo.', 140, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER COMPLETO', 'Hambúrguer com queijo, ovo, bacon, alface e tomate.', 160, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER COMPLETO COM BATATA', 'Hambúrguer completo servido com batata frita.', 200, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER NEW YORK', 'Hambúrguer especial com cebola caramelizada e molho especial.', 280, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER DUPLO', 'Dois hambúrgueres, queijo, bacon e molho.', 250, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER COMPLETO DE FRANGO', 'Hambúrguer de frango com queijo, alface e tomate.', 180, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HAMBURGUER COMPLETO DE FRANGO COM BATATA', 'Hambúrguer de frango completo + batata frita.', 220, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SHAWARMA DE FRANGO', 'Pão sírio recheado com frango grelhado, molho de iogurte e vegetais.', 285, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEQUENO ALMOÇO COMPLETO', 'Pão, ovos, bacon, salsicha, feijão e sumo.', 385, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MATABICHO INGLÊS', 'Tradicional sanduíche inglês com carne, ovo e legumes.', 295, 'Hamburguer', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('POSTA DE PEIXE CHICAMBA', 'Posta de peixe chicamba grelhada, servida com acompanhamento.', 450, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('POSTA DE PEIXE PENDE', 'Posta de peixe pende grelhada, servida com acompanhamento.', 450, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('POSTA DE PEIXE PEDRA', 'Posta de peixe pedra grelhada, servida com acompanhamento.', 450, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CHICAMBA (500 MT)', 'Peixe chicamba grelhado (porção 500 MT), acompanhamentos à escolha.', 500, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CHICAMBA (700 MT)', 'Peixe chicamba grelhado (porção 700 MT), acompanhamentos à escolha.', 700, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CHICAMBA (800 MT)', 'Peixe chicamba grelhado (porção 800 MT), acompanhamentos à escolha.', 800, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE PENDE (500 MT)', 'Peixe pende grelhado (porção 500 MT), acompanhamentos à escolha.', 500, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE PENDE (700 MT)', 'Peixe pende grelhado (porção 700 MT), acompanhamentos à escolha.', 700, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE PENDE (800 MT)', 'Peixe pende grelhado (porção 800 MT), acompanhamentos à escolha.', 800, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE PEDRA (500 MT)', 'Peixe pedra grelhado (porção 500 MT), acompanhamentos à escolha.', 500, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE PEDRA (750 MT)', 'Peixe pedra grelhado (porção 750 MT), acompanhamentos à escolha.', 750, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE PEDRA (800 MT)', 'Peixe pedra grelhado (porção 800 MT), acompanhamentos à escolha.', 800, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CORVINA POSTA (450 MT)', 'Posta de peixe corvina grelhada (450 MT), acompanhamentos.', 450, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CORVINA POSTA (500 MT)', 'Posta de peixe corvina grelhada (500 MT), acompanhamentos.', 500, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE VERMELHÃO (600 MT)', 'Peixe vermelhão grelhado (600 MT), acompanhamentos.', 600, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE VERMELHÃO (700 MT)', 'Peixe vermelhão grelhado (700 MT), acompanhamentos.', 700, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE VERMELHÃO (800 MT)', 'Peixe vermelhão grelhado (800 MT), acompanhamentos.', 800, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CORVINA (500 MT)', 'Peixe corvina grelhado (500 MT), acompanhamentos.', 500, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEIXE CORVINA (600 MT)', 'Peixe corvina grelhado (600 MT), acompanhamentos.', 600, 'Peixes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE CAMARÃO (650 MT)', 'Massa Alfredo cremosa com camarões (650 MT).', 650, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE CAMARÃO (800 MT)', 'Massa Alfredo cremosa com camarões (800 MT).', 800, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE CAMARÃO (1000 MT)', 'Massa Alfredo cremosa com camarões (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE FRANGO (650 MT)', 'Massa Alfredo com frango desfiado (650 MT).', 650, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE FRANGO (800 MT)', 'Massa Alfredo com frango desfiado (800 MT).', 800, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE FRANGO (1000 MT)', 'Massa Alfredo com frango desfiado (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE CARNE (650 MT)', 'Massa Alfredo com carne bovina (650 MT).', 650, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE CARNE (800 MT)', 'Massa Alfredo com carne bovina (800 MT).', 800, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS ALFREDO DE CARNE (1000 MT)', 'Massa Alfredo com carne bovina (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS A ORIGENS (750 MT)', 'Massa especial da casa com molho e ingredientes selecionados (750 MT).', 750, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS A ORIGENS (1000 MT)', 'Massa especial da casa com molho e ingredientes selecionados (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSAS A ORIGENS (1500 MT)', 'Massa especial da casa com molho e ingredientes selecionados (1500 MT).', 1500, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSA COM CHOURIÇO (700 MT)', 'Massa salteada com chouriço e molho (700 MT).', 700, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSA COM CHOURIÇO (1000 MT)', 'Massa salteada com chouriço e molho (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LASANHA (800 MT)', 'Lasanha à bolonhesa com queijo (800 MT).', 800, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LASANHA (1000 MT)', 'Lasanha à bolonhesa com queijo (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LASANHA (1500 MT)', 'Lasanha à bolonhesa com queijo (1500 MT).', 1500, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LASANHA (2000 MT)', 'Lasanha à bolonhesa com queijo (2000 MT).', 2000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LASANHA (2500 MT)', 'Lasanha à bolonhesa com queijo (2500 MT).', 2500, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSA CHINESA (750 MT)', 'Massa estilo chinês com vegetais e proteína (750 MT).', 750, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSA CHINESA (800 MT)', 'Massa estilo chinês com vegetais e proteína (800 MT).', 800, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSA CHINESA (900 MT)', 'Massa estilo chinês com vegetais e proteína (900 MT).', 900, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MASSA CHINESA (1000 MT)', 'Massa estilo chinês com vegetais e proteína (1000 MT).', 1000, 'Massas & Pratos', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHÁ SIMPLES', 'Chá preto simples.', 50, 'Cafe e Cha', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHÁ DE CAMOMILA', 'Infusão de camomila relaxante.', 70, 'Cafe e Cha', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHÁ PRETO', 'Chá preto.', 50, 'Cafe e Cha', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
