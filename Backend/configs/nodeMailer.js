import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.SENDER_EMAIL || process.env.SMTP_USER || '';
  const mail = {
    from,
    to,
    subject,
    html,
    text
  };
  const res = await transporter.sendMail(mail);
  return res;
}

export default sendEmail;
