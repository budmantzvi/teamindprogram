import React, { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { useSite } from '../lib/SiteContext';

interface MakePaymentButtonProps {
// ... existing interface ...
  amount: number;
  customerName: string;
  email: string;
  phone: string;
  productName: string;
  shippingAddress?: {
    city: string;
    street: string;
    houseNumber: string;
    apartment: string;
    zipCode: string;
  };
  className?: string;
  buttonText?: string;
  disabled?: boolean;
}

export const MakePaymentButton: React.FC<MakePaymentButtonProps> = ({ 
  amount, 
  customerName, 
  email, 
  phone,
  productName,
  shippingAddress,
  className = "",
  buttonText = "Pay Now",
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t, i18n } = useTranslation();
  const { siteConfig } = useSite();

  const handlePayment = async () => {
    if (disabled) return;
    if (!navigator.onLine) {
      return toast.error(t('footer.unavailable'));
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountValue = Number(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Invalid payment amount. Please refresh the page and try again.");
      }

      // Geolocation check
      try {
        console.log("Starting geolocation check...");
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        if (geoData.country_code && geoData.country_code !== 'IL') {
          toast.error(t('footer.unavailable'));
          setIsLoading(false);
          return;
        }
      } catch (geoErr) {
        console.warn("Geo check failed, proceeding with caution:", geoErr);
      }

      // 1. Generate a unique Order ID
      const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('last_order_id', orderId);
      
      let sanitizedPhone = phone.replace(/\D/g, '');
      if (sanitizedPhone.startsWith('972')) {
        sanitizedPhone = '0' + sanitizedPhone.slice(3);
      }

      // Pre-save order data for fallback notification
      const orderBackup = {
        orderId,
        customerName: customerName,
        customerEmail: email,
        phone: sanitizedPhone,
        shippingAddress: shippingAddress,
        program: productName,
        amount: Number(amount),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`order_data_${orderId}`, JSON.stringify(orderBackup));
      
      // 2. Save order to Firestore as PENDING before payment
      try {
        await addDoc(collection(db, 'orders'), {
          orderId,
          customerName: customerName,
          customerEmail: email,
          phone: sanitizedPhone,
          shippingAddress: shippingAddress,
          program: productName,
          amount: Number(amount),
          status: 'pending', // Will be updated to 'paid' on success page
          createdAt: serverTimestamp()
        });
      } catch (dbErr: any) {
        console.error("Critical Firestore Error during payment:", dbErr);
        
        // Check for ad-blocker or network issues
        const isBlocked = dbErr.message?.includes('network-error') || 
                          dbErr.message?.includes('failed to fetch') ||
                          dbErr.message?.includes('blocked-by-client') ||
                          !navigator.onLine;

        if (isBlocked) {
          throw new Error(t('footer.adBlockerError'));
        }

        if (dbErr.code === 'resource-exhausted' || (dbErr.message && dbErr.message.includes('Quota exceeded'))) {
          throw new Error("מכסת מסד הנתונים היומית הסתיימה. האתר יחזור לפעילות מלאה מחר. (Firestore Quota Exceeded)");
        }
        
        throw new Error(`${t('footer.unavailable')} (Error: ${dbErr.code || 'unknown'})`);
      }

      // 3. Call Make.com with the Order ID
      const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('ais-dev');
      const baseUrl = isProduction ? 'https://teamindprogram.com' : window.location.origin;
      const successUrl = `${baseUrl}/success?orderId=${orderId}`;
      const cancelUrl = `${baseUrl}/checkout`;

      // Get admin emails from siteConfig
      const emailNotifications = siteConfig?.orderNotifications || siteConfig?.emailNotifications || 'both';
      const selectedAdmins = siteConfig?.orderNotificationAdmins || [];
      const allAdmins = siteConfig?.allAdmins || [];
      const primaryEmail = siteConfig?.contactEmail;
      
      let targetAdminEmails: string[] = [];
      if (selectedAdmins.length > 0) {
        targetAdminEmails = selectedAdmins.filter((email: string) => email && email.includes('@'));
      } else if (allAdmins.length > 0) {
        targetAdminEmails = allAdmins.filter((email: string) => email && email.includes('@'));
      } 
      if (primaryEmail && primaryEmail.includes('@')) {
        const splitEmails = primaryEmail.split(',').map((s: string) => s.trim()).filter((e: string) => e.includes('@'));
        targetAdminEmails = Array.from(new Set([...targetAdminEmails, ...splitEmails]));
      }

      // Uniqueness
      targetAdminEmails = Array.from(new Set(
        targetAdminEmails.map(e => e.toLowerCase().trim()).filter(e => e && e.includes('@'))
      ));

      // Ultimate fallback
      if (targetAdminEmails.length === 0) {
        targetAdminEmails.push('teamind50@gmail.com');
      }

      const payload = {
        orderId,
        amount: Number(amount),
        customer_name: customerName,
        email,
        phone: sanitizedPhone,
        product_name: productName,
        name: customerName,
        fullName: customerName,
        price: Number(amount),
        city: shippingAddress?.city || '',
        street: shippingAddress?.street || '',
        houseNumber: shippingAddress?.houseNumber || '',
        apartment: shippingAddress?.apartment || '',
        zipCode: shippingAddress?.zipCode || '',
        success_url: successUrl,
        cancel_url: cancelUrl,
        adminEmails: targetAdminEmails,
        emailNotifications: emailNotifications,
        language: i18n.language
      };

      const response = await fetch('/api/make-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment server error. Please try again later.");
      }

      if (data.url) {
        // Redirect the user to the URL returned by Make.com
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to get payment URL');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const isA = window.location.pathname === '/teamind-secure-portal-2024-v2';
      const msg = isA ? (err.message || 'Something went wrong') : t('footer.unavailable');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={handlePayment}
        disabled={isLoading || disabled}
        className={`flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        {isLoading ? (i18n.language === 'he' ? 'מעבד...' : 'Processing...') : buttonText}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium text-center">{error}</p>
      )}
      
      {(isLoading || disabled) && !isLoading && (
        <p className="mt-2 text-xs text-slate-500 text-center">{t('footer.fillAllFields')}</p>
      )}
    </div>
  );
};
