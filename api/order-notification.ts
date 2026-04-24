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

function formatDateForEmail() {
  const now = new Date();
  return now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
         now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle various body formats (Vercel/Make/Proxy issues)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      console.error("[Vercel OrderNotify] Failed to parse string body:", e);
    }
  }

  // Extremely flexible extraction (Aliases to support various Make/Meshulam payloads)
  const orderId = body.orderId || body.order_id || body.transactionId || body.transaction_id || '0000';
  const customerName = body.customerName || body.customer_name || body.name || body.fullName || 'Customer';
  const customerEmail = body.customerEmail || body.email || body.customer_email || body.user_email || '';
  const phone = body.phone || body.customerPhone || body.customer_phone || '';
  const program = body.program || body.item_name || body.productName || body.product_name || body.kit_type || 'Pedagogical Kit';
  const amount = body.amount || body.price || body.total_amount || body.total || '0';
  const shippingAddress = body.shippingAddress || body.address || null;
  const adminInput = body.adminEmails || body.adminEmail || body.admins || null;
  const orderNotifications = body.orderNotifications || body.notifications || body.emailNotifications || 'both';
  const language = body.language || 'he';

  console.log(`[Vercel OrderNotify] Processing #${orderId} for ${customerName} (To: ${customerEmail})`);
  console.log(`[Vercel OrderNotify] Raw body hint: ${JSON.stringify(body).slice(0, 200)}...`);

  if (orderNotifications === 'none') {
    return res.status(200).json({ success: true, message: "Order notifications disabled" });
  }

  const recipients = getRecipients(adminInput);
  const normalizedCustomerEmail = customerEmail.toLowerCase().trim();
  console.log(`[Vercel OrderNotify] Resolved recipients: ${recipients.join(', ')}`);

  // Final Results tracking
  const results = {
    admin: { success: false, data: null, error: null },
    client: { success: false, data: null, error: null }
  };

  try {
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
        results.admin.error = error;
      } else {
        console.log("[Vercel OrderNotify] Admin email success:", data);
        results.admin.success = true;
        results.admin.data = data;
      }

      // Add delay to prevent rate limit (max 5 per second)
      await sleep(500);
    }

    // 2. Email to Client
    const shouldSendToClient = orderNotifications === 'both' || orderNotifications === 'sender' || orderNotifications === 'customer';
    const isCustomerInAdminList = normalizedCustomerEmail && recipients.includes(normalizedCustomerEmail);

    if (shouldSendToClient) {
      if (isCustomerInAdminList) {
        console.log(`[Vercel OrderNotify] Customer ${normalizedCustomerEmail} is in admin list. Skipping duplicate confirmation email.`);
        results.client.success = true;
        results.client.data = { message: "Skipped - Customer is in Admin list" };
      } else {
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
          results.client.error = error;
          // Even if client email fails, we don't want to fail the whole request and trigger retries
        } else {
          console.log("[Vercel OrderNotify] Client email success:", data);
          results.client.success = true;
          results.client.data = data;
        }
      }
    }

    // Always Return 200 if we reached this point, even if some emails failed.
    // This prevents external callers from retrying and causing duplicates.
    return res.status(200).json({ 
      success: true, 
      admin: results.admin, 
      client: results.client,
      note: (results.admin.error || results.client.error) ? "One or more emails failed to send, but request completed." : undefined
    });

  } catch (err: any) {
    console.error("[Vercel OrderNotify] Fatal error inside handler:", err);
    // Even here, we might want to return 200 to block retries, but 500 is technically correct for crashes.
    return res.status(200).json({ 
      success: false, 
      error: err.message, 
      note: "Fatal error handled. Prevented retry." 
    });
  }
}
