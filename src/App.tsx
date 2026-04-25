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
  const isHebrew = location.pathname.startsWith('/he');
  const lang = isHebrew ? 'he' : 'en';

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = isHebrew ? 'rtl' : 'ltr';
  }, [lang, i18n]);

  const baseUrl = "https://teamindprogram.com";
  const pathWithoutLang = isHebrew ? location.pathname.replace('/he', '') || '/' : location.pathname;
  const enUrl = `${baseUrl}${pathWithoutLang}${location.hash}`;
  const heUrl = `${baseUrl}/he${pathWithoutLang === '/' ? '' : pathWithoutLang}${location.hash}`;

  return (
    <Helmet>
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="he" href={heUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
    </Helmet>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/teamind-secure-portal-2024-v2');

  return (
    <>
      <LanguageHandler />
      <ScrollToHash />
      <Analytics />
      <Toaster position="top-center" richColors />
      {!isAdminPage && <Navbar />}
      <main>
        <Routes>
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

          {/* Admin Route - Keep it outside localization logic if possible, or just ignore prefix */}
          <Route path="/teamind-secure-portal-2024-v2" element={<Admin />} />
          
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
