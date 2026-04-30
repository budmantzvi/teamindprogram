import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { 
  Brain, Users, Target, Zap, Clock, Heart, 
  ChevronRight, ArrowRight, MessageSquare, ShieldCheck,
  Star, Quote, Mail, Phone, MapPin, Package, Music,
  Sparkles, Layers, BookOpen, Smile, Award, Loader2, Camera, Play, Image, MessageCircle, Plus, Minus
} from "lucide-react";
import { toast } from "sonner";
import { ContactForm, Logo, SEO } from "../components/Shared";
import { ProgramFlipCard } from "../components/ProgramFlipCard";
import { useSite } from '../lib/SiteContext';
import { processOrderSuccess } from '../lib/orderUtils';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CONFIG, safeSplit, getSynchronizedCharacters, FALLBACK_IMAGES } from '../lib/constants';

const testimonials = [
  { name: "Sarah J.", role: "Preschool Teacher", text: "TEAMIND has completely changed the digital and emotional landscape of my classroom. The kids are obsessed with Driver Dan and Brainman!", image: "https://i.pravatar.cc/150?u=sarah" },
  { name: "David L.", role: "Elementary Principal", text: "Finally, a program that bridges the gap between cognitive theory and actual classroom practice. We've seen a 40% reduction in disciplinary issues.", image: "https://i.pravatar.cc/150?u=david" },
  { name: "Emily R.", role: "Parent", text: "Molly the Mirror has become my daughter's best friend. She even uses reflection techniques to calm herself down during tantrums!", image: "https://i.pravatar.cc/150?u=emily" },
  { name: "Yael Stein", role: "Special Education Expert", text: "The character-based approach makes abstract skills like 'organization' and 'inhibition' so clear to children. It's brilliant.", image: "https://i.pravatar.cc/150?u=yael" },
  { name: "Marc K.", role: "Father of two", text: "The kit is high-quality and the songs are genuinely catchy. It's rare to find an educational tool that's this engaging for the parents too.", image: "https://i.pravatar.cc/150?u=marc" },
  { name: "Maya B.", role: "Mother", text: "Before TEAMIND, my son struggled with transitions. Now, just mentioning 'Driver Dan' helps him prepare for the next activity with a smile.", image: "https://i.pravatar.cc/150?u=mayab" },
  { name: "Noam G.", role: "Educational Counselor", text: "A must-have for every school. It gives children the language they need to describe their internal cognitive state.", image: "https://i.pravatar.cc/150?u=noam" },
];

const faqs = [
  { 
    question: "What is the core philosophy of TEAMIND?", 
    answer: "TEAMIND is built on the belief that executive functions—the 'CEO of the brain'—are the most critical skills for success in learning and life. We use character-based learning to make these abstract cognitive processes concrete and accessible for children." 
  },
  { 
    question: "Which age groups is the program suitable for?", 
    answer: "We have three distinct programs: Early Childhood (Ages 3–6), Elementary (Ages 6–12), and a Parents Program for home use. Each is tailored to the developmental needs of the specific age group." 
  },
  { 
    question: "How long does it take to see results?", 
    answer: "While every child is different, many educators and parents report seeing positive changes in language and behavior within the first few weeks of consistent use. The skills build over time through repetition and practice." 
  },
  { 
    question: "Is the program based on scientific research?", 
    answer: "Yes. TEAMIND is grounded in neuro-developmental research and cognitive psychology, specifically focusing on the development of executive functions in early and middle childhood." 
  },
  { 
    question: "What's included in the physical kit?", 
    answer: "Each kit is comprehensive and includes handbooks, activity guides, posters, storybooks, original games, and a USB with audio tracks (songs, jingles, and stories). The specific contents vary by program." 
  },
];

