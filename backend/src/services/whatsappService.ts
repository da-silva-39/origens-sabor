import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn('Twilio não configurado. Notificações WhatsApp desativadas.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

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
    console.log(`WhatsApp enviado para ${to} (SID: ${message.sid})`);
  } catch (error) {
    console.error(`Erro ao enviar WhatsApp para ${to}:`, error);
  }
}