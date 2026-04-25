import { useTranslation } from 'react-i18next';
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface ProgramFlipCardProps {
  title: string;
  description: string;
  link: string;
  image: string;
  color: string;
}

export const ProgramFlipCard = ({ title, description, link, image, color }: ProgramFlipCardProps) => {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';
  const prefix = isHe ? '/he' : '';

  return (
    <div className="group h-[480px] md:h-[420px] lg:h-[480px] [perspective:1000px]">
      <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front Side */}
        <div className="absolute inset-0 h-full w-full rounded-[40px] overflow-hidden shadow-xl">
          <img 
            src={image} 
            alt={title} 
            className={`h-full w-full object-cover transition-opacity duration-500 ${image ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">{title}</h3>
            <div className="flex items-center text-white/80 text-sm font-bold uppercase tracking-widest group-hover:text-white transition-colors">
              {t('common.learnMore', { defaultValue: 'Learn More' })} <ChevronRight className={`w-4 h-4 ${isHe ? 'mr-1 rotate-180' : 'ml-1'}`} />
            </div>
          </div>
        </div>
 
        {/* Back Side */}
        <div className={`absolute inset-0 h-full w-full rounded-[40px] ${color} p-6 md:p-8 flex flex-col justify-center items-center text-center text-white [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl`}>
          <h3 className="text-xl md:text-2xl font-serif font-bold mb-4 shrink-0">{title}</h3>
          <div className="flex-1 overflow-y-auto w-full mb-6 md:mb-8 custom-scrollbar">
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
              {description}
            </p>
          </div>
          <Link 
            to={`${prefix}${link}`} 
            className="shrink-0 px-6 md:px-8 py-3 md:py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-all active:scale-95 text-sm md:text-base"
          >
            {t('common.goToProgram', { defaultValue: 'Go to Program Page' })}
          </Link>
        </div>
      </div>
    </div>
  );
};
