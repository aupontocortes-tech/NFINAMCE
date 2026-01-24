import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️ SMTP não configurado. Simulando envio de e-mail:');
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo: ${html}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"NFinance" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✅ E-mail enviado: %s', info.messageId);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
  }
};
