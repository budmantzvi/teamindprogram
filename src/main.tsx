import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { SiteProvider } from './lib/SiteContext';
import App from './App.tsx';
import './index.css';
import './i18n';

/* 
// Google Analytics Initialization
const GA_ID = import.meta.env.VITE_GA_ID;
if (GA_ID) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `;
  document.head.appendChild(inlineScript);
}
*/

// Global error listener to help debug generic "Script error."
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    console.warn('Generic "Script error." detected. This is often caused by an Ad-Blocker blocking a cross-origin script (like Google Translate or Analytics). Try disabling your Ad-Blocker or using Incognito mode.');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <SiteProvider>
        <App />
      </SiteProvider>
    </HelmetProvider>
  </StrictMode>,
);
