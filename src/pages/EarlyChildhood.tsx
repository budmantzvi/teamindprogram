import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { 
  Brain, Users, Target, Zap, Clock, Heart, 
  ChevronRight, ArrowRight, MessageSquare, ShieldCheck,
  Star, Quote, Mail, Phone, MapPin, Package, Music,
  Sparkles, Layers, BookOpen, Smile, Award, Loader2, Camera, Play, Image
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/Shared";
import { useSite } from '../lib/SiteContext';
import { DEFAULT_CONFIG, safeSplit } from '../lib/constants';
import { useTranslation } from 'react-i18next';

export default function EarlyChildhood() {
  const { siteConfig, siteImages, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';

  const pageData = {
    title: t_config('earlyChildhood.title'),
    subtitle: t_config('earlyChildhood.subtitle'),
    description: t_config('earlyChildhood.description'),
    detailsTitle: t_config('earlyChildhood.detailsTitle'),
    kitTitle: t_config('earlyChildhood.kitTitle'),
    kitSubtitle: t_config('earlyChildhood.kitSubtitle'),
    investTitle: t_config('earlyChildhood.investTitle'),
    investSubtitle: t_config('earlyChildhood.investSubtitle'),
  };

  const heroImage = siteImages.earlyHero;
  const kitImage = siteImages.earlyKit;
  const galleryImages = [
    siteImages.earlyGallery1,
    siteImages.earlyGallery2,
    siteImages.earlyGallery3,
    siteImages.earlyGallery4,
    siteImages.earlyGallery5,
    siteImages.earlyGallery6,
    siteImages.earlyGallery7,
  ].filter(Boolean);
  
  const fallbackGallery = [
    "/images/early-1.jpeg",
    "/images/early-2.png",
    "/images/early-3.jpeg",
    "/images/early-4.jpeg",
    "/images/early-5.jpeg",
    "/images/early-6.png",
    "/images/early-7.png",
  ];

  const displayGallery = galleryImages.length > 0 ? galleryImages : fallbackGallery;

  const detailItems = [
    { title: t('programs.early_detail_1_title', { defaultValue: "Circle Time" }), desc: t('programs.early_detail_1_desc', { defaultValue: "Engaging group activities that introduce executive skills through storytelling and music." }), icon: Users },
    { title: t('programs.early_detail_2_title', { defaultValue: "Transitions" }), desc: t('programs.early_detail_2_desc', { defaultValue: "Smooth transitions between activities using character-based cues and songs." }), icon: Zap },
    { title: t('programs.early_detail_3_title', { defaultValue: "Play-Based Learning" }), desc: t('programs.early_detail_3_desc', { defaultValue: "Reinforcing skills through structured and unstructured play scenarios." }), icon: Smile },
    { title: t('programs.early_detail_4_title', { defaultValue: "Emotional Expression" }), desc: t('programs.early_detail_4_desc', { defaultValue: "Helping children identify and express their feelings with the help of Molly the Mirror." }), icon: Heart },
    { title: t('programs.early_detail_5_title', { defaultValue: "School Readiness" }), desc: t('programs.early_detail_5_desc', { defaultValue: "Building the cognitive foundations necessary for a successful transition to elementary school." }), icon: Target },
    { title: t('programs.early_detail_6_title', { defaultValue: "Calmer Classrooms" }), desc: t('programs.early_detail_6_desc', { defaultValue: "Reducing stress and behavioral issues through shared language and self-regulation tools." }), icon: ShieldCheck },
  ];

  const kitItems = [
    { title: t('programs.kit_handbook', { defaultValue: "Program Handbook" }), desc: t('programs.kit_handbook_desc', { defaultValue: "Complete guide for educators." }), icon: BookOpen },
    { title: t('programs.kit_activity', { defaultValue: "Activity Handbook" }), desc: t('programs.kit_activity_desc', { defaultValue: "Step-by-step activity plans." }), icon: Layers },
    { title: t('programs.kit_posters', { defaultValue: "6 Posters" }), desc: t('programs.kit_posters_desc', { defaultValue: "Large, colorful character posters." }), icon: Image },
    { title: t('programs.kit_books', { defaultValue: "15 Story Books" }), desc: t('programs.kit_books_desc', { defaultValue: "Beautifully illustrated stories." }), icon: BookOpen },
    { title: t('programs.kit_games', { defaultValue: "6 Original Games" }), desc: t('programs.kit_games_desc', { defaultValue: "Engaging games for each skill." }), icon: Smile },
    { title: t('programs.kit_usb', { defaultValue: "USB Audio Tracks" }), icon: Music, desc: t('programs.kit_usb_desc', { defaultValue: "All songs, jingles, and stories." }) },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-light-blue/30 selection:text-brand-light-blue pt-32 md:pt-40">
      <SEO 
        title={t('programs.early')} 
        description={pageData.subtitle}
        keywords="ערכת הגיל הרך, גנים, מיומנויות למידה לגן, מוכנות לכיתה א, פונקציות ניהוליות לגן, Early childhood education, Preschool skills, kindergarten teacher, גננות, חינוך לגיל הרך"
      />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 text-start"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold uppercase tracking-widest leading-none">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t('programs.ages_3_6')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
              {safeSplit(pageData.title, ' ').map((word: string, i: number, arr: string[]) => (
                <span key={i} className={i === arr.length - 1 ? "text-brand-green italic" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
              {pageData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/checkout?program=Early+Childhood+Kit" className="px-10 py-5 bg-brand-green text-white font-bold rounded-full text-lg hover:bg-brand-green/90 transition-all hover:scale-105 shadow-xl shadow-brand-green/20 flex items-center justify-center gap-2">
                {t('programs.getKit')}
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
                src={heroImage} 
                alt="Early Childhood Program" 
                className={`w-full h-full object-cover transition-opacity duration-500 ${heroImage ? 'opacity-100' : 'opacity-0'}`}
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="absolute -bottom-8 -inline-start-8 w-48 h-48 bg-yellow-100 rounded-[40px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-20 text-start">
            <h2 className="text-4xl font-serif font-bold mb-8">{pageData.detailsTitle}</h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {pageData.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {detailItems.map((item, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 hover:border-brand-green/30 transition-colors group text-start">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-green shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Kit Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{safeSplit(pageData.kitTitle, '.').map((part: string, i: number) => i === 0 ? part : <span key={i} className="text-brand-light-blue italic">.{part}</span>)}</h2>
            <p className="text-lg text-slate-600 font-medium">{pageData.kitSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {kitItems.map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-4 text-start">
                  <div className="w-10 h-10 bg-brand-light-blue/10 rounded-xl flex items-center justify-center text-brand-light-blue shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[64px] overflow-hidden shadow-2xl border-8 border-white bg-slate-50">
                <img 
                  src={kitImage} 
                  alt="Early Childhood Kit" 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${kitImage ? 'opacity-100' : 'opacity-0'}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-serif font-bold mb-16 text-center">{t('nav.programs')} <span className="text-brand-orange italic">{t('programs.gallery')}</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {displayGallery.map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05 }}
                className="aspect-square rounded-[32px] overflow-hidden bg-slate-100 shadow-lg"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-pink/10 rounded-[64px] p-12 md:p-20 text-slate-900 overflow-hidden relative border border-brand-pink/20">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-start">
                <h2 className="text-4xl md:text-6xl font-serif font-bold">{safeSplit(pageData.investTitle, '.').map((part: string, i: number) => i === 0 ? part : <span key={i} className="text-brand-pink italic">.{part}</span>)}</h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  {pageData.investSubtitle}
                </p>
              </div>
              <div className="bg-white border border-brand-pink/20 rounded-[48px] p-12 text-center space-y-8 shadow-xl shadow-brand-pink/5">
                <div className="space-y-2">
                  <p className="text-brand-pink font-black uppercase tracking-widest text-sm">{t('programs.complete_program_kit')}</p>
                  <p className="text-slate-400 font-bold">{t('programs.all_inclusive')}</p>
                </div>
                <Link to="/checkout?program=Early+Childhood+Kit" className="w-full py-5 bg-brand-pink text-white font-black rounded-full text-xl hover:bg-brand-pink/90 transition-all shadow-2xl shadow-brand-pink/20 flex items-center justify-center gap-3">
                  {t('programs.purchase')}
                  <ArrowRight className={`w-6 h-6 ${isHe ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-light-blue text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{t('programs.ready')}</h2>
          <p className="text-xl text-brand-light-blue/10 mb-12 max-w-2xl mx-auto font-medium">
            {t('programs.join')}
          </p>
          <Link to="/#contact" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-light-blue font-bold rounded-full text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl">
            {t('programs.contact')}
            <ArrowRight className={`w-5 h-5 ${isHe ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
