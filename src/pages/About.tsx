import { motion } from "motion/react";
import { 
  Sparkles, Award, Heart, Users, Brain, Zap, Clock, ShieldCheck, Target, 
  MessageCircle, Mail, ArrowRight, BookOpen, Layers, Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/Shared";
import { useSite } from '../lib/SiteContext';
import { safeSplit } from '../lib/constants';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { siteConfig, siteImages, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';

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
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-orange/30 selection:text-brand-orange pt-32 md:pt-40">
      <SEO 
        title={t('nav.about')} 
        description={aboutSubtitle}
        url="/about"
        keywords="about TEAMIND, אודות טימיינד, פיתוח פונקציות ניהוליות, מחקר נוירו-התפתחותי, המייסדות, executive functions research, child development founders"
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-start"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-bold uppercase tracking-widest leading-none">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t('nav.about')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
              {safeSplit(aboutTitle, '.').map((part: string, i: number, arr: string[]) => (
                <span key={i}>
                  {part}{i < arr.length - 1 ? '.' : ''}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {aboutText}
            </p>
            <p className="text-lg text-slate-500 leading-relaxed">
              {aboutSubtext}
            </p>
            {aboutFootnote && (
              <p className="text-sm text-slate-400 italic pt-4">
                {aboutFootnote}
              </p>
            )}
            <div className="pt-8">
              <Link to="/#contact" className="px-10 py-5 bg-brand-orange text-white font-bold rounded-full text-lg hover:bg-brand-orange/90 transition-all hover:scale-105 shadow-xl shadow-brand-orange/20 flex items-center justify-center w-fit gap-2">
                {t('programs.contact')}
                <ArrowRight className={`w-5 h-5 ${isHe ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-[64px] overflow-hidden shadow-2xl border-8 border-white bg-slate-50">
              <img 
                src={aboutImage} 
                alt="About TEAMIND" 
                className={`w-full h-full object-cover transition-opacity duration-500 ${aboutImage ? 'opacity-100' : 'opacity-0'}`}
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-8 -inline-start-8 w-48 h-48 bg-orange-100 rounded-[40px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="founders" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
              {safeSplit(foundersTitle, '.').map((part: string, i: number, arr: string[]) => (
                <span key={i}>
                  {part}{i < arr.length - 1 ? '.' : ''}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
              {foundersSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {foundersList.map((member: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-slate-50 rounded-[64px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 text-start"
              >
                <div className="p-10 md:p-12 flex flex-col justify-center gap-6">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">{member.name}</h3>
                    <p className="text-brand-green font-black uppercase tracking-widest text-xs">{member.role}</p>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {member.desc}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    {member.stats.map((stat: string, j: number) => (
                      <div key={j} className="px-4 py-2 bg-white rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
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
      <section className="py-24 bg-brand-orange text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{t('programs.ready')}</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto font-medium">
            {t('programs.join')}
          </p>
          <Link to="/#contact" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-orange font-bold rounded-full text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl">
            {t('programs.contact')}
            <ArrowRight className={`w-5 h-5 ${isHe ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
