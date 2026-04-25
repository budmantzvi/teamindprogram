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

export default function Parents() {
  const { siteConfig, siteImages, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';
  const prefix = isHe ? '/he' : '';

  const pageData = {
    title: t_config('parents.title'),
    subtitle: t_config('parents.subtitle'),
    description: t_config('parents.description'),
    detailsTitle: t_config('parents.detailsTitle'),
    kitTitle: t_config('parents.kitTitle'),
    kitSubtitle: t_config('parents.kitSubtitle'),
    investTitle: t_config('parents.investTitle'),
    investSubtitle: t_config('parents.investSubtitle'),
  };

  const heroImage = siteImages.parentsHero;
  const kitImage = siteImages.parentsKit;
  const galleryImages = [
    siteImages.parentsGallery1,
    siteImages.parentsGallery2,
    siteImages.parentsGallery3,
    siteImages.parentsGallery4,
    siteImages.parentsGallery5,
  ].filter(Boolean);
  
  const fallbackGallery = [
    "/images/early-1.jpeg",
    "/images/Elementary-2.jpeg",
    "/images/early-4.jpeg",
    "/images/Elementary-5.jpeg",
    "/images/early-7.png",
  ];

  const displayGallery = galleryImages.length > 0 ? galleryImages : fallbackGallery;

  const detailItems = [
    { title: t('programs.parents_detail_1_title', { defaultValue: "Quality Time" }), desc: t('programs.parents_detail_1_desc', { defaultValue: "Enjoy brain-boosting play that can involve the whole family." }), icon: Heart },
    { title: t('programs.parents_detail_2_title', { defaultValue: "Positive Habits" }), desc: t('programs.parents_detail_2_desc', { defaultValue: "Shape your child's behavior and support constructive thinking." }), icon: ShieldCheck },
    { title: t('programs.parents_detail_3_title', { defaultValue: "Emotional Intelligence" }), desc: t('programs.parents_detail_3_desc', { defaultValue: "Support emotional regulation and empathy through character-based learning." }), icon: Smile },
    { title: t('programs.parents_detail_4_title', { defaultValue: "Real-Life Flexibility" }), desc: t('programs.parents_detail_4_desc', { defaultValue: "Use characters in real-time based on what your child is dealing with." }), icon: Clock },
    { title: t('programs.parents_detail_5_title', { defaultValue: "Social Success" }), desc: t('programs.parents_detail_5_desc', { defaultValue: "Develop essential life skills for independence and social participation." }), icon: Users },
    { title: t('programs.parents_detail_6_title', { defaultValue: "Academic Foundation" }), desc: t('programs.parents_detail_6_desc', { defaultValue: "Strengthen focus and attention to prepare for academic success." }), icon: Brain },
  ];

  const kitItems = [
    { title: t('programs.kit_board_games', { defaultValue: "Board Games" }), desc: t('programs.kit_board_games_desc', { defaultValue: "Fun games for the whole family." }), icon: Smile },
    { title: t('programs.kit_catchy_songs', { defaultValue: "Catchy Songs" }), desc: t('programs.kit_catchy_songs_desc', { defaultValue: "Music that teaches cognitive skills." }), icon: Music },
    { title: t('programs.kit_exciting_stories', { defaultValue: "Exciting Stories" }), desc: t('programs.kit_exciting_stories_desc', { defaultValue: "Audio stories with character lessons." }), icon: Play },
    { title: t('programs.kit_bonus_activities', { defaultValue: "Bonus Activity Ideas" }), desc: t('programs.kit_bonus_activities_desc', { defaultValue: "Creative ways to strengthen skills." }), icon: Layers },
    { title: t('programs.kit_character_posters', { defaultValue: "Character Posters" }), desc: t('programs.kit_character_posters_desc', { defaultValue: "Visual reminders for daily life." }), icon: Image },
    { title: t('programs.kit_parent_guide', { defaultValue: "Parent Guide" }), desc: t('programs.kit_parent_guide_desc', { defaultValue: "Tips and strategies for home use." }), icon: BookOpen },
  ];

  const parentTips = [
    { num: 1, title: t('programs.tip_1_title', { defaultValue: "Repeat the Games" }), desc: t('programs.tip_1_desc', { defaultValue: "To build each executive function, repeat the game several times over a week or month for each character." }) },
    { num: 2, title: t('programs.tip_2_title', { defaultValue: "Emotional Connection" }), desc: t('programs.tip_2_desc', { defaultValue: "Replaying songs and stories frequently helps children connect emotionally to the character and internalize the skill." }) },
    { num: 3, title: t('programs.tip_3_title', { defaultValue: "Daily Reminders" }), desc: t('programs.tip_3_desc', { defaultValue: "Use the characters as gentle reminders to guide behavior in a playful way. Humor and consistency are key!" }) },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-pink/30 selection:text-brand-pink pt-32 md:pt-40">
      <SEO 
        title={t('programs.parents')} 
        description={pageData.subtitle}
        keywords="הדרכת הורים, עבודה עם ילדים בבית, ערכת הורים, מיומנויות לבית, Parenting tools, Homework skills, Home executive functions, חינוך מהבית, פיתוח הילד, טיפים להורים"
      />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: isHe ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 text-start"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-pink/10 text-brand-pink rounded-full text-xs font-bold uppercase tracking-widest leading-none">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t('programs.family')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
              {safeSplit(pageData.title, ' ').map((word: string, i: number, arr: string[]) => (
                <span key={i} className={i === arr.length - 1 ? "text-brand-pink italic" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
              {pageData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to={`${prefix}/checkout?program=Family+Kit`} className="px-10 py-5 bg-brand-pink text-white font-bold rounded-full text-lg hover:bg-brand-pink/90 transition-all hover:scale-105 shadow-xl shadow-brand-pink/20 flex items-center justify-center gap-2">
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
                alt="Family Program" 
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-start">
            {detailItems.map((item, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 hover:border-brand-pink/30 transition-colors group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-pink shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Family Kit Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{safeSplit(pageData.kitTitle, '.').map((part: string, i: number) => i === 0 ? part : <span key={i} className="text-brand-orange italic">.{part}</span>)}</h2>
            <p className="text-lg text-slate-600 font-medium">{pageData.kitSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-start">
              {kitItems.map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
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
                  alt="Family Kit" 
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
          <h2 className="text-4xl font-serif font-bold mb-16 text-center">{t('nav.programs')} <span className="text-brand-yellow italic">{t('programs.gallery')}</span></h2>
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

      {/* Tips for Parents */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-orange/10 rounded-[64px] p-12 md:p-20 border border-brand-orange/20">
            <h2 className="text-4xl font-serif font-bold mb-12 text-center">{t('programs.tipsTitle')} <span className="text-brand-orange italic">{t('programs.parents')}</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {parentTips.map((tip, i) => (
                <div key={i} className="space-y-4 text-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-orange shadow-sm font-bold text-xl">{tip.num}</div>
                  <h4 className="text-xl font-serif font-bold">{tip.title}</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-green/10 rounded-[64px] p-12 md:p-20 text-slate-900 overflow-hidden relative border border-brand-green/20">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-start">
                <h2 className="text-4xl md:text-6xl font-serif font-bold">{safeSplit(pageData.investTitle, '.').map((part: string, i: number) => i === 0 ? part : <span key={i} className="text-brand-green italic">.{part}</span>)}</h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  {pageData.investSubtitle}
                </p>
              </div>
              <div className="bg-white border border-brand-green/20 rounded-[48px] p-12 text-center space-y-8 shadow-xl shadow-brand-green/5">
                <div className="space-y-2">
                  <p className="text-brand-green font-black uppercase tracking-widest text-sm">{t('programs.complete_family_kit')}</p>
                  <p className="text-slate-400 font-bold">{t('programs.all_inclusive')}</p>
                </div>
                <Link to={`${prefix}/checkout?program=Family+Kit`} className="w-full py-5 bg-brand-green text-white font-black rounded-full text-xl hover:bg-brand-green/90 transition-all shadow-2xl shadow-brand-green/20 flex items-center justify-center gap-3">
                  {t('programs.purchase')}
                  <ArrowRight className={`w-6 h-6 ${isHe ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-orange text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{t('programs.ready')}</h2>
          <p className="text-xl text-brand-orange/10 mb-12 max-w-2xl mx-auto font-medium">
            {t('programs.join')}
          </p>
          <Link to={`${prefix}/#contact`} className="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-orange font-bold rounded-full text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl">
            {t('programs.contact')}
            <ArrowRight className={`w-5 h-5 ${isHe ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
