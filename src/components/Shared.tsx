import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Loader2, Phone, Mail, MapPin, MessageCircle, ChevronDown, CheckCircle2, Brain, Youtube,
  Zap, Heart, Sparkles, ArrowRight
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { db } from '../lib/firebase';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { useSite } from '../lib/SiteContext';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';

export const SEO = ({ title, description, image, url, keywords }: { title?: string, description?: string, image?: string, url?: string, keywords?: string }) => {
  const location = useLocation();
  const isHe = /^\/he($|\/)/.test(location.pathname);
  const { t, i18n } = useTranslation();
  const prefix = isHe ? '/he' : '';
  const { t_config } = useSite();
  const siteTitle = i18n.language === 'he' 
    ? "TEAMIND | טימיינד - פיתוח פונקציות ניהוליות וכישורי למידה לילדים" 
    : "TEAMIND | Thinking, Emotions, Attention & Motivation IN Development";
  const siteDescription = i18n.language === 'he'
    ? "טימיינד (TEAMIND) היא תוכנית מבוססת דמויות המפתחת פונקציות ניהוליות אצל ילדים דרך מוסיקה, משחק וחיבור רגשי (SEL). פתרון פדגוגי מוביל לגני ילדים, בתי ספר והורים."
    : "TEAMIND is a revolutionary character-based program designed to strengthen executive functions in children through music, play, and emotional connection.";
  const siteUrl = "https://teamindprogram.com";
  const siteImage = "https://teamindprogram.com/images/logo.png"; 

  const fullTitle = title ? `${title} | TEAMIND טימיינד` : siteTitle;
  const fullDescription = description || siteDescription;
  
  // Clean path calculation
  const cleanPath = location.pathname.replace(/^\/he(\/|$)/, '/');
  const enUrl = `${siteUrl}${cleanPath === '/' ? '' : cleanPath}`;
  const heUrl = `${siteUrl}/he${cleanPath === '/' ? '' : cleanPath}`;
  
  // Use provided url or current location
  const currentPath = url || location.pathname;
  const fullUrl = `${siteUrl}${currentPath === '/' ? '' : currentPath}${location.hash}`;
  const fullImage = image || siteImage;
  
  const defaultKeywords = i18n.language === 'he'
    ? "TEAMIND, teamind, טימיינד, טי מיינד, פיתוח פונקציות ניהוליות, מיומנויות למידה, מוכנות לכיתה א, פיתוח הילד, ערכה פדגוגית, חינוך לגיל הרך, גנים, גננת, יניפר בודמן, שרה אלהרר, למידה רגשית חברתית, SEL"
    : "TEAMIND, teamind, executive functions, emotional intelligence, child development, kindergarten, pedagogical kit, social emotional learning, SEL, school readiness, Jennifer Budman, Sarah Elharar";
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  const currentLang = i18n.language === 'he' ? 'he_IL' : 'en_US';

  return (
    <Helmet>
      <html lang={i18n.language} dir={i18n.language === 'he' ? 'rtl' : 'ltr'} />
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Language Alternates (SEO for Multi-language) */}
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="he" href={heUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />

      <meta name="robots" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:locale" content={currentLang} />
      <meta property="og:site_name" content="TEAMIND" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "TEAMIND",
          "url": siteUrl,
          "logo": siteImage,
          "description": siteDescription,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+972-50-342-2600",
            "contactType": "customer service",
            "email": "budmantzvi@gmail.com"
          },
          "sameAs": [
            "https://www.youtube.com/@Teamind-n2h"
          ]
        })}
      </script>
    </Helmet>
  );
};

