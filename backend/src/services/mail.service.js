const nodemailer = require('nodemailer');

let transporter = null;
let devAccount = null;

// Helper cache for automated testing in development
let lastDevToken = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  }

  // Development fallback: try Ethereal or console logging
  try {
    devAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: devAccount.user,
        pass: devAccount.pass,
      },
    });
    console.log('[MAILER] Initialized Ethereal test account:', devAccount.user);
    return transporter;
  } catch (err) {
    console.warn('[MAILER] Could not initialize Ethereal account, using console fallback:', err.message);
    // Return a dummy transporter that logs to console
    transporter = {
      sendMail: async (mailOptions) => {
        return { messageId: 'console-dummy-id', ...mailOptions };
      },
    };
    return transporter;
  }
};

const sendPasswordResetEmail = async ({ to, name, token }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password/${token}`;

  // Store in-memory for testing
  lastDevToken = {
    email: to,
    token,
    timestamp: Date.now(),
  };

  // Log in development only - NEVER in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n======================================================');
    console.log(`[DEV PASSWORD RESET] To: ${to}`);
    console.log(`[DEV RESET LINK] ${resetLink}`);
    console.log('======================================================\n');
  }

  const fromAddress = process.env.MAIL_FROM || '"Store Rating Platform" <noreply@storerating.com>';

  const mailOptions = {
    from: fromAddress,
    to,
    subject: 'Password Reset Request - Store Rating Platform',
    text: `Hello ${name},\n\nYou requested to reset your password on the Store Rating Platform.\n\nPlease click the link below to set a new password:\n${resetLink}\n\nThis link is valid for 15 minutes and can only be used once.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4f46e5; margin: 0;">Store Rating Platform</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
        </div>
        <p style="color: #1e293b; font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; font-weight: bold; font-size: 14px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetLink}" style="color: #4f46e5; word-break: break-all;">${resetLink}</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This link will expire in 15 minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const activeTransporter = await getTransporter();
    const info = await activeTransporter.sendMail(mailOptions);
    if (devAccount && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('[MAILER] Ethereal preview URL:', previewUrl);
      }
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAILER] Error sending email:', error.message);
    // Don't throw fatal error so the controller can still return generic response
    return { success: false, error: error.message };
  }
};

const getLastDevToken = (email) => {
  if (lastDevToken && (!email || lastDevToken.email.toLowerCase() === email.toLowerCase())) {
    return lastDevToken.token;
  }
  return null;
};

module.exports = {
  sendPasswordResetEmail,
  getLastDevToken,
};
