const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\x1b[35m%s\x1b[0m', '📧 [EMAIL MOCK SERVICE]');
    console.log('\x1b[35m%s\x1b[0m', `To:      ${options.to}`);
    console.log('\x1b[35m%s\x1b[0m', `Subject: ${options.subject}`);
    console.log('\x1b[35m%s\x1b[0m', `Message:`);
    console.log('\x1b[35m%s\x1b[0m', options.html || options.text);
    console.log('\x1b[35m%s\x1b[0m', '---------------------');
    return { mock: true, success: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for 587/25
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Asritha's World" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
