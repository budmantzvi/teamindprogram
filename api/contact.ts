import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getRecipients(adminInput: any) {
  let emailSources: string[] = [];
  
  // 1. Priority: Input from Admin/Frontend
  if (adminInput) {
    const rawItems = Array.isArray(adminInput) ? adminInput : [adminInput];
    rawItems.forEach(item => {
      if (typeof item === 'string') {
        emailSources.push(...item.split(',').map(e => e.trim()));
      } else if (item && typeof item === 'object' && item.email) {
        emailSources.push(String(item.email).trim());
      } else if (item) {
        emailSources.push(String(item).trim());
      }
    });
  }

  // Filter valid emails from input
  let recipientsFromInput = emailSources
    .filter(e => e && typeof e === 'string' && e.includes('@'))
    .map(e => e.toLowerCase().trim());

  // Use input if available
  if (recipientsFromInput.length > 0) {
    return Array.from(new Set(recipientsFromInput));
  }

  // 2. If no admin input, use environment fallback
  if (process.env.CONTACT_EMAIL) {
    const envEmails = process.env.CONTACT_EMAIL.split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e && e.includes('@'));
    if (envEmails.length > 0) {
      return Array.from(new Set(envEmails));
    }
  }

  // 3. Final safety net (Emergency Fallback - ONLY if everything else is empty)
  return ['teamind50@gmail.com'];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle various body formats
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      console.error("[Vercel Contact] Parse error:", e);
    }
  }

  // Aliases for frontend/backend sync
  const { name, email, phone, message, language = 'he' } = body;
  const adminInput = body.adminEmails || body.adminEmail || null;
  const notificationSetting = body.notificationSetting || body.emailNotifications || 'both';

  const recipients = getRecipients(adminInput);
  const normalizedSenderEmail = email.toLowerCase().trim();
  console.log(`[Vercel Contact] From: ${email}, Recipients: ${recipients.join(', ')}`);

  if (notificationSetting === 'none') {
    return res.status(200).json({ success: true, message: "Notifications disabled" });
  }

  const results = {
    admin: { success: false, data: null, error: null },
    client: { success: false, data: null, error: null }
  };

  try {
    // 1. Email to Team
    if (notificationSetting === 'both' || notificationSetting === 'admin') {
      const { data, error } = await resend.emails.send({
        from: 'TEAMIND Contact <support@teamindprogram.com>',
        to: recipients,
        replyTo: email, // Allow admin to reply directly to user
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
      
      if (error) {
        console.error("[Vercel Contact] Resend error (admin):", error);
        results.admin.error = error;
      } else {
        results.admin.success = true;
        results.admin.data = data;
      }

      await sleep(500);
    }

    // 2. Email to Client
    const shouldSendToClient = notificationSetting === 'both' || notificationSetting === 'sender';
    const isSenderInAdminList = normalizedSenderEmail && recipients.includes(normalizedSenderEmail);

    if (shouldSendToClient) {
      if (isSenderInAdminList) {
        console.log(`[Vercel Contact] Sender ${normalizedSenderEmail} is in admin list. Skipping duplicate confirmation.`);
        results.client.success = true;
        results.client.data = { message: "Skipped - Sender is in Admin list" };
      } else {
        const { data, error } = await resend.emails.send({
          from: 'TEAMIND <support@teamindprogram.com>',
          to: [email],
          replyTo: process.env.CONTACT_EMAIL || 'teamind50@gmail.com',
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
        
        if (error) {
          console.error("[Vercel Contact] Resend error (client):", error);
          results.client.error = error;
        } else {
          results.client.success = true;
          results.client.data = data;
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      admin: results.admin, 
      client: results.client,
      note: (results.admin.error || results.client.error) ? "Request accepted with partial email success." : undefined
    });

  } catch (err: any) {
    console.error("[Vercel Contact] Server error:", err);
    return res.status(200).json({ 
      success: false, 
      error: err.message,
      note: "Fatal error handled to prevent retry loop."
    });
  }
}
