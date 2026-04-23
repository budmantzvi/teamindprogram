import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);
if (!process.env.RESEND_API_KEY) {
  console.warn("WARNING: RESEND_API_KEY is not set. Email notifications will fail.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

/**
 * Helper to get validated recipients from various sources
 */
const getRecipients = (adminEmails: any, adminEmail: any, fallback: string = 'teamind50@gmail.com'): string[] => {
  let raw: any[] = [];
  const normalizedFallback = fallback.toLowerCase().trim();

  console.log("[getRecipients] Debugging recipient selection...");
  console.log("[getRecipients] Received adminEmails from client:", JSON.stringify(adminEmails));
  console.log("[getRecipients] Received adminEmail from client:", JSON.stringify(adminEmail));

  // 1. Process client-provided emails (The Admin Panel settings)
  if (Array.isArray(adminEmails)) {
    adminEmails.forEach(item => {
      if (typeof item === 'string') {
        item.split(',').forEach(s => raw.push(s.trim()));
      } else {
        if (item) raw.push(item);
      }
    });
  } else if (typeof adminEmails === 'string' && adminEmails.trim()) {
    adminEmails.split(',').forEach(s => raw.push(s.trim()));
  }

  if (typeof adminEmail === 'string' && adminEmail.trim()) {
    adminEmail.split(',').forEach(s => raw.push(s.trim()));
  }

  const filterEmails = (list: any[]) => list
    .map(email => String(email || '').trim().toLowerCase())
    .filter(email => email && email.includes('@'));

  let clientEmails = filterEmails(raw);

  // LOGIC:
  // If the admin has set specific recipients in the UI, use them.
  if (clientEmails.length > 0) {
    console.log(`[getRecipients] SUCCESS: Using Admin Panel UI recipients: [${clientEmails.join(', ')}]`);
    return Array.from(new Set(clientEmails));
  }

  console.log("[getRecipients] INFO: No valid recipients found in client request (UI). Checking Environment Variables...");

  // 2. ONLY fallback to environment if NO UI settings exist
  const envEmail = (process.env.CONTACT_EMAIL || '').trim();
  const envEmails = envEmail.split(',').map(s => s.trim().toLowerCase()).filter(e => e.includes('@'));

  if (envEmails.length > 0) {
    console.log(`[getRecipients] FALLBACK: Using Environment Variables (CONTACT_EMAIL): [${envEmails.join(', ')}]`);
    return Array.from(new Set(envEmails));
  }

  // 3. Absolute fallback
  console.log(`[getRecipients] WARNING: No UI settings and no ENV variables. Absolute fallback to: ${normalizedFallback}`);
  return [normalizedFallback];
};

/**
 * Robust date formatting for emails
 */
const formatDateForEmail = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} | ${hours}:${minutes}`;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log("Middleware: Body parsers enabled (JSON & URL-encoded)");

  console.log("--- Server Environment Config ---");
  console.log("RESEND_API_KEY: ", process.env.RESEND_API_KEY ? "CONFIGURED" : "MISSING");
  console.log("CONTACT_EMAIL:  ", process.env.CONTACT_EMAIL ? "CONFIGURED" : "MISSING (will use Admin UI values)");
  console.log("---------------------------------");

  // API recipes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      config: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasSenderEmail: !!process.env.RESEND_SENDER_EMAIL,
        hasContactEmail: !!process.env.CONTACT_EMAIL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  // API Route: Contact Form
  app.post("/api/contact", async (req, res) => {
    const { 
      name, 
      email, 
      phone, 
      message, 
      adminEmail, 
      adminEmails, 
      emailNotifications,
      notificationSetting,
      language
    } = req.body;


    const nSetting = emailNotifications || notificationSetting || 'both';
    
    const recipients = getRecipients(adminEmails, adminEmail);

    console.log(`[ContactForm] Submission from ${name}. Recipients: ${recipients.join(', ')}`);

    if (nSetting === 'none') {
      return res.json({ success: true, message: "Notifications disabled by admin" });
    }

    try {
      let adminResult = null;
      let clientResult = null;

      // 1. Email to Team
      if (nSetting === 'both' || nSetting === 'admin') {
        if (recipients.length > 0) {
          console.log(`[ContactForm] Sending to: ${recipients.join(', ')}`);
          
          const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
          const submissionDate = formatDateForEmail();
          
          const emailPromises = recipients.map(recipient => 
            resend.emails.send({
              from: `TEAMIND <${senderEmail}>`,
              to: [recipient],
              subject: `New Message from ${name}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #0d9488;">New Contact Form Submission</h2>
                  <p><strong>Date:</strong> ${submissionDate}</p>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                  <p><strong>Message:</strong></p>
                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #0d9488;">
                    ${(message || '').replace(/\n/g, '<br/>')}
                  </div>
                </div>
              `,
            })
          );

          const results = await Promise.allSettled(emailPromises);
          results.forEach((res, idx) => {
            if (res.status === 'fulfilled' && !res.value.error) {
              console.log(`[ContactForm] Success for ${recipients[idx]}`);
              adminResult = res.value.data;
            } else {
              const error = res.status === 'fulfilled' ? res.value.error : res.reason;
              console.error(`[ContactForm] Failure for ${recipients[idx]}:`, error);
            }
          });
        } else {
          console.warn("[ContactForm] No recipients found.");
        }
      }

      // 2. Email to Client
      if (nSetting === 'both' || nSetting === 'sender') {
        try {
          const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
          const isHe = language === 'he';
          
          const subject = isHe ? `תודה על פנייתך, ${name}!` : `Thanks for reaching out, ${name}!`;
          const html = isHe ? `
              <div style="font-family: sans-serif; direction: rtl; padding: 20px;">
                <h2 style="color: #0d9488;">שלום ${name},</h2>
                <p>תודה שפנית ל-<strong>TEAMIND</strong>. קיבלנו את הודעתך בנוגע לערכה הפדגוגית שלנו.</p>
                <p>הצוות שלנו בוחן את פנייתך ונחזור אליך בהקדם, תוך 24-48 שעות.</p>
                <br />
                <p>בברכה,</p>
                <p><strong>צוות TEAMIND</strong></p>
              </div>
          ` : `
              <div style="font-family: sans-serif; direction: ltr; padding: 20px;">
                <h2 style="color: #0d9488;">Hi ${name},</h2>
                <p>Thank you for contacting <strong>TEAMIND</strong>. We've received your message regarding our pedagogical kit.</p>
                <p>Our team is reviewing your inquiry and we will get back to you within 24-48 hours.</p>
                <br />
                <p>Best regards,</p>
                <p><strong>The TEAMIND Team</strong></p>
              </div>
          `;

          const { data, error } = await resend.emails.send({
            from: `TEAMIND <${senderEmail}>`,
            to: [email],
            replyTo: process.env.CONTACT_EMAIL || 'teamind50@gmail.com',
            subject: subject,
            html: html,
          });
          if (error) console.error("[ContactForm] Resend error (client):", error);
          clientResult = data;
        } catch (clientErr) {
          console.error("[ContactForm] Resend exception (client):", clientErr);
        }
      }

      res.json({ success: true, adminResult, clientResult });
    } catch (err: any) {
      console.error("[ContactForm] Server error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Stripe Checkout
  app.post("/api/checkout", async (req, res) => {
    const { planId, planName, price } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `TEAMIND ${planName}`,
                description: `Pedagogical Kit for ${planName}`,
              },
              unit_amount: Math.round(parseFloat(price.replace(',', '')) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Make.com Payment Webhook
  app.post("/api/make-payment", async (req, res) => {
    // 1. Validate if we even have a body to prevent empty/probe requests from hitting Make
    if (!req.body || (Object.keys(req.body).length === 0)) {
      console.warn("[MakePayment] Ignoring empty or invalid request probe.");
      return res.status(400).json({ error: "Empty payload" });
    }

    const { 
      orderId, 
      amount, 
      customer_name, 
      name: bodyName,
      fullName: bodyFullName,
      email, 
      phone, 
      product_name, 
      city, 
      street, 
      houseNumber, 
      apartment, 
      zipCode 
    } = req.body;

    // 2. Resolve field values with fallback
    const resolvedName = (customer_name || bodyName || bodyFullName || "").toString().trim();
    const resolvedAmount = Number(amount || req.body.price || 0);
    const resolvedPhone = (phone || req.body.phone || "").toString().trim();

    // If critical data is missing, don't forward to Make to avoid "Validation Failed" emails
    if (!resolvedName || resolvedAmount <= 0) {
      console.warn("[MakePayment] Validation failed locally, skipping Make.com call.", { resolvedName, resolvedAmount });
      return res.status(400).json({ error: "Invalid name or amount" });
    }

    const payload = {
      // Primary keys
      orderId: String(orderId || '').trim(),
      amount: resolvedAmount,
      customerName: resolvedName,
      email: String(email || '').trim().toLowerCase(),
      phone: resolvedPhone,
      productName: String(product_name || '').trim(),
      
      // Explicit Meshulam/Make requirements for the Scenario
      name: resolvedName,
      fullName: resolvedName,
      price: resolvedAmount,
      
      // Standard aliases
      order_id: String(orderId || '').trim(),
      customer_name: resolvedName,
      product_name: String(product_name || '').trim(),
      
      // Address fields
      city: String(city || '').trim(),
      street: String(street || '').trim(),
      houseNumber: String(houseNumber || '').trim(),
      apartment: String(apartment || '').trim(),
      zipCode: String(zipCode || '').trim(),
      address: `${String(street || '').trim()} ${String(houseNumber || '').trim()}, ${String(city || '').trim()}`,
      timestamp: new Date().toISOString(),
    };

    console.log(`[MakePayment] Processing order ${orderId} for ${customer_name}. Amount: ${amount}`);
    console.log("[MakePayment] Payload:", JSON.stringify(payload));

    try {
      const webhookUrl = process.env.MAKE_PAYMENT_WEBHOOK_URL || "https://hook.eu2.make.com/uv77f5twm7j9koihwb82ppp4vo83iamp";
      
      if (!process.env.MAKE_PAYMENT_WEBHOOK_URL) {
        console.warn("[MakePayment] Using fallback webhook URL. Check environment variables.");
      }

      console.log(`[MakePayment] Sending request to Make.com: ${webhookUrl}`);
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`[MakePayment] Make.com response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`[MakePayment] Make.com error [${response.status}]: ${responseText}`);
        
        if (response.status === 500) {
          // If it's a 500, we check if the response body contains a specific error from Meshulam/Make
          let details = "";
          try {
            const errorJson = JSON.parse(responseText);
            details = errorJson.message || errorJson.error || responseText;
          } catch(e) {
            details = responseText;
          }
          
          throw new Error(`התרחיש ב-Make.com נכשל (שגיאה 500). ייתכן שישנה בעיה בהגדרות ה-Meshulam בתוך מייק, או שפרטי התשלום אינם תקינים. שגיאת המערכת: ${details.substring(0, 100)}`);
        }
        throw new Error(`שגיאה בחיבור למערכת התשלומים (${response.status}): ${responseText.substring(0, 100)}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (responseText === "Accepted") {
          throw new Error("מייק החזיר 'Accepted' אך חסר מודול 'Webhook Response' שמחזיר את כתובת התשלום (JSON עם שדה url).");
        }
        throw new Error(`תגובה לא מזוהה ממערכת התשלומים: ${responseText.substring(0, 50)}`);
      }
      
      if (data && data.url) {
        res.json({ url: data.url });
      } else {
        throw new Error("לא התקבלה כתובת תשלום מהשרת. ודא שהתרחיש במייק מחזיר אובייקט עם שדה url.");
      }
    } catch (err: any) {
      console.error("[MakePayment] FATAL ERROR during webhook call:", err);
      // Give more context if it's a fetch error
      let errorMessage = err.message || "שגיאה פנימית בשרת התשלומים";
      if (err.name === 'AbortError' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        errorMessage = `שגיאת תקשורת עם שרת התשלומים (Make.com): ${err.message}`;
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // API Route: Order Notification
  app.post("/api/order-notification", async (req, res) => {
    const { 
      orderId, 
      customerName, 
      customerEmail, 
      phone, 
      program, 
      amount, 
      shippingAddress, 
      adminEmails, 
      adminEmail, 
      orderNotifications,
      language
    } = req.body;

    const nSetting = orderNotifications || 'both';

    if (nSetting === 'none') {
      return res.json({ success: true, message: "Order notifications disabled" });
    }

    const recipients = getRecipients(adminEmails, adminEmail);

    console.log(`[OrderNotify] Order ${orderId}. Recipients: ${recipients.join(', ')}`);

    try {
      let adminResult = null;
      let clientResult = null;

      // 1. Email to Admin
      if (nSetting === 'both' || nSetting === 'admin') {
        if (recipients.length > 0) {
          console.log(`[OrderNotify] Sending Admin Notifications to: ${recipients.join(', ')}`);
          
          const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
          const orderDate = formatDateForEmail();
          
          const emailPromises = recipients.map(recipient => 
            resend.emails.send({
              from: `TEAMIND <${senderEmail}>`,
              to: [recipient],
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
            })
          );

          const results = await Promise.allSettled(emailPromises);
          results.forEach((res, idx) => {
            if (res.status === 'fulfilled' && !res.value.error) {
              console.log(`[OrderNotify] Success for admin ${recipients[idx]}`);
              adminResult = res.value.data;
            } else {
              const error = res.status === 'fulfilled' ? (res.value.error || 'Unknown Error') : res.reason;
              console.error(`[OrderNotify] Failure for admin ${recipients[idx]}:`, error);
            }
          });
        } else {
          console.warn("[OrderNotify] No admin recipients found. Notification setting was:", nSetting);
        }
      }

      // 2. Email to Client
      if (nSetting === 'both' || nSetting === 'sender' || nSetting === 'customer') {
        try {
          console.log(`[OrderNotify] Sending Client Notification to: ${customerEmail}`);
          const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
          const isHe = language === 'he';
          
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
            console.error("[OrderNotify] Resend error (client):", error);
          } else {
            console.log(`[OrderNotify] Success for client ${customerEmail}`);
            clientResult = data;
          }
        } catch (clientResendErr) {
          console.error("[OrderNotify] Resend Exception (client):", clientResendErr);
        }
      }

      res.json({ success: true, adminResult, clientResult });
    } catch (err: any) {
      console.error("[OrderNotify] Server error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
