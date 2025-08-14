const functions = require("firebase-functions");
const { Resend } = require("resend");

const resend = new Resend("your_api_key_here");

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  // Handle CORS for all requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    const { email, userName, verificationCode } = req.body;

    const result = await resend.emails.send({
      from: "Paint Tracker <noreply@painttracker.app>",
      to: [email],
      subject: "Test Email",
      html: `<h1>Hello ${userName}</h1><p>Your code: ${verificationCode}</p>`,
    });

    res.json({ success: true, messageId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});