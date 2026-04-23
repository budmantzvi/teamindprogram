import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, customerName, customerEmail, phone, program, amount, shippingAddress, adminEmail, orderNotifications = 'both' } = req.body;

  if (orderNotifications === 'none') {
    return res.status(200).json({ success: true, message: "Order notifications disabled" });
  }

  const recipient = adminEmail || process.env.CONTACT_EMAIL || 'teamind50@gmail.com';

  try {
    let adminResult = null;
    let clientResult = null;

    // 1. Email to Admin
    if (orderNotifications === 'both' || orderNotifications === 'admin') {
      console.log(`Attempting to send admin email to: ${recipient}`);
      const { data, error } = await resend.emails.send({
        from: 'TEAMIND Orders <support@teamindprogram.com>',
        to: [recipient],
        subject: `New Order #${orderId} - ${customerName}`,
        html: `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">New Order Received!</h2>
            
            <div style="margin: 20px 0;">
              <p style="font-size: 18px;"><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Program:</strong> ${program}</p>
              <p><strong>Amount:</strong> ₪${amount}</p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #334155;">Customer Details</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div style="background: #f0fdfa; padding: 20px; border-radius: 15px; border: 1px solid #ccfbf1;">
              <h3 style="margin-top: 0; color: #0f766e;">Shipping Address</h3>
              <p style="margin-bottom: 0;">
                ${shippingAddress.street} ${shippingAddress.houseNumber}<br/>
                ${shippingAddress.apartment ? `דירה ${shippingAddress.apartment}<br/>` : ''}
                ${shippingAddress.city}<br/>
                ${shippingAddress.zipCode ? `מיקוד: ${shippingAddress.zipCode}` : ''}
              </p>
            </div>

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
        console.error("Resend error (admin):", error);
      } else {
        console.log("Admin email sent successfully:", data);
      }
      adminResult = data;
    }

    // 2. Email to Client
    if (orderNotifications === 'both' || orderNotifications === 'sender' || orderNotifications === 'customer') {
      console.log(`Attempting to send client email to: ${customerEmail}`);
      const { data, error } = await resend.emails.send({
        from: 'TEAMIND <support@teamindprogram.com>',
        to: [customerEmail],
        subject: `Order Confirmation #${orderId} - TEAMIND`,
        html: `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">Order Confirmation</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for your purchase! We've received your order for the <strong>${program}</strong>.</p>
            
            <div style="margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 15px;">
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Amount Paid:</strong> ₪${amount}</p>
            </div>

            <p>We are preparing your kit for shipment. You will receive another email once it's on its way.</p>
            
            <p>If you have any questions, feel free to reply to this email.</p>
            
            <p>Best regards,<br/><strong>The TEAMIND Team</strong></p>
          </div>
        `,
      });
      if (error) {
        console.error("Resend error (client):", error);
      } else {
        console.log("Client email sent successfully:", data);
      }
      clientResult = data;
    }

    return res.status(200).json({ success: true, adminResult, clientResult });
  } catch (err: any) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
