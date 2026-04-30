import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface ProgramFlipCardProps {
  title: string;
  description: string;
  link: string;
  image: string;
  color: string;
}

export const ProgramFlipCard = ({ title, description, link, image, color }: ProgramFlipCardProps) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const location = useLocation();
  const isHe = /^\/he($|\/)/.test(location.pathname);

  const handleToggleFlip = (e: React.MouseEvent) => {
    // Prevent flip if clicking the button/link on the back
    if (isFlipped && (e.target as HTMLElement).closest('a')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="h-[500px] [perspective:1000px] cursor-pointer"
      onClick={handleToggleFlip}
      onMouseEnter={() => !('ontouchstart' in window) && setIsFlipped(true)}
      onMouseLeave={() => !('ontouchstart' in window) && setIsFlipped(false)}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Side */}
        <div className="flip-card-front rounded-[64px] overflow-hidden shadow-3xl border-[8px] border-white bg-white">
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-10">
            <h3 className="text-3xl font-sans font-black text-white mb-4 tracking-tighter leading-none">{title}</h3>
            <div className="flex items-center text-white/70 text-xs font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">
              {t('common.learnMore', { defaultValue: 'Learn More' })} <ChevronRight className={`w-4 h-4 ${isHe ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </div>
          </div>
        </div>
 
        {/* Back Side */}
        <div className={`flip-card-back rounded-[64px] ${color} p-10 flex flex-col justify-center items-center text-center text-white shadow-3xl`}>
          <h3 className="text-3xl font-sans font-black mb-8 tracking-tighter leading-none">{title}</h3>
          <div className="flex-1 overflow-hidden w-full mb-10 flex items-center justify-center">
            <p className="text-lg text-white/90 font-medium leading-relaxed line-clamp-6">
              {description}
            </p>
          </div>
          <Link 
            to={link} 
            className="w-full h-16 shrink-0 bg-white text-slate-900 font-black rounded-full flex items-center justify-center transition-all active:scale-95 text-lg shadow-xl shadow-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            {t('common.goToProgram', { defaultValue: 'View Program' })}
          </Link>
        </div>
      </div>
    </div>
  );
};
