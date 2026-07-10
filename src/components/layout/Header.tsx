"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAppState } from "@/context/AppStateContext";
import { Sun, Moon, Bell, Search, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { currentPage, sidebarOpen, toggleSidebar } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const isDark = theme === 'dark';

  const pageTitles: Record<string, string> = {
    dashboard: "داشبورد مدیریتی",
    assets: "مدیریت تجهیزات",
    workOrders: "دستور کارها",
    maintenance: "نت پیشگیرانه (PM)",
    failures: "مدیریت خرابی‌ها",
    personnel: "مدیریت پرسنل",
    inventory: "انبار و قطعات یدکی",
    reports: "گزارش‌گیری",
    aiAssistant: "دستیار هوشمند AI",
    settings: "تنظیمات",
  };

  return (
    <header className={`h-16 border-b ${theme === 'dark'
        ? 'bg-dark-800/80 border-dark-600'
        : 'bg-white/80 border-gray-200'
      } backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30`}>
      {/* Right side */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className={`md:hidden p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-dark-600' : 'hover:bg-gray-100'}`}>
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'gradient-text' : 'text-red-600'}`}>{pageTitles[currentPage]}</h2>
          <p className={`text-xs ${theme === 'dark' ? 'text-dark-400' : 'text-gray-400'}`}>
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="جستجو در سامانه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pr-10 pl-4 py-2 rounded-xl text-sm ${isDark
                ? 'bg-dark-600 border-dark-500 text-white placeholder-dark-300'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-gold-500/30 focus:border-gold-500' : 'focus:ring-red-500/20 focus:border-red-500'}`}
          />
        </div>
      </div>

      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-colors ${isDark
              ? 'bg-dark-600 hover:bg-dark-500 text-gold-400'
              : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className={`relative p-2 rounded-xl transition-colors ${isDark
            ? 'bg-dark-600 hover:bg-dark-500 text-gold-400'
            : 'bg-red-50 hover:bg-red-100 text-red-600'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="notif-badge">۳</span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 mr-2">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center ${isDark ? 'from-gold-500 to-gold-700' : 'from-red-500 to-red-700'}`}>
            <span className="text-white font-bold text-sm">مد</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">مدیر سیستم</p>
            <p className={`text-[10px] ${theme === 'dark' ? 'text-dark-400' : 'text-gray-400'}`}>مدیر ارشد</p>
          </div>
        </div>
      </div>
    </header>
  );
}
