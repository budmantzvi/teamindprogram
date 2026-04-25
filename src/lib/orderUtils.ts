import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export const processOrderSuccess = async (orderId: string, siteConfig: any, language: string = 'he') => {
  let orderData: any = null;
  if (!orderId || orderId === 'UNKNOWN') {
    console.warn("No Order ID found for processing.");
    return;
  }

  const sessionKey = `order_processed_${orderId}`;
  const alreadyProcessed = sessionStorage.getItem(sessionKey);
  
  if (alreadyProcessed === 'true') {
    console.log("Order already fully processed in this session.");
    // Try to get cached data for language detection if needed
    const cachedOrder = localStorage.getItem(`order_data_${orderId}`);
    if (cachedOrder) {
      try { return JSON.parse(cachedOrder); } catch (e) {}
    }
    // Try to fetch from Firestore if not in cache (less common since success page processes it first)
    try {
      const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
    } catch (e) {}
    return null;
  }

  try {
    console.log("Processing order success for:", orderId);
    
    // 1. Get cached order details from localStorage (Fallback if Firestore is down)
    const cachedOrder = localStorage.getItem(`order_data_${orderId}`);
    if (cachedOrder) {
      try {
        orderData = JSON.parse(cachedOrder);
        console.log("Found cached order data in localStorage:", orderData);
      } catch (e) {
        console.error("Failed to parse cached order data");
      }
    }

    // 2. Try to find the order in Firestore
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const dbData = orderDoc.data();
        // Merge or use DB data as priority
        orderData = { ...orderData, ...dbData };

        // Update status to paid if not already
        if (dbData.status !== 'paid') {
          console.log("Updating order status to paid in Firestore...");
          await updateDoc(doc(db, 'orders', orderDoc.id), {
            status: 'paid',
            paidAt: serverTimestamp()
          });
        }
      } else {
        console.warn(`Order ${orderId} not found in Firestore. Using cache.`);
      }
    } catch (dbErr) {
      console.warn("Firestore error during order processing (likely quota):", dbErr);
      // If we have cached data, we can still proceed with the notification
    }

    if (!orderData) {
      console.error("No order data available (Firestore & Cache both empty). Cannot send notification.");
      return;
    }

    // 3. Send notification
    console.log("Triggering order notification API with data:", orderData);
    
    // Set session guard EARLY to prevent duplicate triggers from the same window
    sessionStorage.setItem(sessionKey, 'processing');
    
    try {
      // Use selected admins if list is not empty, otherwise fallback to all known admins or the primary contact
      const selectedAdmins = siteConfig?.orderNotificationAdmins || [];
      const allAdmins = siteConfig?.allAdmins || [];
      
      let adminEmails: string[] = [];
      
      if (selectedAdmins.length > 0) {
        // Use specifically selected admins for orders
        adminEmails = selectedAdmins.filter((email: string) => email && email.includes('@'));
      } else if (siteConfig?.contactEmail) {
        // Fallback to primary contact
        adminEmails = siteConfig.contactEmail.split(',').map((s: string) => s.trim()).filter((e: string) => e.includes('@'));
      } else if (allAdmins.length > 0) {
        // Last resort
        adminEmails = allAdmins.filter((email: string) => email && email.includes('@'));
      }
      
      // Ensure uniqueness
      adminEmails = Array.from(new Set(
        adminEmails
          .map(e => e.toLowerCase().trim())
          .filter(e => e && e.includes('@'))
      ));

      console.log("Final Admin Recipients for API:", adminEmails);

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
          language: orderData.language || language,
          source: 'client'
        })
      });
      
      if (response.ok) {
        console.log("Notification API call successful.");
        sessionStorage.setItem(sessionKey, 'true');
        // Clean up cache
        localStorage.removeItem(`order_data_${orderId}`);
      } else {
        const errData = await response.json();
        console.error("Notification API failed:", errData);
        // If it's not a duplicate, we might want to allow retry later? 
        // But for duplicates, we don't remove the 'processing' flag.
        if (errData.message === "Duplicate (Memory)" || errData.message === "Duplicate (Global Lock)") {
          sessionStorage.setItem(sessionKey, 'true');
        } else {
          // On other errors, maybe allow retry?
          sessionStorage.removeItem(sessionKey);
        }
      }
    } catch (notifyErr) {
      console.error("Error calling notification API:", notifyErr);
    }
  } catch (err) {
    console.error("Error in processOrderSuccess:", err);
  }
  
  return orderData;
};
