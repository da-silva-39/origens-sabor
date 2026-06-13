import twilio from 'twilio';

// Credenciais
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn('⚠️ Twilio não configurado corretamente. Notificações WhatsApp desativadas.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Envia uma mensagem WhatsApp genérica.
 * @param to - Número de destino (formato internacional sem '+' ou com '+'? Ambos funcionam)
 * @param body - Corpo da mensagem
 */
export async function enviarWhatsApp(to: string, body: string): Promise<void> {
  if (!client) {
    console.warn('Twilio não inicializado. Mensagem não enviada.');
    return;
  }
  if (!to) {
    console.warn('Destinatário não informado. Mensagem ignorada.');
    return;
  }

  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
    });
    console.log(`✅ WhatsApp enviado para ${to} - SID: ${message.sid}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar WhatsApp para ${to}:`, error);
  }
}

// ==================== Notificações específicas ====================

export interface PedidoWhatsAppData {
  id: number;
  clienteNome: string;
  endereco: string;
  bairro: string;
  subtotal: number;
  frete: number;
  total: number;
  status: string;
  itens: Array<{ nome: string; quantidade: number; precoUnitario: number }>;
}

export async function sendPedidoWhatsApp(pedido: PedidoWhatsAppData): Promise<void> {
  const toNumber = process.env.NOTIFICATION_WHATSAPP_TO;
  if (!toNumber) {
    console.warn('NOTIFICATION_WHATSAPP_TO não definido. Mensagem ignorada.');
    return;
  }

  const itensLista = pedido.itens
    .map(item => `• ${item.quantidade}x ${item.nome} – ${(item.quantidade * item.precoUnitario).toFixed(2)} MT`)
    .join('\n');

  const mensagem = `🍽️ *NOVO PEDIDO #${pedido.id}*
Cliente: ${pedido.clienteNome}
Endereço: ${pedido.endereco}
Bairro: ${pedido.bairro}

*Itens:*
${itensLista}

*Subtotal:* ${pedido.subtotal.toFixed(2)} MT
*Frete:* ${pedido.frete.toFixed(2)} MT
*Total:* ${pedido.total.toFixed(2)} MT

Status: ${pedido.status}
Data/Hora: ${new Date().toLocaleString('pt-PT')}`;

  await enviarWhatsApp(toNumber, mensagem);
}

export interface ReservaWhatsAppData {
  id: number;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone?: string;
  mesaNumero: number;
  dataHora: Date;
  quantidadePessoas: number;
  observacoes?: string;
  status: string;
}

export async function sendReservaWhatsApp(reserva: ReservaWhatsAppData): Promise<void> {
  const toNumber = process.env.NOTIFICATION_WHATSAPP_TO;
  if (!toNumber) {
    console.warn('NOTIFICATION_WHATSAPP_TO não definido. Mensagem ignorada.');
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'https://origens-sabor.vercel.app';

  const mensagem = `📅 *NOVA RESERVA #${reserva.id}*
Cliente: ${reserva.clienteNome}
E-mail: ${reserva.clienteEmail}
Telefone: ${reserva.clienteTelefone || 'não informado'}
Mesa: ${reserva.mesaNumero}
Data/Hora: ${new Date(reserva.dataHora).toLocaleString('pt-PT')}
Pessoas: ${reserva.quantidadePessoas}
Observações: ${reserva.observacoes || 'nenhuma'}
Status: ${reserva.status}

👉 Gerir reserva: ${frontendUrl}/admin/reservas`;

  await enviarWhatsApp(toNumber, mensagem);
}