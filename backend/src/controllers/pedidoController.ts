// backend/src/controllers/pedidoController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// ==================== Validações ====================
function validarEmail(email: string): boolean {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
}

function validarTelefoneMocambique(telefone: string): boolean {
  // Aceita formatos: +25882XXXXXXX ou 82XXXXXXX
  const regexCompleto = /^\+258[8][2-7]\d{7}$/;
  const regexLocal = /^[8][2-7]\d{7}$/;
  return regexCompleto.test(telefone) || regexLocal.test(telefone);
}

function formatarTelefone(telefone: string): string {
  if (telefone.startsWith('+258')) return telefone;
  if (telefone.match(/^[8][2-7]\d{7}$/)) return '+258' + telefone;
  return telefone;
}

// ==================== Configuração do Twilio ====================
const twilioClient = (() => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token) return twilio(sid, token);
  console.warn('⚠️ Twilio não configurado');
  return null;
})();

// ==================== Configuração do Nodemailer ====================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==================== Funções auxiliares de envio ====================
async function enviarWhatsApp(destino: string, mensagem: string): Promise<void> {
  if (!twilioClient) return;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!from || !destino) return;
  try {
    await twilioClient.messages.create({
      body: mensagem,
      from: `whatsapp:${from}`,
      to: `whatsapp:${destino}`,
    });
    console.log(`📱 WhatsApp enviado para ${destino}`);
  } catch (error) {
    console.error(`❌ Erro WhatsApp ${destino}:`, error);
  }
}

async function enviarEmail(destino: string, assunto: string, html: string): Promise<void> {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: destino,
      subject: assunto,
      html,
    });
    console.log(`📧 E‑mail enviado para ${destino}`);
  } catch (error) {
    console.error(`❌ Erro e‑mail ${destino}:`, error);
  }
}

// ==================== CLIENTE ====================
export const listarPedidosCliente = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { clienteId: userId },
      orderBy: { dataPedido: 'desc' },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

