import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useApp } from '../lib/store';
import { Logo } from '../components/Logo';
import { I } from '../components/Icon';
import { faNum, formatJalali, timeAgo } from '../lib/utils';
import { useToast } from '../components/Toast';

export type NavKey =
  | 'dashboard' | 'equipment' | 'workorders' | 'pm' | 'pm_analytics' | 'planning'
  | 'service_request' | 'personnel' | 'inventory' | 'suppliers' | 'reports'
  | 'ai' | 'notifications' | 'excel' | 'audit' | 'settings'
  | 'admin_users' | 'help' | 'profile';

interface NavItem { key: NavKey; label: string; icon: keyof typeof I; group?: string; adminOnly?: boolean; }

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'داشبورد اجرایی', icon: 'Dashboard', group: 'اصلی' },
  { key: 'equipment', label: 'درخت تجهیزات', icon: 'Tree', group: 'دارایی' },
  { key: 'workorders', label: 'دستور کارها', icon: 'Wrench', group: 'عملیات' },
  { key: 'service_request', label: 'درخواست تعمیرات و خدمات', icon: 'Alert', group: 'عملیات' },
  { key: 'pm', label: 'نگهداری پیشگیرانه', icon: 'Calendar', group: 'عملیات' },
  { key: 'pm_analytics', label: 'شاخص‌های KPI', icon: 'Activity', group: 'عملیات' },
  { key: 'planning', label: 'مرکز برنامه‌ریزی', icon: 'Activity', group: 'عملیات' },
  { key: 'personnel', label: 'پرسنل و تیم', icon: 'Users', group: 'منابع' },
  { key: 'inventory', label: 'انبار و قطعات', icon: 'Box', group: 'منابع' },
  { key: 'suppliers', label: 'تأمین‌کنندگان', icon: 'Factory', group: 'منابع' },
  { key: 'reports', label: 'گزارش‌ها', icon: 'Doc', group: 'تحلیل' },
  { key: 'ai', label: 'مرکز هوش مصنوعی', icon: 'AI', group: 'تحلیل' },
  { key: 'notifications', label: 'مرکز اعلانات', icon: 'Bell', group: 'سیستم' },
  { key: 'excel', label: 'انبار فایل‌های اکسل', icon: 'Folder', group: 'سیستم' },
  { key: 'audit', label: 'لاگ‌های ممیزی', icon: 'Shield', group: 'سیستم' },
  { key: 'admin_users', label: 'مدیریت کاربران', icon: 'Shield', group: 'سیستم', adminOnly: true },
  { key: 'profile', label: 'پروفایل من', icon: 'Users', group: 'سیستم' },
  { key: 'settings', label: 'تنظیمات', icon: 'Cog', group: 'سیستم' },
  // راهنما در پایین‌ترین موقعیت
  { key: 'help', label: 'راهنمای سامانه', icon: 'Doc', group: 'راهنما' },
];

interface ShellProps {
  active: NavKey;
  setActive: (k: NavKey) => void;
  children: ReactNode;
}