const characters = [
  { name: "Brainman", role: "The Leader", desc: "Responsible for the human brain that controls all body functions, leading his wonderful team with wisdom.", color: "bg-brand-yellow", icon: Brain, image: "/images/brainman.png" },
  { name: "Driver Dan", role: "Focus & Shifting", desc: "Focuses and shifts attention, efficiently guiding calm and smooth transitions between activities.", color: "bg-brand-orange", icon: Brain, image: "/images/driver dan.png" },
  { name: "Lenny the Ladder", role: "Organization", desc: "A master of order and planning. Helps even the messiest learners approach and complete tasks efficiently.", color: "bg-brand-green", icon: Zap, image: "/images/lenny the ladder.png" },
  { name: "Memory Max", role: "Working Memory", desc: "He captures learning moments, helping remember daily and multi-step tasks through visual memory techniques.", color: "bg-brand-light-blue", icon: Clock, image: "/images/memory max.png" },
  { name: "Molly the Mirror", role: "Emotional Reflection", desc: "Gentle and sensitive, she reflects internal and others' feelings to help build healthy relationships.", color: "bg-brand-pink", icon: Heart, image: "/images/molly the mirror.png" },
  { name: "Stopper Stan", role: "Response Inhibition", desc: "A balanced leader who controls reactions, helping to pause and reduce impulsive behaviors.", color: "bg-brand-red", icon: ShieldCheck, image: "/images/stopper stan.png" },
];

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const { siteConfig, siteImages, t_config } = useSite();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small delay to ensure render is complete
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !location.hash) { // Handle initial load with hash if router didn't catch it
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [siteConfig, siteImages]);

  const heroBadge = t_config('heroBadge');
  const heroTitle = t_config('heroTitle');
  const heroSubtitle = t_config('heroSubtitle');
  const heroBtnPrimary = t_config('heroBtnPrimary');
  const heroBtnSecondary = t_config('heroBtnSecondary');
  
  const videoBadge = t_config('videoBadge');
  const videoTitle = t_config('videoTitle');
  const videoSubtitle = t_config('videoSubtitle');

  const aboutTitle = t_config('aboutTitle');
  const aboutText = t_config('aboutText');
  const aboutSubtext = t_config('aboutSubtext');
  const aboutFootnote = t_config('aboutFootnote');
  const foundersTitle = t_config('foundersTitle');
  const foundersSubtitle = t_config('foundersSubtitle');
  const whyTitle = t_config('whyTitle');
  const whySubtitle = t_config('whySubtitle');
  const faqTitle = t_config('faqTitle');
  const contactTitle = t_config('contactTitle');
  const contactSubtitle = t_config('contactSubtitle');
  const charactersTitle = t_config('charactersTitle');
  const charactersSubtitle = t_config('charactersSubtitle');
  
  const heroImage = siteImages.hero || FALLBACK_IMAGES.hero;
  const aboutImage = siteImages.about || FALLBACK_IMAGES.about;

  // Use localized versions of arrays if they exist in siteConfig
  const isHe = /^\/he($|\/)/.test(location.pathname);
  const prefix = isHe ? '/he' : '';
  const charactersList = t_config('charactersList');
  const whyCards = t_config('whyCards');
  const faqsList = t_config('faqs');
  const testimonialsList = t_config('testimonials');
  const foundersList = t_config('foundersMembers');

  const mergedCharacters = getSynchronizedCharacters(
    characters, 
    charactersList, 
    isHe ? DEFAULT_CONFIG.charactersList_he : DEFAULT_CONFIG.charactersList
  ).map((char: any) => {
    // Force specific updates requested by user
    if (char.name === "Memory Max" || char.name === "מוני מצלמוני") {
      return { ...char, desc: isHe ? "הוא מצלם וקולט רגעי למידה, עוזר לזכור משימות יומיות ומשימות מרובות שלבים באמצעות טכניקות זיכרון חזותיות." : "He captures learning moments, helping remember daily and multi-step tasks through visual memory techniques." };
    }
    if (char.name === "Stopper Stan" || char.name === "Stoper Stan" || char.name === "תום התמרור") {
      return { ...char, name: isHe ? "תום התמרור" : "Stopper Stan" };
    }
    return char;
  });

  const earlyData = t_config('earlyChildhood');
  const earlyDescription = earlyData?.cardDescription || "";
  
  const elementaryData = t_config('elementary');
  const elementaryDescription = elementaryData?.cardDescription || "";
  
  const parentsData = t_config('parents');
  const parentsDescription = parentsData?.cardDescription || "";

  const programsTitle = t_config('programsTitle');
  const programsSubtitle = t_config('programsSubtitle');

  const iconMap: any = {
    Award, Heart, Users, Star, Brain, Zap, Clock, ShieldCheck, Target, Sparkles, BookOpen, Layers
  };

  const contactEmail = siteConfig?.contactEmail || DEFAULT_CONFIG.contactEmail;
  const contactPhone = siteConfig?.contactPhone || DEFAULT_CONFIG.contactPhone;

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };
  const handleCheckout = async (plan: any) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.title.toLowerCase().replace(/\s+/g, '-'),
          planName: plan.title,
          price: "799"
        }),
      });

      const { url, error } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(isHe ? "האתר לא זמין כעת עד למחרת" : "The site is currently unavailable until tomorrow");
      }
    } catch (err) {
      toast.error(isHe ? "האתר לא זמין כעת עד למחרת" : "The site is currently unavailable until tomorrow");
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") && siteConfig) {
      toast.success(isHe ? "התשלום בוצע בהצלחה! ברוכים הבאים לתוכנית TEAMIND. ניצור אתכם קשר בקרוב עם פרטי הערכה." : "Payment successful! Welcome to the TEAMIND program. We'll be in touch soon with your kit details.");
      
      const lastOrderId = localStorage.getItem('last_order_id');
      if (lastOrderId) {
        processOrderSuccess(lastOrderId, siteConfig);
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [siteConfig, isHe]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-brand-pink/30 selection:text-brand-pink overflow-x-hidden">
      <SEO 
        title={t('nav.home')} 
        description="TEAMIND is a revolutionary character-based program designed to strengthen executive functions in children through music, play, and emotional connection."
        keywords="TEAMIND, teamind, טימיינד, פיתוח מיומנויות, גן, בית ספר, חינוך, גננת, מוכנות לכיתה א, פונקציות ניהוליות, למידה רגשית חברתית, SEL"
      />
      
      {/* Hero Section */}
      {(siteConfig?.showHero !== false) && (
        <section className="relative min-h-[90vh] flex items-center pt-32 md:pt-48 pb-20 overflow-hidden bg-white" aria-labelledby="hero-heading">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-light-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-pink/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
          </div>

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: isHe ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center lg:text-start"
              >
                <div className="inline-flex items-center gap-2 mb-8 group">
                  <Sparkles className="w-4 h-4 text-brand-orange transition-transform group-hover:rotate-12" />
                  <span className="text-brand-orange font-bold uppercase tracking-[0.25em] text-[10px] md:text-xs">{heroBadge}</span>
                </div>
                <h1 className="text-[44px] md:text-7xl lg:text-8xl font-serif font-medium tracking-tighter leading-[0.95] text-slate-900 mb-8">
                  {safeSplit(heroTitle, '.').map((part: string, i: number, arr: string[]) => (
                    <span key={i} className={`block ${i === arr.length - 1 ? "text-brand-green-tech italic" : ""}`}>
                      {part}{i < arr.length - 1 ? '.' : ''}
                    </span>
                  ))}
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                  {heroSubtitle}
                </p>
                <div className="flex flex-col md:flex-row items-center gap-6 justify-center lg:justify-start">
                  <Link to={`${prefix}/#program`} className="w-full md:w-auto h-14 px-10 rounded-full bg-brand-light-blue text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-light-blue/90 transition-all shadow-xl shadow-brand-light-blue/20 active:scale-95 text-lg group">
                    {heroBtnPrimary}
                    <ArrowRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${isHe ? 'rotate-180' : ''}`} />
                  </Link>
                  <Link to={`${prefix}/#contact`} className="w-full md:w-auto h-14 px-10 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center gap-2 border-2 border-slate-200 shadow-sm hover:border-brand-orange/20 transition-all text-lg active:scale-95">
                    {t('nav.contact')}
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: isHe ? -50 : 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="relative aspect-square w-full max-w-[600px] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/10 to-transparent rounded-[80px] rotate-6 -z-10" />
                  <div className="absolute inset-0 bg-white rounded-[80px] shadow-3xl overflow-hidden border border-slate-50">
                    {heroImage ? (
                      <img 
                        src={heroImage} 
                        alt="TEAMIND Hero" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <Brain className="w-16 h-16 text-slate-200" />
                      </div>
                    )}
                  </div>
                  
                  {/* Floating Info card */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-8 -left-12 bg-white p-8 rounded-[40px] shadow-2xl border border-slate-50 flex items-center gap-6 z-10"
                  >
                    <div className="w-16 h-16 bg-brand-green/10 rounded-3xl flex items-center justify-center text-brand-green">
                      <Brain className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{t('common.cognitive')}</p>
                      <p className="text-xl font-bold text-slate-900 tracking-tight leading-none">{t('common.executiveSkills')}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      {(siteConfig?.showVideo !== false) && (
        <section id="video" className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="aspect-video rounded-[64px] overflow-hidden shadow-3xl border-[10px] border-slate-50 relative group cursor-pointer bg-slate-100">
              {!isPlaying && (
                <div 
                  onClick={handlePlay}
                  className="absolute inset-0 z-10 transition-all duration-700 group-hover:scale-105"
                >
                  <img 
                    src={siteImages.videoThumbnail || FALLBACK_IMAGES.videoThumbnail} 
                    alt="Video Cover" 
                    className="w-full h-full object-cover brightness-90"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.img 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      src="/images/brainman.png" 
                      className="absolute top-10 right-10 w-24 md:w-32 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <motion.img 
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      src="/images/stopper stan.png" 
                      className="absolute bottom-20 left-10 w-20 md:w-28 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex items-end justify-between gap-6">
                    <div className="space-y-3 text-start">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{videoBadge}</span>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight">
                        {safeSplit(videoTitle, '.').map((part: string, i: number, arr: string[]) => (
                          <span key={i}>
                            {part}{i < arr.length - 1 ? '.' : ''}
                            {i < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </h3>
                      <p className="text-white/70 font-medium text-sm md:text-lg max-w-lg leading-relaxed">
                        {videoSubtitle}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-brand-green group-hover:border-brand-green group-hover:scale-110 transition-all duration-500 shadow-2xl">
                        <Play className={`w-6 h-6 md:w-8 md:h-8 fill-current ${isHe ? 'ml-0 mr-1' : 'ml-1'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                playsInline
                poster={siteImages.videoThumbnail}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src="/promo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {(siteConfig?.showAbout !== false) && (
        <section id="about" className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10 text-center lg:text-start">
                <h2 className="text-[32px] md:text-6xl font-sans font-bold md:font-medium lg:font-semibold leading-[1.1] tracking-tighter">
                  {safeSplit(aboutTitle, '.').map((part: string, i: number, arr: string[]) => (
                    <span key={i} className="block">
                      {part}{i < arr.length - 1 ? '.' : ''}
                    </span>
                  ))}
                </h2>
                <div className="space-y-6">
                  <p className="text-xl text-slate-600 leading-relaxed font-medium">
                    {aboutText}
                  </p>
                  <p className="text-lg text-slate-500 leading-relaxed">
                    {aboutSubtext}
                  </p>
                  {aboutFootnote && (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pt-8 border-t border-slate-50">
                      {aboutFootnote}
                    </p>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] md:aspect-square rounded-[64px] overflow-hidden shadow-3xl border-[12px] border-white bg-slate-50">
                  <img 
                    src={aboutImage} 
                    alt="TEAMIND Program" 
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${aboutImage ? 'opacity-100' : 'opacity-0'}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Section */}
      {(siteConfig?.showWhy !== false) && (
        <section className="py-24 md:py-32 lg:py-40 bg-slate-50">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-32">
              <h2 className="text-[32px] md:text-5xl lg:text-5xl font-serif font-medium tracking-tighter mb-8 leading-tight">
                {safeSplit(whyTitle, ' ').map((word: string, i: number, arr: string[]) => (
                  <span key={i} className={i === arr.length - 1 ? "text-brand-green-tech italic" : "block md:inline"}>
                    {word}{i < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                {whySubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-12">
              {whyCards.map((item: any, i: number) => {
                const IconComp = iconMap[item.icon] || Award;
                const palette = [
                  'bg-brand-red/10 text-brand-red', 
                  'bg-brand-orange/10 text-brand-orange', 
                  'bg-brand-light-blue/10 text-brand-light-blue'
                ];
                const colorClass = palette[i % palette.length];
                return (
                    <Link key={i} to={`${prefix}${item.link}`} className="flex flex-col p-6 sm:p-8 md:p-8 lg:p-12 bg-white rounded-[40px] md:rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2 min-h-[300px] md:min-h-[340px] lg:min-h-[320px]">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-20 lg:h-20 ${colorClass.split(' ')[0]} rounded-2xl md:rounded-[28px] flex items-center justify-center ${colorClass.split(' ')[1]} mb-6 sm:mb-8 group-hover:scale-110 transition-transform shrink-0`}>
                        <IconComp className="w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-10 lg:h-10" />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight leading-snug">{item.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed text-start text-sm md:text-sm lg:text-base flex-grow">{item.desc}</p>
                    </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Program Section */}
      {(siteConfig?.showPrograms !== false) && (
        <section id="program" className="py-24 md:py-32 lg:py-44 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-32">
              <h2 className="text-4xl md:text-6xl font-sans font-bold mb-8">
                {safeSplit(programsTitle, ' ').map((word: string, i: number, arr: string[]) => (
                  <span key={i} className={i === arr.length - 1 ? "text-brand-light-blue italic" : ""}>
                    {word}{i < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h2>
              <p className="text-xl text-slate-600 font-medium">{programsSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProgramFlipCard 
                title={t_config('earlyChildhood.title')}
                description={t_config('earlyChildhood.cardDescription')}
                link={`${prefix}/early-childhood`}
                image={siteImages.earlyHero}
                color="bg-brand-green"
              />
              <ProgramFlipCard 
                title={t_config('elementary.title')}
                description={t_config('elementary.cardDescription')}
                link={`${prefix}/elementary`}
                image={siteImages.elementaryHero}
                color="bg-brand-light-blue"
              />
              <ProgramFlipCard 
                title={t_config('parents.title')}
                description={t_config('parents.cardDescription')}
                link={`${prefix}/parents`}
                image={siteImages.parentsHero}
                color="bg-brand-red"
              />
            </div>
          </div>
        </section>
      )}

      {/* Characters Section */}
      {(siteConfig?.showCharacters !== false) && (
        <section id="characters" className="py-24 md:py-32 lg:py-44 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 lg:mb-32 text-start">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-sans font-bold mb-8">
                  {safeSplit(charactersTitle, ' ').map((word: string, i: number, arr: string[]) => (
                    <span key={i} className={i === arr.length - 1 ? "text-brand-orange italic" : ""}>
                      {word}{i < arr.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h2>
                <p className="text-xl text-slate-600 font-medium">{charactersSubtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mergedCharacters.map((char: any, i: number) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group"
                >
                  <div className="relative w-40 h-40 mb-8 mx-auto">
                    <div className={`absolute inset-0 ${char.color} rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-20`} />
                    <div className="relative w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-1">
                      <img 
                        src={char.image} 
                        alt={char.name}
                        className="w-full h-full object-contain scale-125 transition-opacity duration-500 opacity-100"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-sans font-bold mb-2 text-center text-slate-900 transition-colors uppercase tracking-tight">{char.name}</h3>
                  <p className="text-brand-pink text-xs font-bold uppercase tracking-widest mb-4 text-center">{char.role}</p>
                  <p className="text-slate-600 font-medium leading-relaxed text-center line-clamp-3 lg:line-clamp-none overflow-hidden h-20 lg:h-auto">
                    {char.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Marquee */}
      {(siteConfig?.showSuccessStories !== false) && (
        <section className="py-24 md:py-32 lg:py-40 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 mb-16 lg:mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-center tracking-tighter">
              {t('home.successStoriesTitle')} <span className="text-brand-light-blue italic">{t('home.successStoriesSubtitle')}</span>
            </h2>
          </div>
          
          <div className="relative flex overflow-x-hidden" dir="ltr">
            <div 
              className="py-12 animate-marquee flex whitespace-nowrap"
              style={{ animationPlayState: isMarqueePaused ? 'paused' : 'running' }}
            >
              {[...testimonialsList, ...testimonialsList].map((t: any, i: number) => (
                <div 
                  key={i} 
                  className={`mx-4 w-[85vw] md:w-[450px] p-10 md:p-12 bg-slate-50 rounded-[48px] border border-slate-100 flex flex-col gap-8 shrink-0 transition-all ${isHe ? 'text-right' : 'text-left'}`}
                  dir={isHe ? 'rtl' : 'ltr'}
                  onMouseEnter={() => setIsMarqueePaused(true)}
                  onMouseLeave={() => setIsMarqueePaused(false)}
                >
                  <p className="text-slate-600 text-lg md:text-xl font-medium italic leading-relaxed whitespace-normal">"{t.text}"</p>
                  <div className={`flex items-center gap-6 mt-auto ${isHe ? 'flex-row-reverse' : ''}`}>
                    <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover shadow-md border-4 border-white" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    <div className={isHe ? 'text-right' : 'text-left'}>
                      <h4 className="font-bold text-slate-900 text-lg">{t.name}</h4>
                      <p className="text-xs text-brand-orange font-bold uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Founders Section */}
      {(siteConfig?.showFounders !== false) && (
        <section id="founders" className="py-24 md:py-32 lg:py-40 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-32">
              <h2 className="text-[32px] md:text-5xl lg:text-5xl font-sans font-bold md:font-medium lg:font-semibold mb-8 leading-[1.1] tracking-tighter">
                {safeSplit(foundersTitle, '.').map((part: string, i: number, arr: string[]) => (
                  <span key={i} className="block">
                    {part}{i < arr.length - 1 ? '.' : ''}
                  </span>
                ))}
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                {foundersSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {foundersList.map((member: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-slate-50 rounded-[56px] overflow-hidden border border-slate-100 hover:shadow-3xl transition-all duration-700 text-center lg:text-start"
                >
                  <div className="p-10 md:p-14 flex flex-col justify-center gap-8">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tighter">{member.name}</h3>
                      <p className="inline-block px-4 py-1.5 bg-brand-green/10 text-brand-green font-bold uppercase tracking-widest text-[10px] rounded-full">{member.role}</p>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed text-base md:text-lg">
                      {member.desc}
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-6 border-t border-slate-200/50">
                      {member.stats.map((stat: string, j: number) => (
                        <div key={j} className="px-5 py-2 bg-white rounded-2xl border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
      )}

      {/* FAQ Section */}
      {(siteConfig?.showFaq !== false) && (
        <section className="py-24 md:py-32 lg:py-40 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-sans font-bold mb-16 lg:mb-24 text-center tracking-tighter">
              {safeSplit(faqTitle, ' ').map((word: string, i: number, arr: string[]) => (
                <span key={i} className={i === arr.length - 1 ? "text-brand-pink italic" : ""}>
                  {word}{i < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <div className="space-y-4">
              {faqsList.map((faq: any, i: number) => (
                <div key={i} className="border border-slate-100 rounded-[32px] overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-lg font-bold text-slate-900">{faq.question}</span>
                    {activeFaq === i ? <Minus className="w-5 h-5 text-brand-orange" /> : <Plus className="w-5 h-5 text-brand-orange" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-6 text-slate-600 font-medium leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(siteConfig?.showContact !== false) && (
        <section id="contact" className="py-24 md:py-32 lg:py-40 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-[80px] overflow-hidden shadow-3xl border border-slate-100 grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 md:p-24 space-y-12 flex flex-col justify-center text-center lg:text-start">
                <div className="space-y-8">
                  <h2 className="text-[40px] md:text-7xl font-sans font-bold leading-none tracking-tighter">
                    {safeSplit(contactTitle, '.').map((part: string, i: number, arr: string[]) => (
                      <span key={i} className={`block ${i === 0 ? "text-brand-red" : ""}`}>
                        {part}{i < arr.length - 1 ? '.' : ''}
                      </span>
                    ))}
                  </h2>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">{contactSubtitle}</p>
                </div>
                
                <div className="flex flex-col gap-6 w-full max-w-sm mx-auto lg:mx-0">
                  <a 
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary bg-brand-light-blue hover:bg-brand-light-blue/90 shadow-brand-light-blue/20"
                  >
                    <Mail className="w-6 h-6" />
                    <span className="font-bold">{t('footer.emailUs', { defaultValue: 'Email Us' })}</span>
                  </a>
                  
                  <a 
                    href={`https://wa.me/${contactPhone.replace(/\+/g, '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary bg-[#25D366] hover:bg-[#20bd5c] shadow-[#25D366]/20 border-none"
                  >
                    <MessageCircle className="w-6 h-6 text-white" />
                    <span className="font-bold text-white">{t('footer.whatsappUs', { defaultValue: 'WhatsApp Us' })}</span>
                  </a>
                </div>
              </div>
              <div className="p-12 md:p-24 bg-slate-50/50">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
