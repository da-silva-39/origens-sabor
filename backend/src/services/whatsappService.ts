import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error('Twilio credentials not configured');
}

const client = twilio(accountSid, authToken);

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

/**
 * Envia uma notificação de pedido via WhatsApp usando a sandbox.
 */
export async function sendPedidoWhatsApp(pedido: PedidoWhatsAppData): Promise<void> {
  const toNumber = process.env.NOTIFICATION_WHATSAPP_TO;

  if (!toNumber) {
    console.warn('WhatsApp destination number not configured. Skipping notification.');
    return;
  }

  // Construir a mensagem com todas as informações do pedido
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

  try {
    const message = await client.messages.create({
      body: mensagem,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`
    });
    console.log(`WhatsApp notification sent for order ${pedido.id}, SID: ${message.sid}`);
  } catch (error) {
    console.error(`Failed to send WhatsApp notification for order ${pedido.id}:`, error);
  }
}