const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
 // Enable CORS
 res.setHeader("Access-Control-Allow-Origin", "*");
 res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
 res.setHeader("Access-Control-Allow-Headers", "Content-Type");

 if (req.method === "OPTIONS") {
   return res.status(200).end();
 }

 if (req.method !== "POST") {
   return res.status(405).json({ error: "Method not allowed" });
 }

 try {
   const { email, userName, verificationCode } = req.body;
   
   const result = await resend.emails.send({
     from: "Paint Tracker <noreply@painttracker.app>",
     to: [email],
     subject: "Test Email",
     html: `<h1>Hello ${userName}</h1><p>Your code: ${verificationCode}</p>`,
   });

   res.status(200).json({ success: true, messageId: result.id });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
}
