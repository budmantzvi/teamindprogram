import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, collection, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import { DEFAULT_CONFIG, deepMergeConfig, migrateConfig } from './constants';
import { useTranslation } from 'react-i18next';

interface SiteContextType {
  siteConfig: any;
  siteImages: any;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  t_config: (key: string) => any;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<any>(DEFAULT_CONFIG);
  const [siteImages, setSiteImages] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('cached_site_images');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("localStorage is not available.");
    }
    return {};
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fetchedRef = useRef(false);
  const { i18n } = useTranslation();

  // Helper to get translated config fields
  const t_config = (key: string): any => {
    const isHe = i18n.language === 'he';
    
    // Handle nested paths like 'earlyChildhood.title'
    if (key.includes('.')) {
      const parts = key.split('.');
      const parent = parts[0];
      const child = parts[1];
      
      const parentKey_he = `${parent}_he`;
      const parentObj = siteConfig?.[isHe ? parentKey_he : parent] || siteConfig?.[parent] || DEFAULT_CONFIG[isHe ? parentKey_he : parent] || DEFAULT_CONFIG[parent];
        
      if (!parentObj) return "";
      
      const childKey_he = `${child}_he`;
      
      if (isHe && parentObj[childKey_he] !== undefined) return parentObj[childKey_he];
      if (parentObj[child] !== undefined) return parentObj[child];
      
      return "";
    }

    const localizedKey = isHe ? `${key}_he` : key;
    
    if (siteConfig && siteConfig[localizedKey] !== undefined) return siteConfig[localizedKey];
    if (siteConfig && siteConfig[key] !== undefined) return siteConfig[key];
    if (DEFAULT_CONFIG[localizedKey] !== undefined) return DEFAULT_CONFIG[localizedKey];
    return DEFAULT_CONFIG[key] || "";
  };

  useEffect(() => {
    // Set initial direction and keep it synced
    const isA = window.location.pathname.includes('/teamind-secure-portal');
    
    if (isA) {
      // Force Admin to be English and LTR Always
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
    } else {
      const lang = i18n.language || 'en';
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [i18n.language, window.location.pathname]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      const isA = window.location.pathname === '/teamind-secure-portal-2024-v2';
      if (isA) toast.error("You are offline. Some content may not be available.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let unsubConfig = () => {};
    let unsubImages = () => {};

    try {
      setLoading(true);

      // Realtime listener for website config
      unsubConfig = onSnapshot(doc(db, 'config', 'site'), (configSnap) => {
        setLoading(false);
        setError(null);
        if (configSnap.exists()) {
          const data = configSnap.data();
          const { images: _ignored, ...rest } = data;
          const migrated = migrateConfig(rest);
          const finalConfig = deepMergeConfig(DEFAULT_CONFIG, migrated);
          setSiteConfig(finalConfig);

          // Admin default language setting
          if (finalConfig.defaultLanguage && 
              !localStorage.getItem('user_language_override') && 
              !window.location.pathname.includes('/teamind-secure-portal')) {
            if (i18n.language !== finalConfig.defaultLanguage) {
              i18n.changeLanguage(finalConfig.defaultLanguage);
            }
          }
        }
      }, (err: any) => {
        console.error("SiteContext Config Snapshot Error:", err);
        setLoading(false);
        const isA = window.location.pathname === '/teamind-secure-portal-2024-v2';
        if (err.code === 'resource-exhausted') {
          setError("Daily database limit reached (Quota Exceeded).");
          if (isA) toast.error("Daily database limit reached. Some content may not load.");
        } else if (!navigator.onLine) {
          setError("No internet connection.");
        } else {
          setError("Failed to load site configuration.");
        }
      });

      // Realtime listener for site images
      unsubImages = onSnapshot(collection(db, 'siteImages'), (imagesSnap) => {
        const imagesData: any = {};
        imagesSnap.forEach(doc => {
          imagesData[doc.id] = doc.data().url;
        });
        
        if (Object.keys(imagesData).length > 0) {
          setSiteImages(imagesData);
          try {
            localStorage.setItem('cached_site_images', JSON.stringify(imagesData));
          } catch (e) {}
        }
      }, (err) => {
        console.error("SiteContext Images Snapshot Error:", err);
      });

    } catch (err) {
      console.error("SiteContext Init Error:", err);
      setLoading(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubConfig();
      unsubImages();
    };
  }, []);

  const isAdminPage = window.location.pathname === '/teamind-secure-portal-2024-v2';

  return (
    <SiteContext.Provider value={{ siteConfig, siteImages, loading, error, isOnline, t_config }}>
      {error && isAdminPage && (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white text-xs font-bold py-2 px-4 text-center z-[9999] shadow-lg flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {!isOnline && isAdminPage && (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white text-[10px] font-black py-1 text-center z-[9999] uppercase tracking-widest">
          Offline Mode - Some features may be limited
        </div>
      )}
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
