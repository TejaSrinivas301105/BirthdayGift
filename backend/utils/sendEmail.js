const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If no email credentials, use mock
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\x1b[35m%s\x1b[0m', '📧 [EMAIL MOCK SERVICE]');
    console.log('\x1b[35m%s\x1b[0m', `To:      ${options.to}`);
    console.log('\x1b[35m%s\x1b[0m', `Subject: ${options.subject}`);
    
    const otp = extractOtpFromHtml(options.html);
    console.log('\x1b[35m%s\x1b[0m', `OTP CODE: ${otp}`);
    console.log('\x1b[35m%s\x1b[0m', '---------------------');
    return { mock: true, success: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'in-v3.mailjet.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Asritha's World" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent via Mailjet: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Mailjet send failed, falling back to mock:', error.message);
    const otp = extractOtpFromHtml(options.html);
    console.log('\x1b[35m%s\x1b[0m', `📧 [FALLBACK] OTP for ${options.to}: ${otp}`);
    return { mock: true, success: true, fallback: true };
  }
};

// Helper to extract OTP from HTML
function extractOtpFromHtml(html) {
  if (!html) return 'N/A';
  const match = html.match(/>(\d{6})</);
  return match ? match[1] : 'N/A';
}

module.exports = sendEmail;