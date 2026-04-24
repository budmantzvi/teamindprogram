import { Resend } from "resend";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config safely
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase for the API
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const resend = new Resend(process.env.RESEND_API_KEY);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Keep in-memory cache as a first-line fast check (for the same instance)
const processedOrders = new Map<string, number>();
const CACHE_TTL = 30000; // 30 seconds

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

  // 3. Final safety net (Removed emergency hardcoded fallback)
  return [];
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

  // Handle various body formats
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      console.error("[Vercel OrderNotify] Failed to parse string body:", e);
    }
  }

  const orderId = String(body.orderId || body.order_id || body.transactionId || body.transaction_id || '0000');
  const source = body.source || 'unknown';
  
  // -- ATOMIC IDEMPOTENCY CHECK --
  const now = Date.now();
  if (processedOrders.has(orderId) && (now - (processedOrders.get(orderId) || 0) < CACHE_TTL)) {
    console.log(`[Vercel] Order ${orderId} recently seen in memory. Skipping.`);
    return res.status(200).json({ success: true, message: "Duplicate (Memory)" });
  }

  try {
    const lockRef = doc(db, 'notification_locks', orderId);
    
    const lockResult = await runTransaction(db, async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
      
      if (lockDoc.exists()) {
        const data = lockDoc.data();
        if (data.sent) {
          return { alreadySent: true };
        }
        // If it's being processed and it's very recent (last 30s), treat as duplicate
        const timestamp = data.timestamp?.toMillis() || 0;
        if (Date.now() - timestamp < 30000) {
          return { alreadySent: true, processing: true };
        }
      }
      
      // Intent to send
      transaction.set(lockRef, {
        orderId,
        source: source,
        timestamp: serverTimestamp(),
        sent: false,
        processing: true
      });
      
      return { alreadySent: false };
    });

    if (lockResult.alreadySent) {
       console.log(`[Vercel] Order ${orderId} already sent or processing (Global Lock). skipping.`);
       processedOrders.set(orderId, now);
       return res.status(200).json({ success: true, message: "Duplicate (Global Lock)" });
    }

    processedOrders.set(orderId, now);
  } catch (lockErr) {
    console.error("[Vercel] Firestore transaction lock failed:", lockErr);
    // If lock fails, we add a random delay to reduce race condition risk
    await sleep(Math.floor(Math.random() * 800));
  }

  // Clean up old entries periodically
  if (processedOrders.size > 100) {
    for (const [id, time] of processedOrders.entries()) {
      if (now - time > CACHE_TTL * 2) processedOrders.delete(id);
    }
  }

  const customerName = body.customerName || body.customer_name || body.name || body.fullName || 'Customer';
  const customerEmail = body.customerEmail || body.email || body.customer_email || body.user_email || '';
  const phone = body.phone || body.customerPhone || body.customer_phone || '';
  const program = body.program || body.item_name || body.productName || body.product_name || body.kit_type || 'Pedagogical Kit';
  const amount = body.amount || body.price || body.total_amount || body.total || '0';
  const shippingAddress = body.shippingAddress || body.address || null;
  const adminInput = body.adminEmails || body.adminEmail || body.admins || null;
  const orderNotifications = body.orderNotifications || body.notifications || body.emailNotifications || 'both';
  const language = body.language || 'he';

  console.log(`[Vercel] Processing #${orderId} for ${customerName}`);

  if (orderNotifications === 'none') {
    return res.status(200).json({ success: true, message: "Order notifications disabled" });
  }

  // -- SEPARATED NOTIFICATIONS --
  const rawAdmins = getRecipients(adminInput);
  const normalizedCustomerEmail = customerEmail.toLowerCase().trim();
  const isHe = language === 'he';
  
  // 1. Ensure admins are unique and DO NOT include the customer (they get a separate email)
  const adminEmails = Array.from(new Set(
    rawAdmins
      .map(r => r.toLowerCase().trim())
      .filter(r => r && r.includes('@') && r !== normalizedCustomerEmail)
  ));
  
  console.log(`[Vercel] Notifying #ORD-${orderId} | Admins: [${adminEmails.join(', ')}] | Customer: ${normalizedCustomerEmail}`);

  try {
    const orderDate = formatDateForEmail();
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
    const emailTasks: Promise<any>[] = [];

    // 1. Send ONE Email to all Admins (using BCC for privacy and efficiency)
    if ((orderNotifications === 'both' || orderNotifications === 'admin') && adminEmails.length > 0) {
      const primaryAdmin = adminEmails[0];
      const otherAdmins = adminEmails.slice(1);
      
      emailTasks.push(
        resend.emails.send({
          from: `TEAMIND <${senderEmail}>`,
          to: [primaryAdmin],
          bcc: otherAdmins.length > 0 ? otherAdmins : undefined,
          replyTo: normalizedCustomerEmail || undefined,
          subject: `New Order #${orderId} - ${customerName}`,
          html: `
            <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto; direction: ltr;">
              <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">New Order Received!</h2>
              <div style="margin: 20px 0;">
                <p style="font-size: 16px;"><strong>Date:</strong> ${orderDate}</p>
                <p style="font-size: 16px;"><strong>Order ID:</strong> <span dir="ltr">#${orderId}</span></p>
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
                  ${shippingAddress.apartment ? `Apartment ${shippingAddress.apartment}<br/>` : ''}
                  ${shippingAddress.city || ''}<br/>
                  ${shippingAddress.zipCode ? `ZIP: ${shippingAddress.zipCode}` : ''}
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
    }

    // 2. Send Separate Personalized Email to Customer
    const shouldSendToCustomer = orderNotifications === 'both' || orderNotifications === 'sender' || orderNotifications === 'customer';
    if (shouldSendToCustomer && normalizedCustomerEmail && normalizedCustomerEmail.includes('@')) {
      console.log(`[Vercel] Sending separate customer confirmation to ${normalizedCustomerEmail}`);
      
      const subject = isHe ? `TEAMIND - אישור הזמנה #${orderId}` : `Order Confirmation #${orderId} - TEAMIND`;
      const html = isHe ? `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto; direction: rtl; text-align: right;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">אישור הזמנה</h2>
            <p>שלום ${customerName},</p>
            <p>תודה על הרכישה! קיבלנו את הזמנתך עבור <strong>${program}</strong>.</p>
            <div style="margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 15px;">
              <p><strong>מספר הזמנה:</strong> <span dir="ltr">#${orderId}</span></p>
              <p><strong>סכום:</strong> ₪${amount}</p>
            </div>
            <p>אנו מכינים את הערכה שלך למשלוח. תקבל/י הודעת דוא"ל נוספת ברגע שהיא תצא לדרך.</p>
            <p>בברכה,<br/><strong>צוות TEAMIND</strong></p>
          </div>
      ` : `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto; direction: ltr;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px;">Order Confirmation</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for your purchase! We've received your order for the <strong>${program}</strong>.</p>
            <div style="margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 15px;">
              <p><strong>Order ID:</strong> <span dir="ltr">#${orderId}</span></p>
              <p><strong>Amount:</strong> ₪${amount}</p>
            </div>
            <p>We are preparing your kit for shipment. You will receive another email once it's on its way.</p>
            <p>Best regards,<br/><strong>The TEAMIND Team</strong></p>
          </div>
      `;

      emailTasks.push(
        resend.emails.send({
          from: `TEAMIND <${senderEmail}>`,
          to: [normalizedCustomerEmail],
          replyTo: adminEmails[0] || (process.env.CONTACT_EMAIL ? process.env.CONTACT_EMAIL.split(',')[0] : undefined),
          subject: subject,
          html: html,
        })
      );
    }

    // Process all emails concurrently
    // We await to ensure delivery on Vercel before the function freezes
    const results = await Promise.allSettled(emailTasks);
    const failed = results.filter(r => r.status === 'rejected');
    
    // Finalize the lock - Mark as sent
    try {
      const lockRef = doc(db, 'notification_locks', orderId);
      await setDoc(lockRef, { sent: true, sentAt: serverTimestamp() }, { merge: true });
    } catch (finalizeErr) {
      console.error("[Vercel] Failed to finalize notification lock:", finalizeErr);
    }
    
    if (failed.length > 0) {
      console.error(`[Vercel] Some emails failed to send:`, failed);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Emails processed", 
      failedCount: failed.length 
    });

  } catch (err: any) {
    console.error("[Vercel OrderNotify] Fatal error inside handler:", err);
    return res.status(200).json({ 
      success: false, 
      error: err.message, 
      note: "Fatal error handled. Prevented retry loop." 
    });
  }
}
