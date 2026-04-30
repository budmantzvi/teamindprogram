import { Resend } from "resend";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, runTransaction, serverTimestamp, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
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

async function getRecipients(adminInput: any) {
  let emailSources: string[] = [];
  
  console.log("[Vercel] Starting recipient resolution for order...");

  // 1. Fetch the Master Config from Firestore (config/site)
  try {
    const configSnap = await getDoc(doc(db, 'config', 'site'));
    if (configSnap.exists()) {
      const configData = configSnap.data();
      
      // Hierarchy of resolution:
      // 1. Specific List
      const orderAdmins = configData.orderNotificationAdmins;
      if (Array.isArray(orderAdmins) && orderAdmins.length > 0) {
        console.log(`[Vercel] Found ${orderAdmins.length} admins in config/site order list`);
        emailSources.push(...orderAdmins);
      } 
      
      // 2. Try General List if still empty
      if (emailSources.length === 0) {
        const generalAdmins = configData.notificationAdmins;
        if (Array.isArray(generalAdmins) && generalAdmins.length > 0) {
          console.log("[Vercel] No orderNotificationAdmins. Falling back to notificationAdmins.");
          emailSources.push(...generalAdmins);
        }
      }
      
      // 3. Try All Admins if still empty
      if (emailSources.length === 0) {
        const allAdmins = configData.allAdmins;
        if (Array.isArray(allAdmins) && allAdmins.length > 0) {
          console.log("[Vercel] Falling back to allAdmins list.");
          emailSources.push(...allAdmins);
        }
      }
      
      // 4. Try Contact Email if still empty
      if (emailSources.length === 0 && configData.contactEmail) {
        console.log("[Vercel] Falling back to contactEmail field.");
        emailSources.push(...configData.contactEmail.split(',').map((s: string) => s.trim()));
      }
    }
  } catch (err) {
    console.error("[Vercel] Failed to fetch site config/site:", err);
  }

  // 2. Fetch specific admin users from 'admins' collection (backup) - ONLY if nothing found yet
  if (emailSources.length === 0) {
    try {
      const adminSnap = await getDocs(collection(db, 'admins'));
      adminSnap.forEach(docSnap => {
        const email = docSnap.id.trim().toLowerCase();
        if (email.includes('@')) {
          emailSources.push(email);
        }
      });
      console.log(`[Vercel] Total emails in admins collection: ${adminSnap.size}`);
    } catch (err) {
      console.error("[Vercel] Failed to fetch admins collection (Permissions?):", err);
    }
  }

  // 3. Add input from Admin/Frontend if provided
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

  // 5. Filter and deduplicate
  let finalRecipients = Array.from(new Set(
    emailSources
      .filter(e => e && typeof e === 'string' && e.includes('@'))
      .map(e => e.toLowerCase().trim())
  ));

  // 6. Hard safety check - ensure teamind50 is there if nothing else worked
  if (finalRecipients.length === 0) {
    console.log("[Vercel] No recipients resolved. Using hard fallback.");
    finalRecipients.push('teamind50@gmail.com');
  }

  console.log(`[Vercel] Final Resolved Recipients: ${finalRecipients.join(', ')}`);
  return finalRecipients;
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
  const rawAdmins = await getRecipients(adminInput);
  const normalizedCustomerEmail = customerEmail.toLowerCase().trim();
  const isHe = language === 'he';
  
  // 1. Ensure admins are unique
  const adminEmails = Array.from(new Set(
    rawAdmins
      .map(r => r.toLowerCase().trim())
      .filter(r => r && r.includes('@'))
  ));
  
  console.log(`[Vercel] Notifying ${orderId.startsWith('ORD-') ? '#' + orderId : '#ORD-' + orderId} | Admins: [${adminEmails.join(', ')}] | Customer: ${normalizedCustomerEmail}`);

  try {
    const orderDate = formatDateForEmail();
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'support@teamindprogram.com';
    const emailTasks: Promise<any>[] = [];

    const adminHtml = `
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
    `;

    const getFriendlyName = (email: string) => {
      const low = email.toLowerCase();
      if (low.includes('budmantzvi')) return 'Tzvi (Admin)';
      if (low.includes('zbibdmn')) return 'Zvi (Admin)';
      return 'Admin';
    };

    // 1. Send INDIVIDUAL Emails to all Admins (Avoid BCC to ensure correct "To" header)
    if ((orderNotifications === 'both' || orderNotifications === 'admin') && adminEmails.length > 0) {
      for (const recipient of adminEmails) {
        const friendlyName = getFriendlyName(recipient);
        const toField = `${friendlyName} <${recipient}>`;
        
        emailTasks.push(
          resend.emails.send({
            from: `TEAMIND <${senderEmail}>`,
            to: [toField],
            replyTo: normalizedCustomerEmail || undefined,
            subject: `NEW ORDER #${orderId} - ${customerName}`,
            html: `
              ${adminHtml}
              <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                Notification sent specifically to: ${recipient}
              </div>
            `,
          })
        );
      }
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
