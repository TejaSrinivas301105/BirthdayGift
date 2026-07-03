const { Resend } = require('resend');

const sendEmail = async (options) => {
  // If no Resend API key, use mock
  if (!process.env.RESEND_API_KEY) {
    console.log('\x1b[35m%s\x1b[0m', '📧 [EMAIL MOCK SERVICE]');
    console.log('\x1b[35m%s\x1b[0m', `To:      ${options.to}`);
    console.log('\x1b[35m%s\x1b[0m', `Subject: ${options.subject}`);
    console.log('\x1b[35m%s\x1b[0m', `OTP Code: ${extractOtpFromHtml(options.html)}`);
    console.log('\x1b[35m%s\x1b[0m', '---------------------');
    return { mock: true, success: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Asritha\'s World <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend error:', error);
      // Fallback to mock
      console.log('\x1b[35m%s\x1b[0m', `📧 [RESEND FALLBACK] OTP for ${options.to}:`);
      console.log('\x1b[35m%s\x1b[0m', `OTP: ${extractOtpFromHtml(options.html)}`);
      return { mock: true, success: true, fallback: true };
    }

    console.log('Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('Email send error:', error.message);
    console.log('\x1b[35m%s\x1b[0m', `📧 [FALLBACK] OTP for ${options.to}:`);
    console.log('\x1b[35m%s\x1b[0m', `OTP: ${extractOtpFromHtml(options.html)}`);
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