import React, { useEffect, useRef } from 'react';
import { Navbar, Footer } from '../components/Shared';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../lib/SiteContext';
import { processOrderSuccess } from '../lib/orderUtils';
import { useTranslation } from 'react-i18next';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { siteConfig } = useSite();
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';
  const prefix = isHe ? '/he' : '';
  const hasProcessed = useRef(false);

  // Try to get orderId from URL, then localStorage
  const orderIdFromUrl = searchParams.get('orderId') || searchParams.get('transaction_id');
  const orderIdFromStorage = localStorage.getItem('last_order_id');
  const orderId = orderIdFromUrl || orderIdFromStorage || 'UNKNOWN';

  useEffect(() => {
    if (siteConfig && orderId !== 'UNKNOWN' && !hasProcessed.current) {
      hasProcessed.current = true;
      processOrderSuccess(orderId, siteConfig, i18n.language);
    }
  }, [orderId, siteConfig, i18n.language]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[48px] shadow-2xl overflow-hidden text-center p-12 md:p-20 border border-slate-100"
          >
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
              {t('success.title')} <span className="text-teal-600 italic">{t('success.titlePurchase')}</span>
            </h1>
            
            <p className="text-xl text-slate-600 font-medium mb-12 leading-relaxed">
              {t('success.message')}
            </p>
            
            <div className="bg-slate-50 rounded-3xl p-8 mb-12 text-start space-y-4 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('success.orderId')}</span>
                <span className="font-mono font-bold text-slate-900">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('success.status')}</span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-black">{t('success.paid')}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={prefix || "/"} 
                className="px-10 py-5 bg-teal-600 text-white font-bold rounded-full text-lg hover:bg-teal-700 transition-all hover:scale-105 shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5 shrink-0" />
                {t('success.backHome')}
              </Link>
              <Link 
                to={`${prefix}/#program`} 
                className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-full text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 shrink-0" />
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
