import nodemailer from 'nodemailer';
import { PedidoWhatsAppData } from './whatsappService'; // ou defina o tipo directamente

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true para 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  if (!to) {
    console.warn('E‑mail destination not configured. Skipping email notification.');
    return;
  }

  const itensHtml = pedido.itens
    .map(
      item => `<tr>
                 <td>${item.quantidade}x ${item.nome}</td>
                 <td>${(item.quantidade * item.precoUnitario).toFixed(2)} MT</td>
               </tr>`
    )
    .join('');

  const html = `
    <h2>Novo Pedido #${pedido.id}</h2>
    <p><strong>Cliente:</strong> ${pedido.clienteNome}</p>
    <p><strong>Endereço:</strong> ${pedido.endereco}</p>
    <p><strong>Bairro:</strong> ${pedido.bairro}</p>
    <h3>Itens:</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead><tr><th>Produto</th><th>Subtotal</th></tr></thead>
      <tbody>${itensHtml}</tbody>
    </table>
    <p><strong>Subtotal:</strong> ${pedido.subtotal.toFixed(2)} MT</p>
    <p><strong>Frete:</strong> ${pedido.frete.toFixed(2)} MT</p>
    <p><strong>Total:</strong> ${pedido.total.toFixed(2)} MT</p>
    <p><strong>Status:</strong> ${pedido.status}</p>
    <p><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Novo Pedido #${pedido.id}`,
      html,
    });
    console.log(`E‑mail enviado para o pedido ${pedido.id}`);
  } catch (error) {
    console.error(`Erro ao enviar e‑mail para o pedido ${pedido.id}:`, error);
  }
}