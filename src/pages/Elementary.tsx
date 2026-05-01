import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { 
  Brain, Users, Target, Zap, Clock, Heart, 
  ChevronRight, ArrowRight, MessageSquare, ShieldCheck,
  Star, Quote, Mail, Phone, MapPin, Package, Music,
  Sparkles, Layers, BookOpen, Smile, Award, Loader2, Camera, Play, Image
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SEO } from "../components/Shared";
import { useSite } from '../lib/SiteContext';
import { DEFAULT_CONFIG, safeSplit } from '../lib/constants';
import { useTranslation } from 'react-i18next';

export default function Elementary() {
  const { siteConfig, siteImages, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isHe = /^\/he($|\/)/.test(location.pathname);
  const prefix = isHe ? '/he' : '';

  const pageData = {
    title: t_config('elementary.title'),
    subtitle: t_config('elementary.subtitle'),
    description: t_config('elementary.description'),
    detailsTitle: t_config('elementary.detailsTitle'),
    kitTitle: t_config('elementary.kitTitle'),
    kitSubtitle: t_config('elementary.kitSubtitle'),
    investTitle: t_config('elementary.investTitle'),
    investSubtitle: t_config('elementary.investSubtitle'),
  };

  const heroImage = siteImages.elementaryHero;
  const kitImage = siteImages.elementaryKit;
  const galleryImages = [
    siteImages.elementaryGallery1,
    siteImages.elementaryGallery2,
    siteImages.elementaryGallery3,
    siteImages.elementaryGallery4,
    siteImages.elementaryGallery5,
  ].filter(Boolean);
  
  const fallbackGallery = [
    "/images/Elementary-1.jpeg",
    "/images/Elementary-2.jpeg",
    "/images/Elementary-3.jpeg",
    "/images/Elementary-4.jpeg",
    "/images/Elementary-5.jpeg",
  ];

  const displayGallery = galleryImages.length > 0 ? galleryImages : fallbackGallery;

  const detailItems = [
    { title: t('programs.elem_detail_1_title', { defaultValue: "Lesson Plans" }), desc: t('programs.elem_detail_1_desc', { defaultValue: "24 structured lessons that integrate seamlessly into the school curriculum." }), icon: BookOpen },
    { title: t('programs.elem_detail_2_title', { defaultValue: "Classroom Behavior" }), desc: t('programs.elem_detail_2_desc', { defaultValue: "Supporting improved behavior through self-regulation and impulse control." }), icon: ShieldCheck },
    { title: t('programs.elem_detail_3_title', { defaultValue: "Engagement" }), desc: t('programs.elem_detail_3_desc', { defaultValue: "Building stronger learning stamina and engagement in academic tasks." }), icon: Zap },
    { title: t('programs.elem_detail_4_title', { defaultValue: "Peer Relationships" }), desc: t('programs.elem_detail_4_desc', { defaultValue: "Fostering healthier social interactions and empathy among students." }), icon: Heart },
    { title: t('programs.elem_detail_5_title', { defaultValue: "Independence" }), desc: t('programs.elem_detail_5_desc', { defaultValue: "Encouraging greater responsibility and independence in daily school life." }), icon: Target },
    { title: t('programs.elem_detail_6_title', { defaultValue: "Targeted Support" }), desc: t('programs.elem_detail_6_desc', { defaultValue: "Can be implemented with whole classes, small groups, or individual students." }), icon: Users },
  ];

  const kitItems = [
    { title: t('programs.kit_handbook_elem', { defaultValue: "Educator Handbook" }), desc: t('programs.kit_handbook_elem_desc', { defaultValue: "Complete guide for classroom implementation." }), icon: BookOpen },
    { title: t('programs.kit_lessons_elem', { defaultValue: "24 Lesson Plans" }), desc: t('programs.kit_lessons_elem_desc', { defaultValue: "Structured, ready-to-use lesson guides." }), icon: Layers },
    { title: t('programs.kit_activities_elem', { defaultValue: "96 Activities" }), desc: t('programs.kit_activities_elem_desc', { defaultValue: "Diverse activities for classroom learning." }), icon: Smile },
    { title: t('programs.kit_cards_elem', { defaultValue: "108 Activity Cards" }), desc: t('programs.kit_cards_elem_desc', { defaultValue: "Visual aids for reinforced learning." }), icon: Image },
    { title: t('programs.kit_usb', { defaultValue: "USB Audio Tracks" }), icon: Music, desc: t('programs.kit_usb_desc', { defaultValue: "All songs, jingles, and stories." }) },
    { title: t('programs.kit_character_sets', { defaultValue: "Character Card Sets" }), icon: Users, desc: t('programs.kit_character_sets_desc', { defaultValue: "6 sets of character cards for students." }) },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-light-blue/30 selection:text-brand-light-blue pt-32 md:pt-48 overflow-x-hidden">
      <SEO 
        title={t('programs.elementary')} 
        description={isHe 
          ? "תוכנית TEAMIND לבתי ספר יסודיים (גילאי 6-12) מחזקת מיומנויות למידה, ריכוז וארגון בקרב תלמידים." 
          : "TEAMIND Elementary program (Ages 6-12) strengthens learning skills, focus, and organization in students."
        }
        keywords="ערכת בית ספר יסודי, מיומנויות למידה ליסודי, אסטרטגיות למידה, תפקודי ניהול בבית הספר, Elementary school executive functions, Learning strategies, מוכנות ללימודים, שיפור ריכוז, קשב וריכוז"
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
              <span>{t('programs.ages_6_12')}</span>
            </div>
            <h1 className="text-[40px] md:text-6xl lg:text-7xl font-serif font-medium tracking-tighter leading-[0.9]">
              {safeSplit(pageData.title, ' ').map((word: string, i: number, arr: string[]) => (
                <span key={i} className={`block ${i === arr.length - 1 ? "text-brand-green-tech italic" : ""}`}>
                  {word}
                </span>
              ))}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              {pageData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
              <Link to={`${prefix}/checkout?program=Elementary+Kit`} className="btn-primary">
                {t('programs.getKit')}
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
            <div className="aspect-square rounded-[80px] overflow-hidden shadow-3xl shadow-brand-light-blue/20 border-[12px] border-white bg-white">
              <img 
                src={heroImage} 
                alt="Elementary Program" 
                className={`w-full h-full object-cover transition-opacity duration-700 ${heroImage ? 'opacity-100' : 'opacity-0'}`}
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-20 text-center lg:text-start mx-auto lg:mx-0">
            <h2 className="text-[32px] md:text-4xl lg:text-5xl font-serif font-bold mb-10 tracking-tighter">{pageData.detailsTitle}</h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              {pageData.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {detailItems.map((item, i) => {
              const palette = ['text-brand-red', 'text-brand-orange', 'text-brand-light-blue', 'text-brand-pink', 'text-brand-yellow', 'text-brand-green'];
              const colorClass = palette[i % palette.length];
              return (
                <div key={i} className="p-12 md:p-14 bg-slate-50 rounded-[48px] border border-slate-100 hover:border-brand-red/30 hover:shadow-2xl transition-all group text-center lg:text-start">
                  <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center ${colorClass} shadow-md mb-10 mx-auto lg:mx-0 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Kit Section */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[32px] md:text-7xl font-sans font-bold mb-8 tracking-tighter leading-tight">
              {safeSplit(pageData.kitTitle, '.').map((part: string, i: number) => (
                <span key={i} className={i !== 0 ? "text-brand-green italic block" : "block"}>
                  {part}
                </span>
              ))}
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">{pageData.kitSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
              {kitItems.map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-start gap-6 text-start hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative order-1 lg:order-2 max-w-[500px] mx-auto lg:max-w-none w-full">
              <div className="aspect-square rounded-[80px] overflow-hidden shadow-3xl border-[12px] border-white bg-white">
                <img 
                  src={kitImage} 
                  alt="Elementary Kit" 
                  className={`w-full h-full object-cover transition-opacity duration-1000 ${kitImage ? 'opacity-100' : 'opacity-0'}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <h2 className="text-[32px] md:text-6xl font-sans font-bold mb-20 text-center tracking-tighter">
            {t('nav.programs')} <span className="text-brand-pink italic"> {t('programs.gallery')}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayGallery.map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="aspect-square rounded-[40px] overflow-hidden bg-slate-50 shadow-lg border-4 border-white"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="bg-brand-orange/5 rounded-[80px] p-12 md:p-24 text-slate-900 border border-brand-orange/10 relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="space-y-10 text-center lg:text-start">
                <h2 className="text-[40px] md:text-7xl font-sans font-bold tracking-tighter leading-none">
                  {safeSplit(pageData.investTitle, '.').map((part: string, i: number) => (
                    <span key={i} className={`block ${i !== 0 ? "text-brand-orange italic" : ""}`}>
                      {part}
                    </span>
                  ))}
                </h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {pageData.investSubtitle}
                </p>
              </div>
              <div className="bg-white border border-brand-orange/10 rounded-[60px] p-8 md:p-16 text-center space-y-8 md:space-y-10 shadow-3xl shadow-brand-orange/5">
                <div className="space-y-4">
                  <p className="inline-block px-5 py-2 bg-brand-orange/10 text-brand-orange font-bold uppercase tracking-[0.2em] text-[10px] rounded-full">{t('programs.complete_program_kit')}</p>
                  <p className="text-slate-400 font-bold tracking-tight text-sm md:text-base">{t('programs.all_inclusive')}</p>
                </div>
                <Link to={`${prefix}/checkout?program=Elementary+Kit`} className="btn-primary w-full h-16 md:h-20 text-lg md:text-xl bg-brand-orange shadow-brand-orange/20 hover:scale-[1.02] active:scale-95">
                  <span className="whitespace-nowrap">{t('programs.purchase')}</span>
                  <ArrowRight className={`w-6 h-6 md:w-8 md:h-8 ${isHe ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-brand-green text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[40px] md:text-8xl font-sans font-bold mb-10 tracking-tighter leading-none">{t('programs.ready')}</h2>
          <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('programs.join')}
          </p>
          <Link to={`${prefix}/#contact`} className="inline-flex items-center gap-4 px-10 py-4 lg:px-12 lg:py-6 bg-white text-brand-green font-bold md:font-semibold rounded-full text-lg lg:text-xl hover:bg-slate-50 transition-all shadow-3xl hover:-translate-y-1 active:scale-95">
            {t('programs.contact')}
            <ArrowRight className={`w-7 h-7 ${isHe ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
