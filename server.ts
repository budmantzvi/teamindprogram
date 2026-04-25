import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

console.log("================ SERVER STARTUP ================");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "EXISTS (Starts with " + process.env.RESEND_API_KEY.substring(0, 5) + "...)" : "MISSING");
console.log("RESEND_SENDER_EMAIL:", process.env.RESEND_SENDER_EMAIL || "NOT SET (Defaulting to support@teamindprogram.com)");
console.log("CONTACT_EMAIL:", process.env.CONTACT_EMAIL || "NOT SET");
console.log("MAKE_PAYMENT_WEBHOOK_URL:", process.env.MAKE_PAYMENT_WEBHOOK_URL ? "EXISTS" : "MISSING");
console.log("================================================");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);
if (!process.env.RESEND_API_KEY) {
  console.warn("WARNING: RESEND_API_KEY is not set. Email notifications will fail.");
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, runTransaction, serverTimestamp, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import fs from 'fs';

// Read config safely
const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf8'));

// Initialize Firebase for the Server
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Helper to get validated recipients from various sources
 */
const getRecipients = async (adminEmails: any, adminEmail: any, type: 'contact' | 'order' = 'contact'): Promise<string[]> => {
  let emailSources: string[] = [];
  
  console.log(`[Server] Starting recipient resolution for ${type}...`);

  // 1. Fetch the Master Config from Firestore (config/site)
  try {
    const configSnap = await getDoc(doc(db, 'config', 'site'));
    if (configSnap.exists()) {
      const configData = configSnap.data();
      
      // Hierarchy of resolution:
      // 1. Primary List
      const targetList = type === 'order' 
        ? configData.orderNotificationAdmins 
        : configData.notificationAdmins;
      
      if (Array.isArray(targetList) && targetList.length > 0) {
        console.log(`[Server] Found ${targetList.length} defined admins in config/site for ${type}`);
        emailSources.push(...targetList);
      } 
      
      // 2. Secondary List if empty
      if (emailSources.length === 0) {
        const secondaryList = type === 'order' 
          ? configData.notificationAdmins 
          : configData.orderNotificationAdmins;
        if (Array.isArray(secondaryList) && secondaryList.length > 0) {
          console.log(`[Server] Falling back to secondary list for ${type}`);
          emailSources.push(...secondaryList);
        }
      }
      
      // 3. All Admins if still empty
      if (emailSources.length === 0) {
        if (Array.isArray(configData.allAdmins) && configData.allAdmins.length > 0) {
          console.log(`[Server] Falling back to allAdmins list.`);
          emailSources.push(...configData.allAdmins);
        }
      }
      
      // 4. Contact Email if still empty
      if (emailSources.length === 0 && configData.contactEmail) {
        console.log(`[Server] Falling back to contactEmail.`);
        emailSources.push(...configData.contactEmail.split(',').map((s: string) => s.trim()));
      }
    }
  } catch (err) {
    console.error("[Server] Failed to fetch site config/site:", err);
  }

  // 2. Fetch specific admin users from 'admins' collection (backup) - ONLY if nothing resolved so far
  if (emailSources.length === 0) {
    try {
      const adminSnap = await getDocs(collection(db, 'admins'));
      adminSnap.forEach(docSnap => {
        const email = docSnap.id.trim().toLowerCase();
        if (email.includes('@')) {
          emailSources.push(email);
        }
      });
      console.log(`[Server] Total emails in admins collection: ${adminSnap.size}`);
    } catch (err) {
      console.error("[Server] Failed to fetch admins collection (Permissions?):", err);
    }
  }

  // 3. Add input from Admin/Frontend if provided
  if (adminEmails || adminEmail) {
    const rawItems = Array.isArray(adminEmails) ? adminEmails : (adminEmail ? [adminEmail] : []);
    rawItems.forEach((item: any) => {
      if (typeof item === 'string') {
        emailSources.push(...item.split(',').map((e: string) => e.trim()));
      } else if (item && typeof item === 'object' && item.email) {
        emailSources.push(String(item.email).trim());
      } else if (item) {
        emailSources.push(String(item).trim());
      }
    });
  }

  // 4. Filter and deduplicate
  const cleanEmails = Array.from(new Set(
    emailSources.map(e => String(e || '').trim().toLowerCase())
       .filter(e => e && e.includes('@'))
  ));

  if (cleanEmails.length > 0) {
    console.log(`[Server] Final Resolved Recipients for ${type}: ${cleanEmails.join(', ')}`);
    return cleanEmails;
  }

  // 5. Ultimate safety net
  console.log(`[Server] No recipients resolved for ${type}. Using ultimate fallback.`);
  return ['teamind50@gmail.com'];
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
    // 1. Ensure body is an object (Vercel/Node edge cases)
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch (e) { console.error("Body parse error:", e); }
    }

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
    } = bodyData || {};

    const contactId = `${email}_${Date.now()}`; // Simple unique ID for this specific submission
    const nSetting = emailNotifications || notificationSetting || 'both';
    
    // Detailed logs for debugging
    console.log("=========================================");
    console.log("[CONTACT API] RECEIVED DATA:", JSON.stringify(bodyData));
    
    const recipients = await getRecipients(adminEmails, adminEmail, 'contact');
    
    console.log(`[CONTACT API] DECIDED RECIPIENTS: ${JSON.stringify(recipients)}`);
    console.log("=========================================");

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
            replyTo: process.env.CONTACT_EMAIL || (recipients[0] || 'support@teamindprogram.com'),
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
      zipCode,
      success_url,
      cancel_url,
      language
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
      // Required keys for Meshulam Scenario
      name: resolvedName,
      fullName: resolvedName,
      price: resolvedAmount,
      phone: resolvedPhone,
      
      // Redirects
      success_url: success_url || "",
      cancel_url: cancel_url || "",
      language: language || "he",
      
      // Default keys
      orderId: String(orderId || '').trim(),
      amount: resolvedAmount,
      customerName: resolvedName,
      email: String(email || '').trim().toLowerCase(),
      productName: String(product_name || '').trim(),
      
      // Aliases
      order_id: String(orderId || '').trim(),
      customer_name: resolvedName,
      product_name: String(product_name || '').trim(),
      full_name: resolvedName,
      
      // Address
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

  // Memory cache for fast local idempotency
  const processedOrders = new Map<string, number>();
  const CACHE_TTL = 30000;

  // API Route: Order Notification
  app.post("/api/order-notification", async (req, res) => {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch (e) {}
    }

    const orderId = String(bodyData.orderId || bodyData.order_id || bodyData.transactionId || bodyData.transaction_id || '0000');
    const source = bodyData.source || 'server-unknown';

    // 1. FAST IN-MEMORY CHECK
    const now = Date.now();
    if (processedOrders.has(orderId) && (now - (processedOrders.get(orderId) || 0) < CACHE_TTL)) {
      console.log(`[OrderNotify] Order ${orderId} recently seen in memory. Skipping.`);
      return res.status(200).json({ success: true, message: "Duplicate (Memory)" });
    }

    // 2. ATOMIC DATABASE GATEKEEPER
    try {
      const lockRef = doc(db, 'notification_locks', orderId);
      const lockResult = await runTransaction(db, async (transaction) => {
        const lockDoc = await transaction.get(lockRef);
        if (lockDoc.exists()) {
          const data = lockDoc.data();
          if (data.sent) return { alreadySent: true };
          // If being processed and very recent (30s), treat as duplicate
          const lastTs = data.timestamp?.toMillis() || 0;
          if (Date.now() - lastTs < 30000) return { alreadySent: true };
        }
        transaction.set(lockRef, {
          orderId, source, sent: false, processing: true, timestamp: serverTimestamp()
        }, { merge: true });
        return { alreadySent: false };
      });

      if (lockResult.alreadySent) {
        console.log(`[OrderNotify] Order ${orderId} already sent or processing (Global Lock). Skipping.`);
        processedOrders.set(orderId, now);
        return res.status(200).json({ success: true, message: "Duplicate (Global Lock)" });
      }
      processedOrders.set(orderId, now);
    } catch (lockErr) {
      console.error("[OrderNotify] Lock failed:", lockErr);
      // Wait a bit to avoid race if Firestore is slow
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 800)));
    }

    const { 
      customerName = 'Customer', 
      customerEmail = '', 
      phone = '', 
      program = 'Pedagogical Kit', 
      amount = '0', 
      shippingAddress = null, 
      adminEmails, 
      adminEmail, 
      orderNotifications = 'both',
      language = 'he'
    } = bodyData || {};

    const recipients = await getRecipients(adminEmails, adminEmail, 'order');
    const normalizedCustomerEmail = customerEmail.toLowerCase().trim();
    
    // Explicitly separate recipients but don't block admins if they are also the customer
    const adminRecipients = recipients;

    console.log(`[OrderNotify] Processing ${orderId.startsWith('ORD-') ? '#' + orderId : '#ORD-' + orderId} | Admin Recips: ${adminRecipients.length} | Customer: ${normalizedCustomerEmail}`);

    if (orderNotifications === 'none') {
      return res.json({ success: true, message: "Notifications disabled" });
    }

    const emailTasks: Promise<any>[] = [];
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
    const orderDate = formatDateForEmail();
    const isHe = language === 'he';

    const adminHtml = `
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
      </div>
    `;

    // --- DECOUPLED LOGIC: ADMINS ---
    if ((orderNotifications === 'both' || orderNotifications === 'admin') && adminRecipients.length > 0) {
      // Send individual emails to each admin so they see themselves in the "To" field
      for (const recipient of adminRecipients) {
        emailTasks.push(resend.emails.send({
          from: `TEAMIND <${senderEmail}>`,
          to: recipient,
          replyTo: normalizedCustomerEmail || undefined,
          subject: `New Order #${orderId} - ${customerName}`,
          html: adminHtml
        }));
      }
    }

    // --- DECOUPLED LOGIC: CUSTOMER ---
    const shouldSendToCustomer = ['both', 'customer', 'sender'].includes(orderNotifications);
    if (shouldSendToCustomer && normalizedCustomerEmail.includes('@')) {
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
          <p>בברכה,<br/><strong>צוות TEAMIND</strong></p>
        </div>
      ` : `
        <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">Order Confirmation</h2>
          <p>Hi ${customerName},</p>
          <p>Thank you for your purchase! We've received your order for the <strong>${program}</strong>.</p>
          <div style="margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 15px;">
            <p><strong>Order ID:</strong> <span dir="ltr">#${orderId}</span></p>
            <p><strong>Amount Paid:</strong> ₪${amount}</p>
          </div>
          <p>Best regards,<br/><strong>The TEAMIND Team</strong></p>
        </div>
      `;

      emailTasks.push(resend.emails.send({
        from: `TEAMIND <${senderEmail}>`,
        to: [normalizedCustomerEmail],
        replyTo: adminRecipients[0] || senderEmail,
        subject: subject,
        html: html,
      }));
    }

    try {
      await Promise.allSettled(emailTasks);
      // 3. FINALIZE DATABASE GATEKEEPER
      const lockRef = doc(db, 'notification_locks', orderId);
      await setDoc(lockRef, { sent: true, sentAt: serverTimestamp() }, { merge: true });
      
      res.json({ success: true, message: "Emails processed successfully" });
    } catch (err: any) {
      console.error("[OrderNotify] Error in execution flow:", err);
      res.status(200).json({ success: false, error: err.message, note: "Handled to stop retry loops" });
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
