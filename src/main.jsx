import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined') {
  window.__deferredPwaPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__deferredPwaPrompt = e;
    window.dispatchEvent(new Event('pwa-prompt-ready'));
  });
  window.addEventListener('appinstalled', () => {
    window.__deferredPwaPrompt = null;
    window.dispatchEvent(new Event('pwa-app-installed'));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
