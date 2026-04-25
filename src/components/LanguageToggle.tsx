import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const LanguageToggle = ({ className = "" }: { className?: string }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    const isHebrew = location.pathname.startsWith('/he');
    const pathWithoutLang = isHebrew ? location.pathname.replace('/he', '') || '/' : location.pathname;
    
    // Construct new path
    const newPath = isHebrew 
      ? (pathWithoutLang === '' ? '/' : pathWithoutLang) 
      : `/he${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
      
    navigate(newPath + location.hash);
  };

  const currentLang = i18n.language === 'he' ? 'HE' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className={`group flex items-center gap-1.5 px-3 py-1.5 bg-white md:bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-full transition-all active:scale-95 shadow-sm ${className}`}
      title={i18n.language === 'en' ? 'Switch to Hebrew' : 'החלף לאנגלית'}
    >
      <Globe className={`w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors ${i18n.language === 'he' ? 'order-last' : ''}`} />
      <span className="text-[9px] font-black tracking-widest text-slate-600 group-hover:text-teal-700">
        {currentLang}
      </span>
    </button>
  );
};
