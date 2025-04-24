const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

admin.initializeApp();

// Use Firebase functions config for Gmail credentials
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

// Create a reusable transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// ✅ 1st Gen Function Setup with Region + Resource Control
exports.sendCustomEmail = functions
  .region('eu-central1') // Specify your region
  .runWith({
    memory: '256MB',
    timeoutSeconds: 60,
  })
  .https.onCall(async (data, context) => {
    // Optional auth check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Only authenticated users can send emails.'
      );
    }

    const { to, subject, message } = data;

    if (!to || !subject || !message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: to, subject, or message.'
      );
    }

    const mailOptions = {
      from: gmailEmail,
      to,
      subject,
      text: message,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
