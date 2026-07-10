"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAppState } from "@/context/AppStateContext";
import { Sun, Moon, Bell, Calendar, Menu } from "lucide-react";

export function TopHeader() {
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, currentPage, toggleNotificationPanel } = useAppState();
  const isDark = theme === 'dark';

  const persianDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const persianTime = new Date().toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const pageTitles: Record<string, string> = {
    dashboard: "داشبورد اجرایی",
    assets: "درخت تجهیزات",
    workOrders: "دستور کارها",
    maintenance: "نگهداری پیشگیرانه",
    failures: "درخواست تعمیرات",
    personnel: "مدیریت پرسنل",
    inventory: "انبار قطعات",
    reports: "گزارش‌گیری",
    aiAssistant: "دستیار هوشمند",
    settings: "تنظیمات",
    kpi: "شاخص‌های KPI",
    planning: "مرکز برنامه‌ریزی",
    docs: "مستندات معماری",
  };

  return (
    <header className="h-14 md:h-[56px] bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between px-3 md:px-6 sticky top-0 z-40 flex-shrink-0 shadow-sm dark:shadow-none">

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 md:flex-initial">
        <button onClick={toggleSidebar} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] flex-shrink-0">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[#0a0a0a] font-black text-xs">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-xs font-bold text-amber-600 dark:text-amber-500 leading-tight truncate">
              {pageTitles[currentPage] || "داشبورد"}
            </p>
            <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-600 leading-tight truncate">
              <span className="md:hidden">سلن (بسپار فوم غرب)</span>
              <span className="hidden md:inline">گروه صنعتی سلن (بسپار فوم غرب)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center - Breadcrumb (hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-600">خانه</span>
        <span className="text-gray-400 dark:text-gray-700">‹</span>
        <span className="text-gray-500 dark:text-gray-500">اصلی</span>
        <span className="text-gray-400 dark:text-gray-700">‹</span>
        <span className="text-amber-600 dark:text-amber-500 font-bold">{pageTitles[currentPage] || "داشبورد"}</span>
      </div>

      {/* Left Side */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-xl px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] text-gray-600 dark:text-gray-400">{persianDate}</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-500 font-medium">— {persianTime}</span>
        </div>
        <button
          onClick={toggleNotificationPanel}
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
          title="اعلان‌ها"
        >
          <Bell className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
            ۴
          </span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
          title={isDark ? "تم روشن" : "تم تیره"}
        >
          {isDark ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-gray-600" />}
        </button>
      </div>

    </header>
  );
}
