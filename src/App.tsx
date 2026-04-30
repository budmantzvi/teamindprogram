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
  const { i18n } = useTranslation();
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

  const { t: translate } = useTranslation();
  const pageTitle = translate(`seo.${seoKey}.title`, { defaultValue: "TEAMIND" });
  const pageDescription = translate(`seo.${seoKey}.description`, { defaultValue: "Development of Executive Functions" });

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="he" href={heUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
    </Helmet>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.toLowerCase().startsWith('/teamind-secure-portal-2024-v2');

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
      {!isAdminPage && <Navbar />}
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
      {!isAdminPage && <Footer />}
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
