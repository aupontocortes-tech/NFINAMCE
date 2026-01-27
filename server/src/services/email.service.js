import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Configuração SMTP (Fallback)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Configuração Resend (Prioritária)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (resend) {
  console.log('📧 Serviço de E-mail: Resend inicializado com sucesso.');
} else {
  console.log('⚠️ Serviço de E-mail: RESEND_API_KEY não encontrada. Usando fallback.');
}

export const sendEmail = async (to, subject, html) => {
  // 1. Tenta usar Resend se configurado
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: 'NFinance <onboarding@resend.dev>', // Use seu domínio verificado em produção
        to: [to],
        subject: subject,
        html: html,
      });
      console.log('✅ E-mail enviado via Resend:', data);
      return;
    } catch (error) {
      console.error('❌ Erro ao enviar via Resend, tentando SMTP...', error);
      // Se falhar, tenta cair para o SMTP abaixo
    }
  }

  // 2. Tenta usar SMTP
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const info = await transporter.sendMail({
        from: `"NFinance" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log('✅ E-mail enviado via SMTP: %s', info.messageId);
      return;
    } catch (error) {
      console.error('❌ Erro ao enviar via SMTP:', error);
    }
  }

  // 3. Fallback: Apenas loga no console
  console.log('⚠️ Nenhum serviço de e-mail configurado (Resend ou SMTP). Simulando envio:');
  console.log(`Para: ${to}`);
  console.log(`Assunto: ${subject}`);
  // console.log(`Conteúdo: ${html}`); // Opcional para não poluir
};
