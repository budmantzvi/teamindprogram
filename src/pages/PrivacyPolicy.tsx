import { motion } from "motion/react";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-serif font-bold">{t('legal.privacy')}</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.introduction')}</h2>
              <p>
                {t('legal.intro_text', { defaultValue: "Welcome to TEAMIND. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.collect')}</h2>
              <p>
                {t('legal.collect_text', { defaultValue: "We value your privacy and aim to collect only the minimum amount of information necessary to provide our services. We collect:" })}
              </p>
              <ul className={`list-disc space-y-2 ${isHe ? 'pr-6' : 'pl-6'}`}>
                <li><strong>{t('checkout.fullName')}:</strong> {t('legal.collect_name', { defaultValue: "Your name and email address when you choose to submit them via our contact form or during the checkout process." })}</li>
                <li><strong>{t('legal.shipping')}:</strong> {t('legal.shipping_text', { defaultValue: "Your physical address for the delivery of pedagogical kits." })}</li>
                <li><strong>{t('legal.payment')}:</strong> {t('legal.payment_text', { defaultValue: "All payments are processed through Meshulam. We do not store your credit card details on our servers." })}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.use')}</h2>
              <p>
                {t('legal.use_text', { defaultValue: "We use the information we collect to:" })}
              </p>
              <ul className={`list-disc space-y-2 ${isHe ? 'pr-6' : 'pl-6'}`}>
                <li>{t('legal.use_1', { defaultValue: "Process your orders and deliver your kits." })}</li>
                <li>{t('legal.use_2', { defaultValue: "Respond to your inquiries and provide customer support." })}</li>
                <li>{t('legal.use_3', { defaultValue: "Send you important updates regarding your purchase." })}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.security')}</h2>
              <p>
                {t('legal.security_text', { defaultValue: "We implement appropriate technical and organizational security measures to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.thirdParty')}</h2>
              <p>
                {t('legal.thirdParty_text', { defaultValue: "We use Meshulam for payment processing and automation. We also use Firebase for data storage. We do not sell or share your personal information with any other third parties for marketing purposes." })}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{t('legal.contact')}</h2>
              <p>
                {t('legal.contact_text', { defaultValue: "If you have questions or comments about this policy, you may email us at support@teamindprogram.com." })}
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
