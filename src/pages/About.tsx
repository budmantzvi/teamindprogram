import { motion } from "motion/react";
import { 
  Sparkles, Award, Heart, Users, Brain, Zap, Clock, ShieldCheck, Target, 
  MessageCircle, Mail, ArrowRight, BookOpen, Layers, Star
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SEO } from "../components/Shared";
import { useSite } from '../lib/SiteContext';
import { safeSplit } from '../lib/constants';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { siteConfig, siteImages, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isHe = /^\/he($|\/)/.test(location.pathname);
  const prefix = isHe ? '/he' : '';

  const aboutTitle = t_config('aboutTitle') || t('home.aboutTitle');
  const aboutSubtitle = t_config('aboutSubtitle') || t('home.aboutSubtitle');
  const aboutText = t_config('aboutText');
  const aboutSubtext = t_config('aboutSubtext');
  const aboutFootnote = t_config('aboutFootnote');
  
  const foundersTitle = t_config('foundersTitle');
  const foundersSubtitle = t_config('foundersSubtitle');
  const foundersList = t_config('foundersMembers') || [];

  const aboutImage = siteImages.about || "/images/about-fallback.jpg";

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-orange/30 selection:text-brand-orange pt-32 md:pt-48 overflow-x-hidden">
      <SEO 
        title={t('nav.about')} 
        description={isHe 
          ? "הכירו את הצוות שמאחורי TEAMIND - מומחיות בחינוך ופיתוח הילד המביאות גישה חדשנית לפיתוח פונקציות ניהוליות." 
          : "Meet the team behind TEAMIND - education and child development experts bringing an innovative approach to executive function development."
        }
        url="/about"
        keywords="about TEAMIND, אודות טימיינד, פיתוח פונקציות ניהוליות, מחקר נוירו-התפתחותי, המייסדות, executive functions research, child development founders"
      />

      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-24 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10 text-center lg:text-start order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-slate-100 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green-tech shadow-sm mx-auto lg:mx-0">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t('nav.about')}</span>
            </div>
            <h1 className="text-[40px] md:text-7xl lg:text-8xl font-serif font-medium tracking-tighter leading-[0.9]">
              {safeSplit(aboutTitle, '.').map((part: string, i: number, arr: string[]) => (
                <span key={i} className="block last:text-brand-green-tech last:italic">
                  {part}
                </span>
              ))}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              {aboutText}
            </p>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {aboutSubtext}
            </p>
            {aboutFootnote && (
              <p className="text-sm text-slate-400 italic pt-4">
                {aboutFootnote}
              </p>
            )}
            <div className="flex justify-center lg:justify-start pt-6">
              <Link to={`${prefix}/#contact`} className="btn-primary bg-brand-orange shadow-brand-orange/20">
                {t('programs.contact')}
                <ArrowRight className={`w-6 h-6 ${isHe ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative order-1 lg:order-2 max-w-[500px] mx-auto lg:max-w-none w-full"
          >
            <div className="aspect-square rounded-[80px] overflow-hidden shadow-3xl shadow-brand-orange/20 border-[12px] border-white bg-white">
              <img 
                src={aboutImage} 
                alt="About TEAMIND" 
                className={`w-full h-full object-cover transition-opacity duration-700 ${aboutImage ? 'opacity-100' : 'opacity-0'}`}
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="founders" className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[32px] md:text-6xl font-sans font-bold md:font-medium lg:font-semibold mb-8 tracking-tighter leading-tight">
              {safeSplit(foundersTitle, '.').map((part: string, i: number, arr: string[]) => (
                <span key={i} className="block last:text-brand-green last:italic">
                  {part}
                </span>
              ))}
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              {foundersSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {foundersList.map((member: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group bg-slate-50 rounded-[64px] overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 text-center md:text-start"
              >
                <div className="p-10 md:p-14 flex flex-col justify-center gap-8">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-sans font-bold text-slate-900 mb-3 tracking-tighter">{member.name}</h3>
                    <p className="inline-block px-4 py-1 bg-brand-green/10 text-brand-green font-bold uppercase tracking-[0.2em] text-[10px] rounded-full">{member.role}</p>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed text-lg">
                    {member.desc}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                    {member.stats.map((stat: string, j: number) => (
                      <div key={j} className="px-4 py-2 bg-white rounded-2xl border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {stat}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-brand-orange text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[40px] md:text-8xl font-sans font-bold mb-10 tracking-tighter leading-none">{t('programs.ready')}</h2>
          <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('programs.join')}
          </p>
          <Link to={`${prefix}/#contact`} className="inline-flex items-center gap-4 px-12 py-6 bg-white text-brand-orange font-bold rounded-full text-xl hover:bg-slate-50 transition-all shadow-3xl hover:-translate-y-1 active:scale-95">
            {t('programs.contact')}
            <ArrowRight className={`w-7 h-7 ${isHe ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
