import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Loader2, Phone, Mail, MapPin, MessageCircle, ChevronDown, CheckCircle2, Brain, Youtube
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
  const { t, i18n } = useTranslation();
  const { t_config } = useSite();
  const siteTitle = t_config('siteTitle') || "TEAMIND | Thinking, Emotions, Attention & Motivation IN Development";
  const siteDescription = t_config('heroSubtitle') || "TEAMIND is a revolutionary character-based program designed to strengthen executive functions in children through music, play, and emotional connection.";
  const siteUrl = "https://teamindprogram.com/";
  const siteImage = "https://teamindprogram.com/images/logo.png"; 

  const fullTitle = title ? `${title} | TEAMIND` : siteTitle;
  const fullDescription = description || siteDescription;
  const fullUrl = url ? `${siteUrl}${url.startsWith('/') ? url.slice(1) : url}` : siteUrl;
  const fullImage = image || siteImage;
  
  const defaultKeywords = "TEAMIND, teamind, טימיינד, ערכות לילדים, גן, גננת, חינוך, executive functions, emotional intelligence, child development, kindergarten, pedagogical kit, social emotional learning, SEL";
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  const currentLang = i18n.language === 'he' ? 'he_IL' : 'en_US';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={fullUrl} />
      
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
            "email": "teamind50@gmail.com"
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
    
    // Use selected admins if list is not empty, otherwise fallback to primary contact
    const selectedAdmins = siteConfig?.notificationAdmins || [];
    const targetAdminEmails = selectedAdmins.length > 0 
      ? selectedAdmins.filter((email: string) => email && email.includes('@'))
      : [siteConfig?.contactEmail || 'teamind50@gmail.com'];

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
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-serif font-bold text-slate-900">{t('contact.form.success.title')}</h3>
          <p className="text-slate-600 font-medium max-w-xs mx-auto">
            {t('contact.form.success.text')}
          </p>
        </div>
        <button 
          onClick={() => setIsSuccess(false)}
          className="px-8 py-4 bg-teal-600 text-white font-black rounded-full hover:bg-teal-700 transition-all"
        >
          {t('contact.form.success.button')}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-start">
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-700 mx-4 uppercase tracking-[0.2em]">{t('contact.form.name')}</label>
        <input 
          {...register("name")}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          maxLength={50}
          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold"
          placeholder={t('contact.form.placeholder.name')}
        />
        {errors.name && <p className="text-xs text-red-500 mx-4 font-bold">{errors.name.message}</p>}
      </div>
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-700 mx-4 uppercase tracking-[0.2em]">{t('contact.form.email')}</label>
        <input 
          {...register("email")}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold"
          placeholder={t('contact.form.placeholder.email')}
        />
        {errors.email && <p className="text-xs text-red-500 mx-4 font-bold">{errors.email.message}</p>}
      </div>
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-700 mx-4 uppercase tracking-[0.2em]">{t('contact.form.phone')}</label>
        <div className="phone-input-container" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
          <PhoneInput
            international
            defaultCountry="IL"
            value={phoneValue}
            onChange={(val) => {
              setPhoneValue(val);
              setValue("phone", val || "", { shouldValidate: true });
            }}
            placeholder={t('common.phone')}
            className={`w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all font-bold ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500 mx-4 font-bold">{errors.phone.message}</p>}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <label className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">{t('contact.form.message')}</label>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setValue("message", "", { shouldValidate: true })}
              className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1"
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
          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold resize-none"
          placeholder={t('contact.form.placeholder.message')}
        />
        {errors.message && <p className="text-xs text-red-500 mx-4 font-bold">{errors.message.message}</p>}
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 bg-brand-green text-white font-black rounded-[32px] text-2xl hover:bg-brand-green/90 transition-all shadow-2xl shadow-brand-green/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
      >
        {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : t('contact.form.submit')}
      </button>
    </form>
  );
};

export const Logo = ({ className = "", size = "md", light = false }: { className?: string, size?: "sm" | "md" | "lg", light?: boolean }) => {
  const { siteConfig, siteImages, t_config } = useSite();

  const sizes = {
    sm: { img: "w-8 h-8", sub: "text-[8px]" },
    md: { img: "w-14 h-14 md:w-16 md:h-16", sub: "text-[10px] md:text-[11px]" },
    lg: { img: "w-16 h-16 md:w-20 md:h-20", sub: "text-[11px] md:text-[12px]" }
  };

  const logoSrc = siteImages.logo || "/images/logo.png";
  const tagline = t_config('tagline');

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className={`${sizes[size].img} relative flex items-center justify-center bg-transparent`}>
        <img 
          src={logoSrc} 
          alt="TEAMIND - התוכנית לפיתוח פונקציות ניהוליות ומיומנויות למידה לילדים" 
          className={`w-full h-full object-contain transition-opacity duration-500 bg-transparent ${logoSrc ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <span className={`${sizes[size].sub} font-sans font-bold tracking-[0.05em] ${light ? 'text-white/80' : 'text-brand-green'} mt-0.5 block leading-tight`}>
        {tagline}
      </span>
    </div>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { siteConfig, t_config } = useSite();
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navBtnText = t_config('navBtnText') || "Get Started";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav.home'), href: "/" },
    { name: t('nav.about'), href: "/#about" },
    { name: t('nav.programs'), href: "/#program" },
    { name: t('nav.founders'), href: "/#founders" },
  ];

  const programLinks = [
    { name: t('programs.early'), href: "/early-childhood" },
    { name: t('programs.elementary'), href: "/elementary" },
    { name: t('programs.parents'), href: "/parents" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md py-1 shadow-sm' : 'bg-transparent py-2'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href + link.name}
              to={link.href} 
              className={`text-xs font-bold transition-colors ${
                (link.href === '/' && location.pathname === '/') || (link.href !== '/' && location.hash === link.href.replace('/', ''))
                  ? 'text-teal-600' 
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/#contact" 
            className="px-5 py-2 bg-brand-green text-white rounded-full text-xs font-bold hover:bg-brand-green/90 transition-all hover:shadow-xl hover:shadow-brand-green/20 active:scale-95"
          >
            {navBtnText}
          </Link>
          <LanguageToggle />
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-slate-900 p-2" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-lg font-bold text-slate-800"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('nav.programs')}</p>
                <div className="flex flex-col gap-4">
                  {programLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      to={link.href} 
                      className="text-lg font-bold text-teal-600"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link 
                  to="/#contact" 
                  className="flex-1 py-4 bg-brand-green text-white rounded-2xl text-center font-bold shadow-lg shadow-brand-green/20"
                  onClick={() => setIsOpen(false)}
                  aria-label="Get Started - Contact Us"
                >
                  {navBtnText}
                </Link>
                <LanguageToggle className="ms-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  const { siteConfig, t_config } = useSite();
  const { t } = useTranslation();

  const contactEmail = siteConfig?.contactEmail || "teamind50@gmail.com";
  const contactPhone = siteConfig?.contactPhone || "972503422600";
  const footerText = t_config('footerText');

  return (
    <footer className="bg-slate-50 text-slate-900 py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo size="md" light={false} />
            <p className="text-slate-500 font-medium leading-relaxed">
              {footerText}
            </p>
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t('footer.programs')}</h4>
            <ul className="space-y-4">
              <li><Link to="/early-childhood" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('programs.early')}</Link></li>
              <li><Link to="/elementary" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('programs.elementary')}</Link></li>
              <li><Link to="/parents" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('programs.parents')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t('footer.company')}</h4>
            <ul className="space-y-4">
              <li><Link to="/#founders" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('nav.founders')}</Link></li>
              <li><Link to="/#about" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('nav.about')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t('footer.legal')}</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy-policy" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms-of-service" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">{t('footer.terms')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t('footer.social')}</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://www.youtube.com/@Teamind-n2h" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-slate-500 hover:text-rose-600 transition-all group"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-rose-50 transition-colors">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{t('footer.youtube')}</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-full font-bold hover:bg-brand-light-blue/90 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  {t('footer.emailUs')}
                </a>
              </li>
              <li className="pt-2">
                <a 
                  href={`https://wa.me/${contactPhone.replace(/\+/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-full font-bold hover:bg-brand-green/90 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('footer.whatsappUs')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm font-medium">{t('footer.rights')}</p>
          <div className="flex gap-8">
            <Link to="/privacy-policy" className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium">{t('footer.privacy')}</Link>
            <Link to="/terms-of-service" className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
