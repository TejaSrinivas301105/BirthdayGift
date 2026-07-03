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
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,     // 10 seconds
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Just use the authenticated email
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (smtpError) {
    console.error('SMTP send failed, falling back to mock:', smtpError.message);
    console.log('\x1b[35m%s\x1b[0m', `📧 [EMAIL FALLBACK] OTP for ${options.to}:`);
    console.log('\x1b[35m%s\x1b[0m', options.html || options.text);
    return { mock: true, success: true, fallback: true };
  }
};

module.exports = sendEmail;
