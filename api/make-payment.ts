export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, customer_name, email, phone, product_name, shipping_address } = req.body;

  const payload = {
    amount,
    customer_name,
    email,
    phone,
    product_name,
    city: shipping_address?.city || '',
    street: shipping_address?.street || '',
    houseNumber: shipping_address?.houseNumber || '',
    apartment: shipping_address?.apartment || '',
    zipCode: shipping_address?.zipCode || '',
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
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (text === "Accepted") {
        throw new Error("מייק (Make.com) החזיר 'Accepted' במקום כתובת תשלום. ודא שהוספת מודול 'Webhook Response' בסוף התרחיש במייק שמחזיר JSON עם ה-URL.");
      }
      throw new Error(`תגובה לא תקינה ממייק: ${text}`);
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
