const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Load SMTP config from functions config: `firebase functions:config:set smtp.user="..." smtp.pass="..." smtp.host="..." smtp.port=587 smtp.secure=false site.from="Prof Name <no-reply@...>"
const smtpConfig = functions.config().smtp || {};
const SITE_CONFIG = functions.config().site || {};

const SMTP_USER = smtpConfig.user || '';
const SMTP_PASS = smtpConfig.pass || '';
const SMTP_HOST = smtpConfig.host || '';
const SMTP_PORT = smtpConfig.port ? Number(smtpConfig.port) : 587;
const SMTP_SECURE = smtpConfig.secure === 'true' || smtpConfig.secure === true;
const FROM_ADDRESS = SITE_CONFIG.from || 'No Reply <no-reply@yourdomain.com>';

let transporter;
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else if (SMTP_USER && SMTP_PASS) {
  // Fallback to Gmail service if host not provided (not recommended for production)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  // No transporter configured — functions will log error when trying to send
  transporter = null;
  console.warn('No SMTP configuration found for sending emails. Set functions config smtp.*');
}

exports.sendWelcomeEmail = functions
  .region('asia-south1')
  .firestore.document('newsletter_subscribers/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};
    const email = data.email;
    if (!email) {
      console.warn('No email found on subscriber doc:', context.params.docId);
      return null;
    }

    // Build email HTML — simple template, adjust branding as needed
    const html = `
      <div style="font-family: Georgia, 'Times New Roman', serif; padding: 20px; color: #111;">
        <h1 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">The Monthly Insight</h1>
        <p>You're almost there! Click the link below to confirm your subscription and you'll be all set.</p>
        <p>
          <a href="https://YOUR_CONFIRMATION_ENDPOINT/confirm?email=${encodeURIComponent(email)}&id=${context.params.docId}" style="display:inline-block;padding:12px 20px;background:#0b6db0;color:#fff;border-radius:6px;text-decoration:none;">Confirm your subscription</a>
        </p>

        <p>In gratitude,</p>
        <p><strong>Prof. (Your Name)</strong><br/>IIM Ahmedabad</p>

        <hr/>
        <p style="font-size:0.85rem;color:#666;">If you did not sign up for this newsletter, you can safely ignore this email.</p>
      </div>
    `;

    const mailOptions = {
      from: FROM_ADDRESS,
      to: email,
      subject: 'Confirm your subscription — The Monthly Insight',
      html,
    };

    if (!transporter) {
      console.error('Transporter not configured. Cannot send email to', email);
      return snap.ref.update({ emailSent: false, emailError: 'transporter-not-configured' }).catch(() => null);
    }

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent to', email);
      return snap.ref.update({ emailSent: true, emailSentAt: admin.firestore.FieldValue.serverTimestamp(), emailError: null });
    } catch (err) {
      console.error('Error sending email to', email, err);
      return snap.ref.update({ emailSent: false, emailError: err.message }).catch(() => null);
    }
  });
