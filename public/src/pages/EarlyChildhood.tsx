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
  const prefix = isHe ? '/he' : '';

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
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-green/30 selection:text-brand-green pt-32 md:pt-48 overflow-x-hidden">
      <SEO 
        title={t('programs.early')} 
        description={pageData.subtitle}
        keywords="ערכת הגיל הרך, גנים, מיומנויות למידה לגן, מוכנות לכיתה א, פונקציות ניהוליות לגן, Early childhood education, Preschool skills, kindergarten teacher, גננות, חינוך לגיל הרך"
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
              <span>{t('programs.ages_3_6')}</span>
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
              <Link to={`${prefix}/checkout?program=Early+Childhood+Kit`} className="btn-primary">
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
            <div className="aspect-square rounded-[80px] overflow-hidden shadow-3xl shadow-brand-green/20 border-[12px] border-white bg-white">
              <img 
                src={heroImage} 
                alt="Early Childhood Program" 
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
              const palette = ['text-brand-orange', 'text-brand-red', 'text-brand-light-blue', 'text-brand-pink', 'text-brand-yellow', 'text-brand-green'];
              const colorClass = palette[i % palette.length];
              return (
                <div key={i} className={`p-12 md:p-14 bg-slate-50 rounded-[48px] border border-slate-100 hover:border-brand-orange/30 hover:shadow-2xl transition-all group text-center lg:text-start`}>
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
                <span key={i} className={i !== 0 ? "text-brand-light-blue italic block" : "block"}>
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
                  <div className="w-12 h-12 bg-brand-light-blue/10 rounded-2xl flex items-center justify-center text-brand-light-blue shrink-0">
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
                  alt="Early Childhood Kit" 
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
            {t('nav.programs')} <span className="text-brand-orange italic"> {t('programs.gallery')}</span>
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
          <div className="bg-brand-pink/5 rounded-[80px] p-12 md:p-24 text-slate-900 border border-brand-pink/10 relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="space-y-10 text-center lg:text-start">
                <h2 className="text-[40px] md:text-7xl font-sans font-bold tracking-tighter leading-none">
                  {safeSplit(pageData.investTitle, '.').map((part: string, i: number) => (
                    <span key={i} className={`block ${i !== 0 ? "text-brand-pink italic" : ""}`}>
                      {part}
                    </span>
                  ))}
                </h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {pageData.investSubtitle}
                </p>
              </div>
              <div className="bg-white border border-brand-pink/10 rounded-[60px] p-8 md:p-16 text-center space-y-8 md:space-y-10 shadow-3xl shadow-brand-pink/5">
                <div className="space-y-4">
                  <p className="inline-block px-5 py-2 bg-brand-pink/10 text-brand-pink font-bold uppercase tracking-[0.2em] text-[10px] rounded-full">{t('programs.complete_program_kit')}</p>
                  <p className="text-slate-400 font-bold tracking-tight text-sm md:text-base">{t('programs.all_inclusive')}</p>
                </div>
                <Link to={`${prefix}/checkout?program=Early+Childhood+Kit`} className="btn-primary w-full h-16 md:h-20 text-lg md:text-xl bg-brand-pink shadow-brand-pink/20 hover:scale-[1.02] active:scale-95">
                  <span className="whitespace-nowrap">{t('programs.purchase')}</span>
                  <ArrowRight className={`w-6 h-6 md:w-8 md:h-8 ${isHe ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-brand-light-blue text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[40px] md:text-8xl font-sans font-bold mb-10 tracking-tighter leading-none">{t('programs.ready')}</h2>
          <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('programs.join')}
          </p>
          <Link to={`${prefix}/#contact`} className="inline-flex items-center gap-4 px-10 py-4 lg:px-12 lg:py-6 bg-white text-brand-light-blue font-bold md:font-semibold rounded-full text-lg lg:text-xl hover:bg-slate-50 transition-all shadow-3xl hover:-translate-y-1 active:scale-95">
            {t('programs.contact')}
            <ArrowRight className={`w-7 h-7 ${isHe ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
