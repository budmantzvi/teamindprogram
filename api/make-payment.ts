export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, amount, customer_name, email, phone, product_name, shipping_address } = req.body;

  // Resolve values for Meshulam/Grow scenario
  const resolvedName = (customer_name || req.body.name || req.body.fullName || "").toString().trim();
  const resolvedAmount = Number(amount || req.body.price || 0);
  const resolvedPhone = (phone || req.body.phone || "").toString().trim();

  const payload = {
    // Required keys for Meshulam Scenario in Make.com
    name: resolvedName,
    fullName: resolvedName,
    price: resolvedAmount,
    phone: resolvedPhone,
    
    // Original app keys
    orderId: orderId || req.body.orderId || '',
    amount: resolvedAmount,
    customer_name: resolvedName,
    email: email || '',
    product_name: product_name || '',
    
    // Address fields
    city: shipping_address?.city || req.body.city || '',
    street: shipping_address?.street || req.body.street || '',
    houseNumber: shipping_address?.houseNumber || req.body.houseNumber || '',
    apartment: shipping_address?.apartment || req.body.apartment || '',
    zipCode: shipping_address?.zipCode || req.body.zipCode || '',
    success_url: req.body.success_url || '',
    cancel_url: req.body.cancel_url || '',
    adminEmails: req.body.adminEmails || [],
    emailNotifications: req.body.emailNotifications || 'both',
    language: req.body.language || 'he',
    
    timestamp: new Date().toISOString()
  };

  console.log("Sending payload to Make.com:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(process.env.MAKE_PAYMENT_WEBHOOK_URL || "https://hook.eu2.make.com/uv77f5twm7j9koihwb82ppp4vo83iamp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Make.com returned status ${response.status}`);
    }

    const text = await response.text();
    
    // Check if the response is "Accepted" (Standard Make.com response if no Webhook Response module is used)
    if (text === "Accepted" || response.status === 202) {
      console.log("Make.com accepted the request but didn't return a JSON body. This usually means the Webhook Response module is missing.");
      // If we don't have a URL, we can't redirect, but we must return 200 to block retries
      return res.status(200).json({ 
        success: true, 
        message: "Request accepted by Make.com. Redirect to success page might be manual if no URL was provided.",
        url: req.body.success_url // Fallback to success URL if provided
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`Invalid response from Make: ${text}`);
      // Return 200 even on parse error to stop retries
      return res.status(200).json({ 
        success: false, 
        error: "Invalid response from background process",
        url: req.body.success_url 
      });
    }
    
    if (data && data.url) {
      return res.status(200).json({ url: data.url });
    } else {
      return res.status(400).json({ error: "לא התקבלה כתובת תשלום ממייק. ודא שהתרחיש מחזיר אובייקט JSON עם שדה בשם url." });
    }
  } catch (err: any) {
    console.error("Make.com Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