// --- Form Schema ---
// Schema is defined inside the component to use translations
type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export const ContactForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { siteConfig, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const [phoneValue, setPhoneValue] = useState<string | undefined>();
  const lastKeyRef = useRef<string | null>(null);

  const contactSchema = z.object({
    name: z.string().min(2, t('checkout.nameRequired')).max(50, t('common.error')),
    email: z.string().email(t('checkout.invalidEmail')),
    phone: z.string().refine(val => isValidPhoneNumber(val), {
      message: t('checkout.invalidPhone')
    }),
    message: z.string()
      .min(10, t('common.error'))
      .max(500, t('contact.form.maxChars')),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  // Prevent key repeating (long press)
  const handleKeyDown = (e: any) => {
    // Allow Backspace to repeat
    if (e.key === 'Backspace') {
      lastKeyRef.current = null;
      return;
    }
    
    if (e.key === lastKeyRef.current && e.repeat) {
      e.preventDefault();
    }
    lastKeyRef.current = e.key;
  };

  const handleKeyUp = () => {
    lastKeyRef.current = null;
  };

  const onSubmit = async (data: ContactFormValues) => {
    if (!navigator.onLine) {
      toast.error("האתר לא זמין כעת עד למחרת");
      return;
    }

    const emailNotifications = siteConfig?.emailNotifications || 'both';
    
    // Log the siteConfig to see if it's actually loaded in production
    const selectedAdmins = siteConfig?.notificationAdmins || [];
    const allAdmins = siteConfig?.allAdmins || [];
    const primaryEmail = siteConfig?.contactEmail;
    
    let targetAdminEmails: string[] = [];
    
    if (selectedAdmins.length > 0) {
      // Use specifically selected admins from the list
      targetAdminEmails = selectedAdmins.filter((email: string) => email && email.includes('@'));
    } else if (primaryEmail && primaryEmail.includes('@')) {
      // Fallback to primary contact email if no specific admins selected
      targetAdminEmails = primaryEmail.split(',').map((s: string) => s.trim()).filter((e: string) => e.includes('@'));
    } else if (allAdmins.length > 0) {
      // Last resort: use all admins list
      targetAdminEmails = allAdmins.filter((email: string) => email && email.includes('@'));
    }
    
    // Ensure uniqueness
    targetAdminEmails = Array.from(new Set(
      targetAdminEmails
        .map(e => e.toLowerCase().trim())
        .filter(e => e && e.includes('@'))
    ));

    console.log("---------------- CONTACT FORM DEBUG ----------------");
    console.log("Current siteConfig:", siteConfig);
    console.log("Selected Admins (Checkboxes):", selectedAdmins);
    console.log("All Admins (Fallback List):", allAdmins);
    console.log("Primary Contact Email:", primaryEmail);
    console.log("Final Decided Recipients for API:", targetAdminEmails);
    console.log("---------------------------------------------------");

    // Check if targetAdminEmails is still empty
    if (targetAdminEmails.length === 0) {
        console.warn("WARNING: No admin emails found in siteConfig. Notification might not be sent to admins.");
    }

    console.log("Submitting contact form...", { data, recipients: targetAdminEmails, setting: emailNotifications });
    try {
      // 1. Save to Firestore first (Primary)
      console.log("Saving to Firestore...");
      await addDoc(collection(db, 'contacts'), {
        ...data,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      console.log("Saved to Firestore successfully!");

      // 2. Call Resend API for automatic emails (Secondary)
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            adminEmails: targetAdminEmails,
            emailNotifications: emailNotifications,
            language: localStorage.getItem('i18nextLng') || 'he'
          })
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error("API Error status:", res.status, errBody);
        }
      } catch (apiErr) {
        console.error("API Fetch Error:", apiErr);
      }

      // 3. Update UI
      setIsSuccess(true);
      toast.success(t('contact.form.success.title'));
      reset();
      setPhoneValue(undefined);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      // Fallback: open mailto if Firestore fails - do NOT show error toast per user request
      window.open(`mailto:${targetAdminEmails.join(',')}?subject=Contact from ${data.name}&body=${data.message}`, '_blank');
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[48px] border border-slate-100 shadow-2xl space-y-6"
      >
        <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-sans font-bold text-slate-900">{t('contact.form.success.title')}</h3>
          <p className="text-slate-600 font-medium max-w-xs mx-auto">
            {t('contact.form.success.text')}
          </p>
        </div>
        <button 
          onClick={() => setIsSuccess(false)}
          className="px-8 py-4 bg-brand-orange text-white font-bold rounded-full hover:bg-brand-orange/90 transition-all"
        >
          {t('contact.form.success.button')}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-start">
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 mx-4 uppercase tracking-[0.2em]">{t('contact.form.name')}</label>
        <input 
          {...register("name")}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          maxLength={50}
          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-brand-light-blue/10 focus:border-brand-light-blue transition-all font-bold"
          placeholder={t('contact.form.placeholder.name')}
        />
        {errors.name && <p className="text-xs text-red-500 mx-4 font-bold">{errors.name.message}</p>}
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 mx-4 uppercase tracking-[0.2em]">{t('contact.form.email')}</label>
        <input 
          {...register("email")}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-brand-light-blue/10 focus:border-brand-light-blue transition-all font-bold"
          placeholder={t('contact.form.placeholder.email')}
        />
        {errors.email && <p className="text-xs text-red-500 mx-4 font-bold">{errors.email.message}</p>}
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 mx-4 uppercase tracking-[0.2em]">{t('contact.form.phone')}</label>
        <div className="phone-input-container" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
          <PhoneInput
            international
            defaultCountry={i18n.language === 'he' ? 'IL' : 'US'}
            value={phoneValue}
            onChange={(val) => {
              setPhoneValue(val);
              setValue("phone", val || "", { shouldValidate: true });
            }}
            placeholder={t('common.phone')}
            className={`w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus-within:ring-4 focus-within:ring-brand-light-blue/10 focus-within:border-brand-light-blue transition-all font-bold ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500 mx-4 font-bold">{errors.phone.message}</p>}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-[0.2em]">{t('contact.form.message')}</label>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setValue("message", "", { shouldValidate: true })}
              className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> {t('contact.form.clear')}
            </button>
            <span className="text-[10px] font-bold text-slate-400">{t('contact.form.maxChars')}</span>
          </div>
        </div>
        <textarea 
          {...register("message")}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          maxLength={500}
          rows={4}
          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-brand-light-blue/10 focus:border-brand-light-blue transition-all font-bold resize-none"
          placeholder={t('contact.form.placeholder.message')}
        />
        {errors.message && <p className="text-xs text-red-500 mx-4 font-bold">{errors.message.message}</p>}
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 bg-brand-red text-white font-bold rounded-[32px] text-2xl hover:bg-brand-red/90 transition-all shadow-2xl shadow-brand-red/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
      >
        {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : t('contact.form.submit')}
      </button>
    </form>
  );
};

export const Logo = ({ className = "", size = "md", light = false }: { className?: string, size?: "sm" | "md" | "lg", light?: boolean }) => {
  const { siteImages, t_config } = useSite();

  const sizes = {
    sm: { img: "w-8 h-8", sub: "hidden md:block text-[7px]" },
    md: { img: "w-14 h-14 md:w-16 md:h-16", sub: "hidden md:block text-[9px] md:text-[11px]" },
    lg: { img: "w-16 h-16 md:w-20 md:h-20", sub: "text-[11px] md:text-[13px]" }
  };

  const logoSrc = siteImages.logo || "/images/logo.png";
  const tagline = t_config('tagline');

  return (
    <div className={`flex flex-col items-center text-center transition-all duration-500 ${className}`}>
      <div className={`${sizes[size].img} relative flex items-center justify-center`}>
        <img 
          src={logoSrc} 
          alt="TEAMIND Logo" 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <span className={`${sizes[size].sub} font-serif font-bold tracking-widest uppercase ${light ? 'text-white/80' : 'text-brand-green-tech'} mt-1 block leading-tight`}>
        {tagline}
      </span>
    </div>
  );
};

export const WhatsAppFloat = () => {
  const { siteConfig } = useSite();
  const contactPhone = siteConfig?.contactPhone || "972503422600";
  
  return (
    <motion.a
      href={`https://wa.me/${contactPhone.replace(/\+/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[60] w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:shadow-green-500/40 md:w-18 md:h-18"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
      </span>
    </motion.a>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHe = /^\/he($|\/)/.test(location.pathname);
  const { t, i18n } = useTranslation();
  const { t_config } = useSite();
  const prefix = isHe ? '/he' : '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: t('nav.home'), href: prefix || "/" },
    { name: t('nav.about'), href: `${prefix}/about` },
    { name: t('nav.programs'), href: `${prefix}/#program` },
    { name: t('nav.founders'), href: `${prefix}/#founders` },
  ];

  const navBtnText = t_config('navBtnText') || "Get Started";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled ? 'bg-white/80 backdrop-blur-xl py-1 shadow-lg shadow-slate-900/[0.04]' : 'bg-transparent py-4 md:py-6'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-row justify-between items-center" dir="ltr">
          <Link to={prefix || "/"} className="flex items-center" onClick={() => setIsOpen(false)}>
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 ml-auto mr-4 lg:mr-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href}
                className="text-[10px] lg:text-[12px] font-bold text-slate-700 hover:text-brand-green-tech hover:no-underline transition-all relative group uppercase tracking-widest"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-green-tech transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to={`${prefix}/#contact`} className="px-6 py-2 bg-brand-green-tech text-white font-bold rounded-full hover:shadow-lg hover:shadow-brand-green-tech/20 transition-all hover:-translate-y-0.5 active:scale-95 text-[10px] lg:text-[11px] uppercase tracking-[0.2em]">
              {navBtnText}
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden z-[60] w-12 h-12 flex flex-col items-center justify-center gap-1.5 focus:outline-none" 
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <motion.span 
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-8 h-1 bg-slate-900 rounded-full"
            />
            <motion.span 
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-8 h-1 bg-slate-900 rounded-full"
            />
            <motion.span 
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-8 h-1 bg-slate-900 rounded-full"
            />
          </button>
        </div>
      </nav>

      <WhatsAppFloat />

      {/* Modern Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <Logo size="md" />
              <button 
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full"
              >
                <X className="w-8 h-8 text-slate-900" />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.href} 
                  className="text-3xl font-serif font-bold text-slate-900 hover:text-brand-green-tech border-b border-slate-100 pb-4 flex justify-between items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  <ArrowRight className="w-6 h-6 opacity-20" />
                </Link>
              ))}
              
              {/* Direct Project Links */}
              <div className="pt-8 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">{t('footer.programs')}</p>
                <Link to={`${prefix}/early-childhood`} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-brand-orange/5 rounded-[24px] text-brand-orange font-bold text-lg">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Brain className="w-5 h-5" />
                  </div>
                  {t('programs.early')}
                </Link>
                <Link to={`${prefix}/elementary`} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-brand-red/5 rounded-[24px] text-brand-red font-bold text-lg">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Zap className="w-5 h-5" />
                  </div>
                  {t('programs.elementary')}
                </Link>
                <Link to={`${prefix}/parents`} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-brand-light-blue/5 rounded-[24px] text-brand-light-blue font-bold text-lg">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Heart className="w-5 h-5" />
                  </div>
                  {t('programs.parents')}
                </Link>
              </div>
            </nav>

            <div className="mt-auto space-y-4">
              <Link 
                to={`${prefix}/#contact`} 
                className="w-full py-5 bg-brand-green-tech text-white rounded-full text-xl font-bold shadow-xl active:scale-95 transition-all text-center block"
                onClick={() => setIsOpen(false)}
              >
                {navBtnText}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Footer = () => {
  const { siteConfig, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isHe = /^\/he($|\/)/.test(location.pathname);
  const prefix = isHe ? '/he' : '';

  const contactEmail = siteConfig?.contactEmail || "support@teamindprogram.com";
  const contactPhone = siteConfig?.contactPhone || "972503422600";
  const footerText = t_config('footerText');

  return (
    <footer className="bg-white text-slate-900 pt-24 pb-12 border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-start">
            <Logo size="lg" />
            <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
              {footerText}
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">{t('footer.programs')}</h4>
            <ul className="space-y-4">
              <li><Link to={`${prefix}/early-childhood`} className="text-lg md:text-base font-bold md:font-medium hover:text-brand-orange transition-colors">{t('programs.early')}</Link></li>
              <li><Link to={`${prefix}/elementary`} className="text-lg md:text-base font-bold md:font-medium hover:text-brand-red transition-colors">{t('programs.elementary')}</Link></li>
              <li><Link to={`${prefix}/parents`} className="text-lg md:text-base font-bold md:font-medium hover:text-brand-light-blue transition-colors">{t('programs.parents')}</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">{t('footer.legal')}</h4>
            <ul className="space-y-4">
              <li><Link to={`${prefix}/privacy-policy`} className="text-lg md:text-base font-bold md:font-medium hover:text-brand-green transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to={`${prefix}/terms-of-service`} className="text-lg md:text-base font-bold md:font-medium hover:text-brand-green transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">{t('footer.contact')}</h4>
            <div className="space-y-4 w-full max-w-[280px]">
              <a 
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 rounded-full bg-brand-red text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-red/90 transition-all active:scale-95"
              >
                <Mail className="w-5 h-5" />
                {t('footer.emailUs')}
              </a>
              <a 
                href={`https://wa.me/${contactPhone.replace(/\+/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-orange/90 transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                {t('footer.whatsappUs')}
              </a>
            </div>
            
            <div className="mt-8 flex gap-4">
              <a href="https://www.youtube.com/@Teamind-n2h" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};
