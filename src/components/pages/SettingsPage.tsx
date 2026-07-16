"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAppState } from "@/context/AppStateContext";
import {
  Settings, Bell, Shield, Palette, Globe, Database,
  User, LogOut, Sun, Moon, ChevronLeft, Info, Save,
  Key, Download, Upload, Eye
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type Section = "general" | "notifications" | "security" | "appearance" | "language" | "backup" | "about";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, setCurrentUser, setLoginOpen } = useAppState();
  const toast = useToast();
  const [section, setSection] = useState<Section>("general");

  const sections = [
    { id: "general" as const, label: "عمومی", icon: Settings, color: "#d4a017" },
    { id: "notifications" as const, label: "اعلان‌ها", icon: Bell, color: "#3b82f6" },
    { id: "security" as const, label: "امنیت", icon: Shield, color: "#ef4444" },
    { id: "appearance" as const, label: "ظاهر", icon: Palette, color: "#8b5cf6" },
    { id: "language" as const, label: "زبان و منطقه", icon: Globe, color: "#22c55e" },
    { id: "backup" as const, label: "پشتیبان‌گیری", icon: Database, color: "#06b6d4" },
    { id: "about" as const, label: "درباره سیستم", icon: Info, color: "#f59e0b" },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* User Profile Card */}
      {currentUser ? (
        <div className="chart-card !p-4 bg-gradient-to-l from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-[#0a0a0a] font-black text-xl">{currentUser.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">{currentUser.name}</h3>
              <p className="text-xs text-gray-500">{currentUser.role} • {currentUser.username}</p>
            </div>
            <button onClick={() => setCurrentUser(null)} className="btn-secondary text-xs">
              <LogOut className="w-3.5 h-3.5" />
              خروج
            </button>
          </div>
        </div>
      ) : (
        <div className="chart-card !p-4 bg-gradient-to-l from-blue-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">ورود به سیستم</h3>
              <p className="text-xs text-gray-500 mt-1">لطفاً برای دسترسی کامل وارد شوید</p>
            </div>
            <button onClick={() => setLoginOpen(true)} className="btn-primary text-xs">
              <Key className="w-3.5 h-3.5" />
              ورود
            </button>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`chart-card !p-3 card-hover text-center transition-all ${isActive ? 'border-amber-500 bg-amber-500/5' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className={`text-xs ${isActive ? 'font-bold text-amber-500' : 'font-medium'}`}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {section === "general" && <GeneralSettings />}
      {section === "notifications" && <NotificationSettings />}
      {section === "security" && <SecuritySettings />}
      {section === "appearance" && <AppearanceSettings theme={theme} toggleTheme={toggleTheme} />}
      {section === "language" && <LanguageSettings />}
      {section === "backup" && <BackupSettings />}
      {section === "about" && <AboutSection />}
    </div>
  );
}

function GeneralSettings() {
  const toast = useToast();
  return (
    <div className="chart-card !p-4 space-y-4">
      <h3 className="font-bold text-sm mb-3">تنظیمات عمومی</h3>

      <div>
        <label className="text-xs font-bold mb-1 block">نام سازمان</label>
        <input type="text" className="input-field" defaultValue="گروه صنعتی سلن (بسپار فوم غرب)" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold mb-1 block">کد اقتصادی</label>
          <input type="text" className="input-field" defaultValue="12345678901" dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block">شناسه ملی</label>
          <input type="text" className="input-field" defaultValue="10861234567" dir="ltr" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block">آدرس</label>
        <input type="text" className="input-field" defaultValue="کرمانشاه، شهرک صنعتی، فاز ۲" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold mb-1 block">تلفن</label>
          <input type="text" className="input-field" defaultValue="083-45678901" dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block">ایمیل</label>
          <input type="email" className="input-field" defaultValue="info@selen-group.ir" dir="ltr" />
        </div>
      </div>

      <button onClick={() => toast.success("ذخیره شد", "تنظیمات با موفقیت ذخیره شد")} className="btn-primary w-full justify-center">
        <Save className="w-4 h-4" />
        ذخیره تنظیمات
      </button>
    </div>
  );
}

function NotificationSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
    critical: true,
    daily_report: true,
    weekly_report: false,
    ai_alerts: true,
    stock_alerts: true,
  });

  const items = [
    { key: "email", label: "اعلان‌های ایمیلی", desc: "دریافت خلاصه رویدادها از طریق ایمیل" },
    { key: "sms", label: "پیامک", desc: "پیامک برای هشدارهای بحرانی" },
    { key: "push", label: "اعلان مرورگر (Push)", desc: "اعلان در همان مرورگر" },
    { key: "critical", label: "هشدار بحرانی", desc: "برای خرابی‌های بحرانی و PMهای عقب‌افتاده" },
    { key: "daily_report", label: "گزارش روزانه", desc: "خلاصه فعالیت‌های روز در ساعت ۸ صبح" },
    { key: "weekly_report", label: "گزارش هفتگی", desc: "خلاصه هفتگی شنبه‌ها" },
    { key: "ai_alerts", label: "هشدارهای AI", desc: "پیش‌بینی خرابی و توصیه‌های AI" },
    { key: "stock_alerts", label: "هشدار کمبود انبار", desc: "زمانی که موجودی زیر حد مینیمم برسد" },
  ];

  return (
    <div className="chart-card !p-4 space-y-3">
      <h3 className="font-bold text-sm mb-3">تنظیمات اعلان‌ها</h3>
      {items.map(item => (
        <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-[#1a1a1a] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0a0a0a]">
          <div className="flex-1">
            <p className="text-sm font-bold">{item.label}</p>
            <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={(settings as any)[item.key]}
              onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-[#1a1a1a] peer-checked:bg-amber-500 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-amber-500/50" />
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${(settings as any)[item.key] ? 'right-0.5' : 'right-5'}`} />
          </div>
        </label>
      ))}
      <button onClick={() => toast.success("ذخیره شد", "تنظیمات اعلان‌ها به‌روز شد")} className="btn-primary w-full justify-center mt-2">
        <Save className="w-4 h-4" />
        ذخیره
      </button>
    </div>
  );
}

