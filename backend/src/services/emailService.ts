import { Resend } from 'resend';
import { escaparHtml } from '../utils/validators';
import { formatarDataHoraMaputo } from '../utils/datetime';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface PedidoEmailData {
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

export async function sendPedidoEmail(pedido: PedidoEmailData): Promise<void> {
  const to = process.env.NOTIFICATION_EMAIL_TO;
  if (!to || !resend) {
    console.warn('E-mail não configurado. Notificação ignorada.');
    return;
  }

  const itensHtml = pedido.itens
    .map(
      (item) => `<tr>
                 <td>${item.quantidade}x ${escaparHtml(item.nome)}</td>
                 <td>${(item.quantidade * item.precoUnitario).toFixed(2)} MT</td>
               </tr>`
    )
    .join('');

  const html = `
    <h2>Novo pedido #${pedido.id}</h2>
    <p><strong>Cliente:</strong> ${escaparHtml(pedido.clienteNome)}</p>
    <p><strong>Endereço:</strong> ${escaparHtml(pedido.endereco)}</p>
    <p><strong>Bairro:</strong> ${escaparHtml(pedido.bairro)}</p>
    <h3>Itens:</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead><tr><th>Produto</th><th>Subtotal</th></tr></thead>
      <tbody>${itensHtml}</tbody>
    </table>
    <p><strong>Subtotal:</strong> ${pedido.subtotal.toFixed(2)} MT</p>
    <p><strong>Frete:</strong> ${pedido.frete.toFixed(2)} MT</p>
    <p><strong>Total:</strong> ${pedido.total.toFixed(2)} MT</p>
    <p><strong>Estado:</strong> ${escaparHtml(pedido.status)}</p>
    <p><strong>Data:</strong> ${formatarDataHoraMaputo(new Date())}</p>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Origens do Sabor <onboarding@resend.dev>',
      to,
      subject: `Novo Pedido #${pedido.id}`,
      html,
    });
    console.log(`E-mail enviado para o pedido ${pedido.id}`);
  } catch (error) {
    console.error(`Erro ao enviar e-mail para o pedido ${pedido.id}:`, error);
  }
}
