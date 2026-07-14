import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Render app first
const rootEl = document.getElementById("root");
if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    // Last-resort fallback: render an error screen instead of a blank page
    console.error('Render failed:', err);
    rootEl.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Vazirmatn,system-ui,sans-serif;direction:rtl;background:#06060a;color:#ededf0;">
        <div style="max-width:500px;width:100%;padding:24px;border-radius:16px;background:rgba(31,31,37,0.95);border:1px solid rgba(245,158,11,0.35);">
          <h1 style="color:#ffcb4d;font-size:20px;font-weight:800;margin-bottom:12px;">خطای بارگذاری</h1>
          <p style="color:#b4b4bf;font-size:13px;line-height:1.7;margin-bottom:16px;">برنامه با خطا مواجه شد. لطفاً روی دکمه زیر کلیک کنید تا داده‌های قدیمی پاک شده و برنامه مجدد بارگذاری شود.</p>
          <button onclick="(function(){try{Object.keys(localStorage).forEach(k=>k.includes('baspar')&&localStorage.removeItem(k));if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>{rs.forEach(r=>r.unregister());if('caches' in window){caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>location.reload(true))}else location.reload(true)})}else{if('caches' in window)caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>location.reload(true));else location.reload(true)}}catch(e){location.reload(true)}})()"
            style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#fff1c7,#ffb524,#b45309);color:#0d0d11;font-weight:700;cursor:pointer;font-size:14px;">
            🔄 پاک‌سازی و بارگذاری مجدد
          </button>
          <pre style="margin-top:16px;padding:10px;background:#000;color:#fda4af;font-size:11px;border-radius:6px;direction:ltr;text-align:left;overflow:auto;max-height:120px;">${String(err)}</pre>
        </div>
      </div>
    `;
  }
}

// Register service worker for PWA / offline support
// IMPORTANT: When SW is updated, automatically refresh the page to get the new version
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('✓ Service Worker registered', reg.scope);

        // Check for updates every minute
        setInterval(() => { reg.update().catch(() => { /* ignore */ }); }, 60000);

        // When a new SW is found, take control immediately
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — skip waiting & reload
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });

    // When SW takes control of the page, reload to get fresh assets
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

// Helper for users to manually clear all caches (callable from devtools as window.resetApp())
function resetApp() {
  try {
    Object.keys(localStorage).forEach(k => k.includes('baspar') && localStorage.removeItem(k));
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    }
    if ('caches' in window) {
      caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(() => { location.reload(); });
    } else {
      location.reload();
    }
  } catch {
    location.reload();
  }
}
(window as unknown as { resetApp: () => void }).resetApp = resetApp;
