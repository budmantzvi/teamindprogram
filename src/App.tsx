import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Navbar, Footer } from "./components/Shared";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import Home from "./pages/Home";
import About from "./pages/About";
import EarlyChildhood from "./pages/EarlyChildhood";
import Elementary from "./pages/Elementary";
import Parents from "./pages/Parents";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function LanguageHandler() {
  const location = useLocation();
  const { i18n, t: translate } = useTranslation();
  const isHebrew = /^\/he($|\/)/.test(location.pathname);
  const isAdminPath = location.pathname.startsWith('/teamind-secure-portal-2024-v2');
  const lang = isHebrew ? 'he' : 'en';

  useEffect(() => {
    if (isAdminPath) return; // Don't enforce language on admin path
    
    // Check if we need to switch i18n
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = isHebrew ? 'rtl' : 'ltr';
  }, [lang, i18n, location.pathname, isHebrew, isAdminPath]);

  const baseUrl = "https://teamindprogram.com";
  const pathWithoutLang = isHebrew ? location.pathname.replace('/he', '') || '/' : location.pathname;
  const enUrl = `${baseUrl}${pathWithoutLang}${location.hash}`;
  const heUrl = `${baseUrl}/he${pathWithoutLang === '/' ? '' : pathWithoutLang}${location.hash}`;
  const canonicalUrl = isHebrew ? heUrl : enUrl;

  // Determine SEO strings based on path
  let seoKey = "home";
  if (pathWithoutLang === "/about") seoKey = "about";
  else if (pathWithoutLang === "/early-childhood") seoKey = "earlyChildhood";
  else if (pathWithoutLang === "/elementary") seoKey = "elementary";
  else if (pathWithoutLang === "/parents") seoKey = "parents";

  const pageTitle = translate(`seo.${seoKey}.title`, { 
    defaultValue: isHebrew 
      ? "TEAMIND (טימיינד) | תוכנית פיתוח פונקציות ניהוליות ומיומנויות למידה" 
      : "TEAMIND Program | Executive Functions & Learning Skills Development" 
  });
  const pageDescription = translate(`seo.${seoKey}.description`, { 
    defaultValue: isHebrew 
      ? "תוכנית טימיינד (TEAMIND / teamindprogram) היא התוכנית המובילה לפיתוח פונקציות ניהוליות, כישורי למידה, וויסות עצמי ואינטליגנציה רגשית אצל ילדים." 
      : "TEAMIND (teamindprogram / teamind program) is a leading character-based program designed to strengthen executive functions in children." 
  });

  const keywordsStr = isHebrew
    ? "TEAMIND, Teamind, teamind, team mind, Team Mind, TEAM MIND, team mind program, teamind program, teamindprogram, טימיינד, תוכנית טימיינד, טי מיינד, יניפר בודמן, שרה אלחרר, פיתוח הילד, פונקציות ניהוליות, מיומנויות למידה, מוכנות לכיתה א, ערכות פדגוגיות, SEL, למידה רגשית חברתית, וויסות עצמי"
    : "teamind, team mind, Team Mind, team mind program, teamind program, teamindprogram, TEAMIND, Teamind, טימיינד, executive functions, learning skills, cognitive development, child development, SEL, pedagogical kits, early childhood education";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "inLanguage": isHebrew ? "he-IL" : "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "name": isHebrew ? "TEAMIND - טימיינד" : "TEAMIND Program",
      "url": "https://teamindprogram.com/",
      "alternateName": ["TEAMIND", "teamind", "team mind", "Team Mind", "team mind program", "teamind program", "teamindprogram", "טימיינד", "תוכנית טימיינד", "טי מיינד"]
    }
  };

  return (
    <Helmet>
      <html lang={lang} dir={isHebrew ? 'rtl' : 'ltr'} />
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywordsStr} />
      
      {/* Canonical & Language Alternates */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="he" href={heUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />

      {/* Universal Icons */}
      <link rel="shortcut icon" href="https://teamindprogram.com/favicon.ico" type="image/x-icon" />
      <link rel="icon" href="https://teamindprogram.com/favicon.ico" type="image/x-icon" />
      <link rel="icon" type="image/png" sizes="16x16" href="https://teamindprogram.com/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="https://teamindprogram.com/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="https://teamindprogram.com/android-chrome-192x192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="https://teamindprogram.com/android-chrome-512x512.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="https://teamindprogram.com/apple-touch-icon.png" />
      <link rel="manifest" href="https://teamindprogram.com/manifest.json" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={isHebrew ? "TEAMIND - טימיינד" : "TEAMIND Program"} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:locale" content={isHebrew ? "he_IL" : "en_US"} />
      <meta property="og:image" content="https://teamindprogram.com/android-chrome-512x512.png" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content="https://teamindprogram.com/android-chrome-512x512.png" />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
}

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  
  const isAdminPage = pathname.startsWith('/teamind-secure-portal-2024-v2');
  const isCheckoutPage = pathname.endsWith('/checkout') || pathname === '/checkout';
  const isSuccessPage = pathname.endsWith('/success') || pathname === '/success';
  
  const hideLayout = isAdminPage || isCheckoutPage || isSuccessPage;

  useEffect(() => {
    if (isAdminPage) {
      console.log("[App] Admin portal detected:", location.pathname);
    }
  }, [isAdminPage, location.pathname]);

  return (
    <>
      <LanguageHandler />
      <ScrollToHash />
      <Analytics />
      <Toaster position="top-center" richColors />
      {!hideLayout && <Navbar />}
      <main>
        <Routes>
          {/* Admin Route - Handled first and separately to avoid interference */}
          <Route path="/teamind-secure-portal-2024-v2/*" element={<Admin />} />

          {/* Hebrew Routes */}
          <Route path="/he">
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="early-childhood" element={<EarlyChildhood />} />
            <Route path="elementary" element={<Elementary />} />
            <Route path="parents" element={<Parents />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<Success />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<Navigate to="/he" replace />} />
          </Route>

          {/* English Routes (Root) */}
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="early-childhood" element={<EarlyChildhood />} />
            <Route path="elementary" element={<Elementary />} />
            <Route path="parents" element={<Parents />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<Success />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
