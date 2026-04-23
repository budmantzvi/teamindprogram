import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export const processOrderSuccess = async (orderId: string, siteConfig: any) => {
  if (!orderId || orderId === 'UNKNOWN') {
    console.warn("No Order ID found for processing.");
    return;
  }

  const sessionKey = `order_processed_${orderId}`;
  if (sessionStorage.getItem(sessionKey)) {
    console.log("Order already processed in this session.");
    return;
  }

  try {
    console.log("Processing order success for:", orderId);
    
    // 1. Find the pending order
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`Order ${orderId} not found in database.`);
      return;
    }

    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data();

    // 2. Update status to paid if not already
    if (orderData.status !== 'paid') {
      console.log("Updating order status to paid...");
      await updateDoc(doc(db, 'orders', orderDoc.id), {
        status: 'paid',
        paidAt: serverTimestamp()
      });
    }

    // 3. Send notification
    console.log("Triggering order notification API...");
    try {
      // Use selected admins if list is not empty, otherwise fallback to primary contact
      const selectedAdmins = siteConfig?.orderNotificationAdmins || [];
      const adminEmails = selectedAdmins.length > 0 
        ? selectedAdmins.filter(email => email && email.includes('@'))
        : [siteConfig?.contactEmail || 'teamind50@gmail.com'];

      const response = await fetch('/api/order-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          phone: orderData.phone,
          program: orderData.program,
          amount: orderData.amount,
          shippingAddress: orderData.shippingAddress,
          adminEmails: adminEmails,
          orderNotifications: siteConfig?.orderNotifications || 'both',
          language: localStorage.getItem('i18nextLng') || 'he'
        })
      });
      
      if (response.ok) {
        console.log("Notification API call successful.");
        sessionStorage.setItem(sessionKey, 'true');
      } else {
        const errData = await response.json();
        console.error("Notification API failed:", errData);
      }
    } catch (notifyErr) {
      console.error("Error calling notification API:", notifyErr);
    }
  } catch (err) {
    console.error("Error in processOrderSuccess:", err);
  }
};