function SecuritySettings() {
  const toast = useToast();
  return (
    <div className="chart-card !p-4 space-y-4">
      <h3 className="font-bold text-sm mb-3">تنظیمات امنیت</h3>

      <div>
        <label className="text-xs font-bold mb-1 block">رمز عبور فعلی</label>
        <input type="password" className="input-field" placeholder="••••••••" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold mb-1 block">رمز جدید</label>
          <input type="password" className="input-field" placeholder="حداقل ۸ کاراکتر" />
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block">تکرار رمز</label>
          <input type="password" className="input-field" />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-[#1a1a1a] space-y-3">
        <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-[#1a1a1a] cursor-pointer">
          <div>
            <p className="text-sm font-bold">ورود دو مرحله‌ای (2FA)</p>
            <p className="text-[10px] text-gray-500 mt-1">افزودن لایه امنیتی با پیامک</p>
          </div>
          <div className="relative">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 dark:bg-[#1a1a1a] peer-checked:bg-amber-500 rounded-full" />
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all right-5 peer-checked:right-0.5" />
          </div>
        </label>

        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
          <p className="font-bold text-blue-600">آخرین ورود</p>
          <p className="text-gray-500 mt-1">۱۴۰۴/۱۲/۲۸ - ۰۸:۳۰ • Chrome / Windows</p>
        </div>
      </div>

      <button onClick={() => toast.success("رمز تغییر کرد", "رمز عبور با موفقیت به‌روز شد")} className="btn-primary w-full justify-center">
        <Shield className="w-4 h-4" />
        تغییر رمز عبور
      </button>
    </div>
  );
}

function AppearanceSettings({ theme, toggleTheme }: any) {
  return (
    <div className="chart-card !p-4 space-y-4">
      <h3 className="font-bold text-sm mb-3">ظاهر برنامه</h3>

      <div>
        <p className="text-xs font-bold mb-2">حالت رنگی</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => theme !== "light" && toggleTheme()} className={`p-4 rounded-xl border-2 ${theme === "light" ? 'border-amber-500 bg-amber-500/10' : 'border-gray-200 dark:border-[#1a1a1a]'}`}>
            <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-xs font-bold">روشن</p>
          </button>
          <button onClick={() => theme !== "dark" && toggleTheme()} className={`p-4 rounded-xl border-2 ${theme === "dark" ? 'border-amber-500 bg-amber-500/10' : 'border-gray-200 dark:border-[#1a1a1a]'}`}>
            <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-xs font-bold">تاریک</p>
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold mb-2">رنگ اصلی سیستم</p>
        <div className="flex flex-wrap gap-2">
          {[
            { color: "#d4a017", label: "طلایی سلن" },
            { color: "#22c55e", label: "سبز" },
            { color: "#3b82f6", label: "آبی" },
            { color: "#ef4444", label: "قرمز" },
            { color: "#8b5cf6", label: "بنفش" },
          ].map(c => (
            <button key={c.color} className="w-10 h-10 rounded-full border-2 border-transparent hover:border-white/50 transition-all" style={{ backgroundColor: c.color }} title={c.label} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold mb-2">اندازه فونت</p>
        <select className="select-field" defaultValue="normal">
          <option value="small">کوچک</option>
          <option value="normal">متوسط (پیش‌فرض)</option>
          <option value="large">بزرگ</option>
        </select>
      </div>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div className="chart-card !p-4 space-y-4">
      <h3 className="font-bold text-sm mb-3">زبان و منطقه</h3>

      <div>
        <label className="text-xs font-bold mb-1 block">زبان رابط کاربری</label>
        <select className="select-field" defaultValue="fa">
          <option value="fa">فارسی</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block">تقویم</label>
        <select className="select-field" defaultValue="jalali">
          <option value="jalali">شمسی (جلالی)</option>
          <option value="gregorian">میلادی</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block">منطقه زمانی</label>
        <select className="select-field" defaultValue="asia_tehran">
          <option value="asia_tehran">Asia/Tehran (UTC+3:30)</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block">واحد پول</label>
        <select className="select-field" defaultValue="rial">
          <option value="rial">ریال (IRR)</option>
          <option value="toman">تومان</option>
        </select>
      </div>
    </div>
  );
}

function BackupSettings() {
  const toast = useToast();
  return (
    <div className="chart-card !p-4 space-y-4">
      <h3 className="font-bold text-sm mb-3">پشتیبان‌گیری و بازیابی</h3>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => toast.success("در حال دانلود", "فایل پشتیبان در حال آماده‌سازی...")} className="p-4 rounded-xl border-2 border-green-500/40 bg-green-500/5 hover:bg-green-500/10 text-center">
          <Download className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-green-500">پشتیبان‌گیری</p>
          <p className="text-[10px] text-gray-500 mt-1">دانلود تمام داده‌ها</p>
        </button>
        <button className="p-4 rounded-xl border-2 border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 text-center">
          <Upload className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-blue-500">بازیابی</p>
          <p className="text-[10px] text-gray-500 mt-1">بارگذاری فایل پشتیبان</p>
        </button>
      </div>

      <div>
        <label className="text-xs font-bold mb-1 block">پشتیبان‌گیری خودکار</label>
        <select className="select-field" defaultValue="daily">
          <option value="off">غیرفعال</option>
          <option value="daily">روزانه (۲ بامداد)</option>
          <option value="weekly">هفتگی (جمعه شب)</option>
          <option value="monthly">ماهانه</option>
        </select>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-xs">
        <p className="font-bold mb-2">آخرین پشتیبان‌گیری:</p>
        <p className="text-gray-500">۱۴۰۴/۱۲/۲۸ - ۰۲:۰۰ (خودکار)</p>
        <p className="text-gray-500 mt-1">حجم: ۱۲۵ مگابایت</p>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="chart-card !p-4 space-y-3">
      <div className="text-center pb-4 border-b border-gray-200 dark:border-[#1a1a1a]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-3">
          <span className="text-[#0a0a0a] font-black text-2xl">S</span>
        </div>
        <h3 className="font-bold text-lg">سامانه CMMS/EAM سلن</h3>
        <p className="text-xs text-gray-500 mt-1">نسخه ۱.۷.۰ Enterprise</p>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-gray-500">سازنده:</span><span className="font-bold">Arena AI + Selen Team</span></div>
        <div className="flex justify-between"><span className="text-gray-500">تاریخ انتشار:</span><span className="font-bold">۱۴۰۴/۱۲</span></div>
        <div className="flex justify-between"><span className="text-gray-500">استانداردها:</span><span className="font-bold">ISO 55000, TPM, RCM</span></div>
        <div className="flex justify-between"><span className="text-gray-500">لایسنس:</span><span className="font-bold">اختصاصی سلن</span></div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-[#1a1a1a]">
        <p className="text-xs font-bold mb-2">ماژول‌های فعال:</p>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {[
            "مدیریت تجهیزات",
            "نگهداری و تعمیرات",
            "دستور کارها",
            "درخواست تعمیرات",
            "انبار و قطعات",
            "پرسنل و مهارت",
            "شاخص‌های KPI",
            "مرکز برنامه‌ریزی",
            "مرکز مهاجرت اطلاعات",
            "درگاه هوشمند ورود",
            "گزارش‌گیری",
            "دستیار AI",
          ].map(m => (
            <div key={m} className="flex items-center gap-1 p-1.5 rounded bg-green-500/10 text-green-600 dark:text-green-500">
              <span>✓</span>
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-[#1a1a1a] text-center">
        <p className="text-[10px] text-gray-500">© ۱۳۹۲-۱۴۰۴ گروه صنعتی سلن</p>
        <p className="text-[10px] text-gray-500 mt-1">تمام حقوق محفوظ است</p>
      </div>
    </div>
  );
}
