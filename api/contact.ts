import { Resend } from "resend";

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

async function getRecipients(adminInput: any) {
  let emailSources: string[] = [];
  
  console.log("[Vercel] Starting recipient resolution for contact...");

  // 1. Fetch the Master Config from Firestore (config/site)
  try {
    const configSnap = await getDoc(doc(db, 'config', 'site'));
    if (configSnap.exists()) {
      const configData = configSnap.data();
      
      // Specifically look for notification admins for contacts
      const contactAdmins = configData.notificationAdmins;
      if (Array.isArray(contactAdmins) && contactAdmins.length > 0) {
        console.log(`[Vercel] Found ${contactAdmins.length} admins in config/site contact list`);
        emailSources.push(...contactAdmins);
      } else {
        console.log("[Vercel] No notificationAdmins found. Falling back to secondary lists.");
        // Fallback sequence: General List -> Order List -> All Admins
        if (Array.isArray(configData.orderNotificationAdmins)) {
           emailSources.push(...configData.orderNotificationAdmins);
        }
        if (Array.isArray(configData.allAdmins)) {
          emailSources.push(...configData.allAdmins);
        }
      }
      
      // Always include contactEmail as master fallback
      if (configData.contactEmail) {
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

  // 6. Hard safety check
  if (finalRecipients.length === 0) {
    console.log("[Vercel] No recipients resolved. Using hard fallback.");
    finalRecipients.push('teamind50@gmail.com');
  }

  console.log(`[Vercel] Final Resolved Recipients: ${finalRecipients.join(', ')}`);
  return finalRecipients;
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

  const recipients = await getRecipients(adminInput);
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
    // 1. Email to Team (BCC for efficiency)
    if ((notificationSetting === 'both' || notificationSetting === 'admin') && recipients.length > 0) {
      const primaryAdmin = recipients[0];
      const otherAdmins = recipients.slice(1);
      
      console.log(`[Vercel Contact] Sending admin notification to ${primaryAdmin} (BCC: ${otherAdmins.length} others)`);
      
      const { data, error } = await resend.emails.send({
        from: 'TEAMIND Contact <support@teamindprogram.com>',
        to: [primaryAdmin],
        bcc: otherAdmins.length > 0 ? otherAdmins : undefined,
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
              ${(message || '').replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      });

      if (error) {
        console.error(`[Vercel Contact] Resend error for admin:`, error);
        results.admin.error = error;
      } else {
        results.admin.success = true;
        results.admin.data = data;
      }
    }

    // 2. Email to Client
    const shouldSendToClient = notificationSetting === 'both' || notificationSetting === 'sender';

    if (shouldSendToClient) {
      console.log(`[Vercel Contact] Sending client confirmation to: ${email}`);
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
        from: 'TEAMIND <support@teamindprogram.com>',
        to: [email],
        replyTo: process.env.CONTACT_EMAIL || (recipients[0] || 'support@teamindprogram.com'),
        subject: subject,
        html: html,
      });
      
      if (error) {
        console.error("[Vercel Contact] Resend error (client):", error);
        results.client.error = error;
      } else {
        results.client.success = true;
        results.client.data = data;
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