// ==================== CRIAR PEDIDO ====================
export const criarPedido = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { clienteNome, clienteEmail, telefone, endereco, bairro, subtotal, frete, total, itens, tempoEntrega } = req.body;

  // ========== Validações fortes ==========
  if (!clienteNome || !clienteEmail || !telefone || !endereco || !bairro || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  if (!validarEmail(clienteEmail)) {
    return res.status(400).json({ error: 'E‑mail inválido' });
  }
  const telefoneValido = validarTelefoneMocambique(telefone);
  if (!telefoneValido) {
    return res.status(400).json({ error: 'Número de telefone inválido. Use formato +25882XXXXXXX ou 82XXXXXXX' });
  }
  const telefoneFormatado = formatarTelefone(telefone);

  try {
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: user.id,
        endereco,
        bairro,
        subtotal,
        frete,
        total,
        status: 'PENDENTE',
        itens: {
          create: itens.map((item: any) => ({
            produtoId: item.produtoId,
            produtoNome: item.produtoNome,
            precoUnitario: item.precoUnitario,
            quantidade: item.quantidade,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { itens: true },
    });

    // Dados comuns para mensagens
    const itensResumo = pedido.itens
      .map(i => `• ${i.quantidade}x ${i.produtoNome} – ${(i.quantidade * i.precoUnitario).toFixed(2)} MT`)
      .join('\n');
    const dataHora = new Date().toLocaleString('pt-PT');
    const itensHtml = pedido.itens
      .map(
        i => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i.quantidade}x ${i.produtoNome}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${(i.quantidade * i.precoUnitario).toFixed(2)} MT</td>
          </tr>
        `
      )
      .join('');

    // --- Notificação ADMIN (WhatsApp) ---
    const adminWhats = process.env.NOTIFICATION_WHATSAPP_TO;
    if (adminWhats) {
      const msgAdmin = `🍽️ *NOVO PEDIDO #${pedido.id}*\n\n` +
        `*Cliente:* ${clienteNome}\n` +
        `*Telefone:* ${telefoneFormatado}\n` +
        `*E‑mail:* ${clienteEmail}\n` +
        `*Endereço:* ${endereco}\n` +
        `*Bairro:* ${bairro}\n\n` +
        `*Itens:*\n${itensResumo}\n\n` +
        `*Subtotal:* ${subtotal.toFixed(2)} MT\n` +
        `*Frete:* ${frete.toFixed(2)} MT\n` +
        `*Total:* ${total.toFixed(2)} MT\n\n` +
        `*Status:* ${pedido.status}\n` +
        `*Data/Hora:* ${dataHora}`;
      await enviarWhatsApp(adminWhats, msgAdmin);
    }

    // --- Notificação ADMIN (E‑mail) ---
    const adminEmail = process.env.NOTIFICATION_EMAIL_TO;
    if (adminEmail) {
      const emailAdminHtml = `
        <h2>🍽️ Novo Pedido #${pedido.id}</h2>
        <p><strong>Cliente:</strong> ${clienteNome}</p>
        <p><strong>Telefone:</strong> ${telefoneFormatado}</p>
        <p><strong>E‑mail:</strong> ${clienteEmail}</p>
        <p><strong>Endereço:</strong> ${endereco}</p>
        <p><strong>Bairro:</strong> ${bairro}</p>
        <h3>Itens:</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead><tr style="background:#f2f2f2;"><th>Produto</th><th>Subtotal</th></tr></thead>
          <tbody>${itensHtml}</tbody>
        </table>
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} MT</p>
        <p><strong>Frete:</strong> ${frete.toFixed(2)} MT</p>
        <p><strong>Total:</strong> ${total.toFixed(2)} MT</p>
        <p><strong>Status:</strong> ${pedido.status}</p>
        <p><strong>Data/Hora:</strong> ${dataHora}</p>
      `;
      await enviarEmail(adminEmail, `Novo Pedido #${pedido.id}`, emailAdminHtml);
    }

    // --- Notificação CLIENTE (WhatsApp) ---
    if (telefoneFormatado) {
      const msgCliente = `✅ *Pedido #${pedido.id} confirmado!*\n\n` +
        `Olá ${clienteNome}, recebemos o seu pedido e estamos a prepará‑lo.\n\n` +
        `*Itens:*\n${itensResumo}\n\n` +
        `*Total:* ${total.toFixed(2)} MT\n` +
        `*Tempo estimado:* ${tempoEntrega || 'a definir'}\n\n` +
        `Obrigado por escolher o Origens do Sabor! 🍽️`;
      await enviarWhatsApp(telefoneFormatado, msgCliente);
    }

    // --- Notificação CLIENTE (E‑mail) ---
    if (clienteEmail) {
      const emailClienteHtml = `
        <h2>✅ Pedido #${pedido.id} confirmado!</h2>
        <p>Olá <strong>${clienteNome}</strong>,</p>
        <p>Recebemos o seu pedido e estamos a prepará‑lo com todo o carinho.</p>
        <h3>Resumo:</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead><tr style="background:#f2f2f2;"><th>Produto</th><th>Subtotal</th></tr></thead>
          <tbody>${itensHtml}</tbody>
        </table>
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} MT</p>
        <p><strong>Frete:</strong> ${frete.toFixed(2)} MT</p>
        <p><strong>Total:</strong> ${total.toFixed(2)} MT</p>
        <p><strong>Tempo estimado:</strong> ${tempoEntrega || 'a definir'}</p>
        <p>Obrigado pela preferência! 🍽️</p>
      `;
      await enviarEmail(clienteEmail, `Confirmação do Pedido #${pedido.id}`, emailClienteHtml);
    }

    res.status(201).json(pedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno ao criar pedido' });
  }
};

// ==================== AGENTE ====================
export const listarPedidosAgente = async (req: Request, res: Response) => {
  const agenteId = (req as any).user.id;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { agenteId, status: { not: 'ENTREGUE' } },
      orderBy: { dataPedido: 'asc' },
      include: { cliente: { select: { nome: true } }, itens: true },
    });
    const formatted = pedidos.map(p => ({
      id: p.id,
      clienteNome: p.cliente.nome,
      endereco: p.endereco,
      total: p.total,
      status: p.status,
      itens: p.itens,
      bairro: p.bairro,
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos do agente' });
  }
};

export const marcarEntregue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const agenteId = (req as any).user.id;
  try {
    const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (pedido.agenteId !== agenteId) return res.status(403).json({ error: 'Não autorizado' });
    const updated = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status: 'ENTREGUE' },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar como entregue' });
  }
};

// ==================== ADMIN ====================
export const listarTodosPedidos = async (req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { cliente: { select: { nome: true } }, agente: { select: { nome: true } }, itens: true },
      orderBy: { dataPedido: 'desc' },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

export const atualizarStatusPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

export const listarAgentes = async (req: Request, res: Response) => {
  try {
    const agentes = await prisma.usuario.findMany({
      where: { role: 'AGENTE', ativo: true },
      select: { id: true, nome: true, telefone: true, email: true },
    });
    res.json(agentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar agentes' });
  }
};

export const atribuirAgente = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { agenteId } = req.body;
  try {
    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { agenteId: Number(agenteId) },
      include: { cliente: true, itens: true },
    });
    console.log(`📦 Pedido #${pedido.id} atribuído ao agente ${agenteId}`);
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atribuir agente' });
  }
};