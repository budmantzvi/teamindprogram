import { motion } from "motion/react";
import { FileText, Scale, Gavel, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';

  const prefix = isHe ? '/he' : '';

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pt-32 md:pt-40 pb-24">
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
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-serif font-bold">{t('legal.terms')}</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.agreement')}</h2>
              <p>
                {t('legal.agreement_text', { defaultValue: "By accessing or using the TEAMIND website and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.use_services')}</h2>
              <p>
                {t('legal.use_services_text', { defaultValue: "You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that all persons who access the services through your internet connection are aware of these Terms and comply with them." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.ip')}</h2>
              <p>
                {t('legal.ip_text', { defaultValue: "The TEAMIND program, including its characters (Brainman, Molly the Mirror, etc.), stories, songs, and educational materials, are the intellectual property of TEAMIND. You may not reproduce, distribute, or create derivative works from our materials without explicit written permission." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.purchase_payment')}</h2>
              <p>
                {t('legal.purchase_payment_text', { defaultValue: "All purchases are processed through Meshulam. By providing your payment information, you represent and warrant that you have the legal right to use the payment method. We reserve the right to refuse or cancel any order for any reason." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.liability')}</h2>
              <p>
                {t('legal.liability_text', { defaultValue: "In no event shall TEAMIND be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our services or products." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.law')}</h2>
              <p>
                {t('legal.law_text', { defaultValue: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TEAMIND operates, without regard to its conflict of law provisions." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.terms_changes')}</h2>
              <p>
                {t('legal.terms_changes_text', { defaultValue: "We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the services after such changes constitutes your acceptance of the new Terms." })}
              </p>
            </section>

            <p className="text-sm text-slate-400 pt-8 border-t border-slate-100">
              {t('legal.lastUpdated')}: April 6, 2026
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
