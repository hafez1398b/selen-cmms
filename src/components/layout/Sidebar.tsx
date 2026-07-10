"use client";

import { useAppState, type PageId } from "@/context/AppStateContext";
import {
  LayoutDashboard, Settings, Wrench, Users, Package,
  AlertTriangle, ClipboardList, FileText, Bot, ChevronRight,
  TrendingUp, Calendar as CalendarIcon, X, Book
} from "lucide-react";

const menuGroups = [
  {
    title: "معماری پروژه",
    items: [
      { id: "docs" as PageId, label: "مستندات (فاز ۰)", icon: Book },
    ]
  },
  {
    title: "اصلی",
    items: [
      { id: "dashboard" as PageId, label: "داشبورد اجرایی", icon: LayoutDashboard },
    ]
  },
  {
    title: "دارایی",
    items: [
      { id: "assets" as PageId, label: "درخت تجهیزات", icon: Settings },
    ]
  },
  {
    title: "عملیات",
    items: [
      { id: "workOrders" as PageId, label: "دستور کارها", icon: ClipboardList },
      { id: "failures" as PageId, label: "درخواست تعمیرات و خدمات", icon: AlertTriangle },
      { id: "maintenance" as PageId, label: "نگهداری پیشگیرانه", icon: Wrench },
      { id: "kpi" as PageId, label: "شاخص‌های KPI", icon: TrendingUp },
      { id: "planning" as PageId, label: "مرکز برنامه‌ریزی", icon: CalendarIcon },
    ]
  },
  {
    title: "منابع",
    items: [
      { id: "personnel" as PageId, label: "مدیریت پرسنل", icon: Users },
      { id: "inventory" as PageId, label: "انبار و قطعات", icon: Package },
      { id: "reports" as PageId, label: "گزارش‌گیری", icon: FileText },
      { id: "aiAssistant" as PageId, label: "دستیار هوشمند AI", icon: Bot },
      { id: "settings" as PageId, label: "تنظیمات", icon: Settings },
    ]
  },
];

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useAppState();

  const handleItemClick = (id: PageId) => {
    setCurrentPage(id);
    if (isMobile) toggleSidebar();
  };

  const width = isMobile ? 'w-[280px]' : sidebarOpen ? 'w-[260px]' : 'w-[70px]';

  return (
    <aside className={`h-screen flex flex-col relative bg-white dark:bg-[#0d0d0d] border-l border-gray-200 dark:border-[#1a1a1a] shadow-xl dark:shadow-none transition-all duration-300 ease-in-out ${width}`}>

      {/* Mobile Close Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-50 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Desktop Toggle Button - LEFT edge */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -left-3 top-8 z-50 w-6 h-6 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] items-center justify-center hover:bg-amber-500 dark:hover:bg-amber-600 hover:border-amber-500 transition-all group shadow-md"
        >
          <ChevronRight className={`w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-white transition-all ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      )}

      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <span className="text-[#0a0a0a] font-black text-lg">S</span>
          </div>
          {(sidebarOpen || isMobile) && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-[10px] text-gray-500 tracking-wider">INDUSTRIAL GROUP</h1>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-500">گروه صنعتی سلن</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-600 mt-0.5">(بسپار فوم غرب)</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-3">
            {(sidebarOpen || isMobile) && (
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold px-3 mb-1.5">{group.title}</p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <div
                  key={item.id}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  title={!sidebarOpen && !isMobile ? item.label : undefined}
                >
                  <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-gray-500'}`} />
                  {(sidebarOpen || isMobile) && <span className="truncate">{item.label}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      {(sidebarOpen || isMobile) && (
        <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a]">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-700/5 border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">سیستم فعال</span>
            </div>
            <p className="text-[10px] text-gray-500">نسخه ۲.۰.۰ Enterprise</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-600">© ۱۳۹۲ گروه صنعتی سلن</p>
          </div>
        </div>
      )}
    </aside>
  );
}
