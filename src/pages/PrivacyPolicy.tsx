import { motion } from "motion/react";
import { ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSite } from "../lib/SiteContext";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const { t_config } = useSite();
  const isHe = i18n.language === 'he';

  const prefix = isHe ? '/he' : '';
  const policyHtml = isHe ? t_config('privacyPolicyHtml_he') : t_config('privacyPolicyHtml');

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pt-32 md:pt-48 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link to={prefix || "/"} className="inline-flex items-center gap-2 text-teal-600 font-bold mb-12 hover:gap-3 transition-all">
          {isHe ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          {t('success.backHome')}
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] p-8 md:p-16 shadow-xl border border-slate-100 text-start"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-sans font-bold">{t('legal.privacy')}</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
            <div 
              className="legal-content-rich-text"
              dangerouslySetInnerHTML={{ __html: policyHtml }} 
            />

            <p className="text-sm text-slate-400 pt-8 border-t border-slate-100">
              {t('legal.lastUpdated')}: April 25, 2026
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
