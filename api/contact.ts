import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message, adminEmail, notificationSetting = 'both' } = req.body;

  const recipient = adminEmail || process.env.CONTACT_EMAIL || 'teamind50@gmail.com';

  if (notificationSetting === 'none') {
    return res.status(200).json({ success: true, message: "Notifications disabled by admin" });
  }

  try {
    let adminResult = null;
    let clientResult = null;

    // 1. Email to Team
    if (notificationSetting === 'both' || notificationSetting === 'admin') {
      const { data, error } = await resend.emails.send({
        from: 'TEAMIND Contact <support@teamindprogram.com>',
        to: [recipient],
        subject: `New Message from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0d9488;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #0d9488;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      });
      if (error) console.error("Resend error (admin):", error);
      adminResult = data;
    }

    // 2. Email to Client
    if (notificationSetting === 'both' || notificationSetting === 'sender') {
      const { data, error } = await resend.emails.send({
        from: 'TEAMIND <support@teamindprogram.com>',
        to: [email],
        subject: `Thanks for reaching out, ${name}!`,
        html: `
          <div style="font-family: sans-serif; direction: ltr; padding: 20px;">
            <h2 style="color: #0d9488;">Hi ${name},</h2>
            <p>Thank you for contacting <strong>TEAMIND</strong>. We've received your message regarding our pedagogical kit.</p>
            <p>Our team is reviewing your inquiry and we will get back to you within 24-48 hours.</p>
            <br />
            <p>Best regards,</p>
            <p><strong>The TEAMIND Team</strong></p>
          </div>
        `,
      });
      if (error) console.error("Resend error (client):", error);
      clientResult = data;
    }

    return res.status(200).json({ success: true, adminResult, clientResult });
  } catch (err: any) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
