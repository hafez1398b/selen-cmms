import { useState, useEffect } from 'react';
import { I } from './Icon';

export function OnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 4000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowBanner(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner && online) return null;

  return (
    <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 transition-all ${
      online
        ? 'bg-emerald-500/95 text-white border border-emerald-300'
        : 'bg-amber-500/95 text-ink-900 border border-amber-200'
    }`}>
      {online ? (
        <>
          <I.Check size={14} />
          <span>اتصال برقرار شد — همگام‌سازی فعال</span>
        </>
      ) : (
        <>
          <I.Alert size={14} />
          <span>حالت آفلاین — همه قابلیت‌ها در دسترس‌اند، داده‌ها در دستگاه ذخیره می‌شوند</span>
        </>
      )}
    </div>
  );
}
