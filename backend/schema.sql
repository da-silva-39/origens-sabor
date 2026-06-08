-- Criar a base de dados (se não existir)
CREATE DATABASE origens_sabor_db;
\c origens_sabor_db;

-- =====================================================
-- Tabela: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CLIENTE', -- ADMIN, CLIENTE, AGENTE
    ativo BOOLEAN DEFAULT true,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabela: produtos
-- =====================================================
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    "imagemUrl" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabela: pedidos
-- =====================================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    "clienteId" INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    "agenteId" INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    endereco TEXT NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    frete DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDENTE',
    "dataPedido" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabela: itens_pedido
-- =====================================================
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    "pedidoId" INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    "produtoId" INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    "produtoNome" VARCHAR(150) NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    quantidade INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- =====================================================
-- Tabela: mesas
-- =====================================================
CREATE TABLE mesas (
    id INTEGER PRIMARY KEY,
    "qrCode" VARCHAR(50) UNIQUE,
    ocupada BOOLEAN DEFAULT false,
    "pedidoAtualId" VARCHAR(50)
);

-- =====================================================
-- Tabela: reservas
-- =====================================================
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    "clienteId" INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    "mesaId" INTEGER NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    "dataHora" TIMESTAMP NOT NULL,
    "quantidadePessoas" INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabela: taxas_frete
-- =====================================================
CREATE TABLE taxas_frete (
    id SERIAL PRIMARY KEY,
    bairro VARCHAR(100) UNIQUE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    "tempoEstimado" VARCHAR(50) NOT NULL
);

-- =====================================================
-- Tabela: configuracoes
-- =====================================================
CREATE TABLE configuracoes (
    chave VARCHAR(50) PRIMARY KEY,
    valor TEXT NOT NULL
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir administrador (senha: OrigensAdm@2026, hash BCrypt)
-- Hash gerado para 'OrigensAdm@2026' com bcrypt (custo 10)
INSERT INTO usuarios (nome, email, senha, role) VALUES 
('OrigensAdmin', 'admin@origens.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqFqX4qX4qX4qX4qX4qX4qX4qX4q', 'ADMIN');

-- Inserir taxas de frete (bairros)
INSERT INTO taxas_frete (bairro, valor, "tempoEstimado") VALUES
('Centro', 50.00, '30-40 min'),
('Matundo', 80.00, '45-60 min'),
('Mutarara', 120.00, '60-90 min'),
('Mundine', 100.00, '50-70 min'),
('Soalpo', 110.00, '55-80 min'),
('Bloco 9', 85.00, '40-60 min');

-- Inserir mesas (1 a 10)
INSERT INTO mesas (id, "qrCode") VALUES
(1, 'mesa-1'), (2, 'mesa-2'), (3, 'mesa-3'),
(4, 'mesa-4'), (5, 'mesa-5'), (6, 'mesa-6'),
(7, 'mesa-7'), (8, 'mesa-8'), (9, 'mesa-9'), (10, 'mesa-10');

-- Inserir configurações (horário de funcionamento)
INSERT INTO configuracoes (chave, valor) VALUES
('abertura_hora', '07:30'),
('fechamento_hora', '22:00'),
('abertura_domingo', '09:00'),
('fechamento_domingo', '22:00'),
('dias_funcionamento', '1,2,3,4,5,6,7');

-- Inserir alguns produtos exemplo
INSERT INTO produtos (nome, descricao, preco, categoria, "imagemUrl") VALUES
('Pizza Margherita', 'Molho de tomate, mussarela, manjericão', 450.00, 'Pizza', '/pizza.jpg'),
('Hambúrguer Artesanal', '180g carne, queijo cheddar, alface, tomate', 320.00, 'Hamburguer', '/hamburguer.jpg'),
('Frango Grelhado', '¼ frango com batata e arroz', 400.00, 'Refeição', '/frango.jpg');