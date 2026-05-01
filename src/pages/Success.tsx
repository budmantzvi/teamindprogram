import React, { useEffect, useRef } from 'react';
import { Navbar, Footer } from '../components/Shared';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSite } from '../lib/SiteContext';
import { processOrderSuccess } from '../lib/orderUtils';
import { useTranslation } from 'react-i18next';

const SuccessPage = () => {
  const { siteConfig } = useSite();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isOnHebrewPath = /^\/he($|\/)/.test(location.pathname);
  const isHe = i18n.language === 'he';
  
  // Decide prefix based on both current path and detected language preference
  const prefix = (isOnHebrewPath || isHe) ? '/he' : '';
  const hasProcessed = useRef(false);

  // Try to get orderId from URL, then localStorage
  const orderIdFromUrl = searchParams.get('orderId') || searchParams.get('transaction_id');
  const orderIdFromStorage = localStorage.getItem('last_order_id');
  const orderId = orderIdFromUrl || orderIdFromStorage || 'UNKNOWN';

  // Immediate language check during first render if possible to avoid flash
  if (!hasProcessed.current && orderId !== 'UNKNOWN') {
    const cachedOrder = localStorage.getItem(`order_data_${orderId}`);
    if (cachedOrder) {
      try {
        const data = JSON.parse(cachedOrder);
        if (data.language && data.language !== i18n.language) {
          console.log(`[Success Render] Pre-switching language to ${data.language}`);
          i18n.changeLanguage(data.language);
        }
      } catch (e) {}
    }
  }

  // Immediate language check based on cache to avoid flash of English
  useEffect(() => {
    if (orderId !== 'UNKNOWN') {
      const cachedOrder = localStorage.getItem(`order_data_${orderId}`);
      if (cachedOrder) {
        try {
          const data = JSON.parse(cachedOrder);
          if (data.language) {
            const targetLanguage = data.language;
            const currentLanguage = i18n.language;
            
            if (targetLanguage !== currentLanguage) {
              i18n.changeLanguage(targetLanguage);
            }
            
            const targetIsHebrew = targetLanguage === 'he';
            if (targetIsHebrew && !isOnHebrewPath) {
              navigate(`/he/success?${searchParams.toString()}`, { replace: true });
            } else if (!targetIsHebrew && isOnHebrewPath) {
              navigate(`/success?${searchParams.toString()}`, { replace: true });
            }
          }
        } catch (e) {}
      }
    }
  }, [orderId, i18n.language, isOnHebrewPath, navigate, searchParams, i18n]);

  useEffect(() => {
    const processOrder = async () => {
      if (siteConfig && orderId !== 'UNKNOWN' && !hasProcessed.current) {
        hasProcessed.current = true;
        
        // We pass the current language context to the processor
        const orderData = await processOrderSuccess(orderId, siteConfig, i18n.language);
        
        // If order was in a different language, switch language AND path
        if (orderData && orderData.language) {
          const targetIsHebrew = orderData.language === 'he';
          
          if (targetIsHebrew && !isOnHebrewPath) {
            console.log("Redirecting to Hebrew success page based on order data");
            i18n.changeLanguage('he');
            navigate(`/he/success?${searchParams.toString()}`, { replace: true });
          } else if (!targetIsHebrew && isOnHebrewPath) {
            console.log("Redirecting to English success page based on order data");
            i18n.changeLanguage('en');
            navigate(`/success?${searchParams.toString()}`, { replace: true });
          } else if (orderData.language !== i18n.language) {
            // Path matches but i18n instance might be lagging
            i18n.changeLanguage(orderData.language);
          }
        }
      }
    };
    
    processOrder();
  }, [orderId, siteConfig, i18n.language, i18n, isOnHebrewPath, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 justify-center">
      <main className="flex-1 py-12 md:py-20 px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[64px] shadow-3xl overflow-hidden text-center p-12 md:p-20 border border-slate-100"
          >
            <div className="w-24 h-24 bg-teal-50 rounded-[32px] flex items-center justify-center text-teal-600 mx-auto mb-10 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <h1 className="text-[40px] md:text-6xl font-sans font-bold text-slate-900 mb-8 tracking-tighter leading-none">
              {t('success.title')} <br />
              <span className="text-teal-600 italic">{t('success.titlePurchase')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 font-medium mb-12 leading-relaxed">
              {t('success.message')}
            </p>
            
            <div className="bg-slate-50 rounded-[40px] p-10 mb-12 text-start space-y-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{t('success.orderId')}</span>
                <span className="font-mono font-bold text-slate-900 text-lg">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{t('success.status')}</span>
                <span className="px-5 py-2 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{t('success.paid')}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to={prefix || "/"} 
                className="btn-primary bg-teal-600 shadow-teal-600/20 active:scale-95"
              >
                <Home className="w-6 h-6 shrink-0" />
                {t('success.backHome')}
              </Link>
              <Link 
                to={`${prefix}/#program`} 
                className="px-10 py-5 bg-white border border-slate-200 text-slate-600 font-bold rounded-full text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
              >
                <ShoppingBag className="w-6 h-6 shrink-0" />
                {t('success.otherKits')}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SuccessPage;
