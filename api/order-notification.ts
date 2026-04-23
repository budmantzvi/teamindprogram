import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getRecipients(adminEmail: any) {
  if (!adminEmail) return [process.env.CONTACT_EMAIL || 'teamind50@gmail.com'];
  
  if (Array.isArray(adminEmail)) {
    const valid = adminEmail.filter(e => typeof e === 'string' && e.includes('@'));
    return valid.length > 0 ? valid : [process.env.CONTACT_EMAIL || 'teamind50@gmail.com'];
  }
  
  if (typeof adminEmail === 'string' && adminEmail.includes('@')) {
    return adminEmail.split(',').map(e => e.trim()).filter(e => e.includes('@'));
  }
  
  return [process.env.CONTACT_EMAIL || 'teamind50@gmail.com'];
}

function formatDateForEmail() {
  const now = new Date();
  return now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
         now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle potential stringified body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const { 
    orderId, 
    customerName, 
    customerEmail, 
    phone, 
    program, 
    amount, 
    shippingAddress, 
    adminEmails, 
    orderNotifications = 'both',
    language = 'he'
  } = body;

  console.log(`[Vercel OrderNotify] Request for #${orderId} - ${customerName}`);

  if (orderNotifications === 'none') {
    return res.status(200).json({ success: true, message: "Order notifications disabled" });
  }

  const recipients = getRecipients(adminEmails || body.adminEmail);

  try {
    let adminResult = null;
    let clientResult = null;

    // 1. Email to Admin
    if (orderNotifications === 'both' || orderNotifications === 'admin') {
      console.log(`[Vercel OrderNotify] Attempting admin email to: ${recipients.join(', ')}`);
      
      const orderDate = formatDateForEmail();
      const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';

      const { data, error } = await resend.emails.send({
        from: `TEAMIND <${senderEmail}>`,
        to: recipients,
        subject: `New Order #${orderId} - ${customerName}`,
        html: `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">New Order Received!</h2>
            
            <div style="margin: 20px 0;">
              <p style="font-size: 18px;"><strong>Date:</strong> ${orderDate}</p>
              <p style="font-size: 18px;"><strong>Order ID:</strong> <span dir="ltr">#${orderId}</span></p>
              <p><strong>Program:</strong> ${program}</p>
              <p><strong>Amount:</strong> ₪${amount}</p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #334155;">Customer Details</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            ${shippingAddress ? `
            <div style="background: #f0fdfa; padding: 20px; border-radius: 15px; border: 1px solid #ccfbf1;">
              <h3 style="margin-top: 0; color: #0f766e;">Shipping Address</h3>
              <p style="margin-bottom: 0;">
                ${shippingAddress.street || ''} ${shippingAddress.houseNumber || ''}<br/>
                ${shippingAddress.apartment ? `דירה ${shippingAddress.apartment}<br/>` : ''}
                ${shippingAddress.city || ''}<br/>
                ${shippingAddress.zipCode ? `מיקוד: ${shippingAddress.zipCode}` : ''}
              </p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://teamindprogram.com/teamind-secure-portal-2024-v2" 
                 style="background: #0d9488; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">
                 View in Admin Panel
              </a>
            </div>
          </div>
        `,
      });
      if (error) {
        console.error("[Vercel OrderNotify] Resend error (admin):", error);
      } else {
        console.log("[Vercel OrderNotify] Admin email success:", data);
        adminResult = data;
      }
    }

    // 2. Email to Client
    if (orderNotifications === 'both' || orderNotifications === 'sender' || orderNotifications === 'customer') {
      const isHe = language === 'he';
      const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
      console.log(`[Vercel OrderNotify] Attempting client email (${isHe ? 'HE' : 'EN'}) to: ${customerEmail}`);
      
      const subject = isHe ? `TEAMIND - אישור הזמנה #${orderId}` : `Order Confirmation #${orderId} - TEAMIND`;
      const html = isHe ? `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto; direction: rtl; text-align: right;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">אישור הזמנה</h2>
            <p>שלום ${customerName},</p>
            <p>תודה על הרכישה! קיבלנו את הזמנתך עבור <strong>${program}</strong>.</p>
            
            <div style="margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 15px;">
              <p><strong>מספר הזמנה:</strong> <span dir="ltr">#${orderId}</span></p>
              <p><strong>סכום ששולם:</strong> ₪${amount}</p>
            </div>

            <p>אנו מכינים את הערכה שלך למשלוח. תקבל/י הודעת דוא"ל נוספת ברגע שהיא תצא לדרך.</p>
            <p>אם יש לך שאלות, ניתן להשיב למייל זה.</p>
            <p>בברכה,<br/><strong>צוות TEAMIND</strong></p>
          </div>
      ` : `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto; direction: ltr;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">Order Confirmation</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for your purchase! We've received your order for the <strong>${program}</strong>.</p>
            
            <div style="margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 15px;">
              <p><strong>Order ID:</strong> <span dir="ltr">#${orderId}</span></p>
              <p><strong>Amount Paid:</strong> ₪${amount}</p>
            </div>

            <p>We are preparing your kit for shipment. You will receive another email once it's on its way.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br/><strong>The TEAMIND Team</strong></p>
          </div>
      `;

      const { data, error } = await resend.emails.send({
        from: `TEAMIND <${senderEmail}>`,
        to: [customerEmail],
        replyTo: process.env.CONTACT_EMAIL || 'teamind50@gmail.com',
        subject: subject,
        html: html,
      });
      if (error) {
        console.error("[Vercel OrderNotify] Resend error (client):", error);
      } else {
        console.log("[Vercel OrderNotify] Client email success:", data);
        clientResult = data;
      }
    }

    return res.status(200).json({ success: true, adminResult, clientResult });
  } catch (err: any) {
    console.error("[Vercel OrderNotify] Fatal error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
