const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${html}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@praxis.edu',
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