export function Shell({ active, setActive, children }: ShellProps) {
  const { currentUser, logout, theme, setTheme, notifications, markAllNotificationsRead, markNotificationRead, pendingRequests, company } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('baspar_sidebar_collapsed') === '1'; } catch { return false; }
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const notifRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const toggleCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { localStorage.setItem('baspar_sidebar_collapsed', next ? '1' : '0'); } catch { /* */ }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-close notification dropdown on click outside
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [notifOpen]);

  const isAdmin = currentUser?.role === 'admin';
  const visibleNav = NAV.filter(n => !n.adminOnly || isAdmin);
  const pendingCount = pendingRequests.filter(r => r.status === 'pending').length;
  const unread = notifications.filter(n => !n.read).length;
  const groups = Array.from(new Set(visibleNav.map(n => n.group ?? '')));
  const activeItem = visibleNav.find(n => n.key === active);

  const handleNav = (k: NavKey) => {
    setActive(k);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 right-0 h-screen z-40 surface border-l border-amber-500/15 flex flex-col transition-all duration-300 lg:relative ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'w-[68px]' : 'w-72'}`}>
        <div className={`flex items-center gap-3 border-b border-amber-500/15 transition-all ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-5 py-4'}`}>
          <Logo size={sidebarCollapsed ? 36 : 42} />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-display text-base text-gold-gradient truncate">{company.nameEn.toUpperCase()}</div>
              <div className="text-[11px] text-amber-300/80 truncate">{company.name}</div>
            </div>
          )}
          <button className="lg:hidden p-1.5 rounded-lg text-amber-300 hover:bg-amber-500/10" onClick={() => setSidebarOpen(false)}>
            <I.X />
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute top-[68px] -left-3 w-6 h-6 rounded-full bg-amber-500 text-ink-900 items-center justify-center shadow-lg hover:scale-110 transition z-10"
          title={sidebarCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
        >
          <I.Chevron size={12} className={sidebarCollapsed ? 'rotate-180' : ''} />
        </button>

        <nav className={`flex-1 overflow-y-auto py-3 space-y-3 ${sidebarCollapsed ? 'px-1.5' : 'px-2'}`}>
          {groups.map(g => (
            <div key={g}>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-bold text-amber-300/60 uppercase tracking-widest px-3 mb-1">{g}</div>
              )}
              {sidebarCollapsed && (
                <div className="h-px bg-amber-500/15 mx-2 mb-2" />
              )}
              <div className="space-y-0.5">
                {visibleNav.filter(n => (n.group ?? '') === g).map(item => {
                  const Icon = I[item.icon];
                  const isActive = active === item.key;
                  const badge = item.key === 'notifications' ? unread
                    : item.key === 'admin_users' ? pendingCount
                      : 0;
                  return (
                    <button key={item.key} onClick={() => handleNav(item.key)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 rounded-xl text-sm transition group relative ${
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'btn-gold shadow-lg'
                          : 'text-ink-200 hover:bg-amber-500/10 hover:text-amber-200'
                      }`}>
                      <Icon size={17} />
                      {!sidebarCollapsed && <span className="flex-1 text-right">{item.label}</span>}
                      {badge > 0 && (
                        <span className={`text-[10px] rounded-full px-1.5 min-w-[18px] text-center font-bold ${
                          sidebarCollapsed ? 'absolute -top-1 -left-1' : ''
                        } ${isActive ? 'bg-ink-900 text-amber-300' : 'bg-rose-500 text-white'}`}>
                          {faNum(badge)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`border-t border-amber-500/15 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => handleNav('profile')} title={currentUser?.name}>
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-amber-400/40" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900">
                    {currentUser?.name.charAt(0)}
                  </div>
                )}
              </button>
              <button onClick={() => { logout(); toast.push('خروج موفق', 'info'); }}
                className="p-2 rounded-lg text-amber-300 hover:bg-rose-500/10 hover:text-rose-300" title="خروج">
                <I.Logout size={16} />
              </button>
            </div>
          ) : (
            <div className="surface-soft rounded-xl p-3 flex items-center gap-3">
              <button onClick={() => handleNav('profile')} className="shrink-0" title="مشاهده پروفایل">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-amber-400/40" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900 hover:scale-105 transition">
                    {currentUser?.name.charAt(0)}
                  </div>
                )}
              </button>
              <button onClick={() => handleNav('profile')} className="flex-1 min-w-0 text-right">
                <div className="text-sm font-semibold truncate hover:text-amber-200 transition">{currentUser?.name}</div>
                <div className="text-[11px] text-amber-300/80 truncate">{currentUser?.jobTitle}</div>
              </button>
              <button onClick={() => { logout(); toast.push('خروج موفق', 'info'); }}
                className="p-2 rounded-lg text-amber-300 hover:bg-rose-500/10 hover:text-rose-300" title="خروج">
                <I.Logout size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 backdrop-blur surface border-b border-amber-500/15">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            <button className="lg:hidden p-2 rounded-lg text-amber-300 hover:bg-amber-500/10" onClick={() => setSidebarOpen(true)}>
              <I.Dashboard />
            </button>

            <div className="lg:hidden flex items-center">
              <Logo size={36} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-amber-300/70">
                <span>بسپارفوم غرب</span>
                <I.Chevron size={10} className="rotate-180" />
                <span>{activeItem?.group}</span>
              </div>
              <h1 className="font-bold text-base sm:text-lg text-gold-gradient truncate">{activeItem?.label}</h1>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl surface-soft text-xs">
              <I.Calendar size={14} className="text-amber-400" />
              <span className="text-ink-200">{formatJalali(now, true)}</span>
            </div>

            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(v => !v)} className="relative p-2.5 rounded-xl surface-soft text-amber-300 hover:bg-amber-500/10">
                <I.Bell size={18} />
                {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center pulse-gold">{faNum(unread)}</span>}
              </button>
              {notifOpen && (
                <div className="absolute left-0 mt-2 w-[360px] max-h-[70vh] surface ring-gold rounded-2xl overflow-hidden z-30 flex flex-col fade-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/15">
                    <h4 className="font-bold text-sm text-gold-gradient">اعلانات</h4>
                    <button onClick={() => { markAllNotificationsRead(); setNotifOpen(false); }} className="text-[11px] text-amber-300 hover:text-amber-200">علامت‌گذاری همه</button>
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-amber-500/10">
                    {notifications.length === 0 && <div className="p-6 text-center text-sm text-ink-400">اعلانی موجود نیست</div>}
                    {notifications.slice(0, 12).map(n => (
                      <button key={n.id} onClick={() => { markNotificationRead(n.id); setNotifOpen(false); }} className={`block w-full text-right px-4 py-3 hover:bg-amber-500/5 ${!n.read ? 'bg-amber-500/5' : ''}`}>
                        <div className="flex items-start gap-2">
                          {!n.read && <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-ink-100">{n.title}</div>
                            <div className="text-xs text-ink-300 mt-0.5 leading-5">{n.body}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-amber-300/80">{timeAgo(n.at)}</span>
                              <div className="flex gap-1">
                                {n.channel.map(c => (
                                  <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/80">{c}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl surface-soft text-amber-300 hover:bg-amber-500/10" title="تغییر تم">
              {theme === 'dark' ? <I.Sun size={18} /> : <I.Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 fade-in">
          {children}
        </main>

        <footer className="px-6 py-4 text-center text-[11px] text-ink-500 border-t border-amber-500/10">
          بسپارفوم غرب — پلتفرم هوشمند CMMS/EAM v2.0 — ساخته‌شده برای بهره‌برداری روزانه صنعتی
        </footer>
      </div>
    </div>
  );
}
