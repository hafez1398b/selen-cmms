"use client";

import { useAppState, type PageId } from "@/context/AppStateContext";
import { LayoutDashboard, ClipboardList, Wrench, Package, Menu } from "lucide-react";

const bottomNavItems = [
  { id: "dashboard" as PageId, label: "داشبورد", icon: LayoutDashboard },
  { id: "workOrders" as PageId, label: "دستور کار", icon: ClipboardList },
  { id: "maintenance" as PageId, label: "PM", icon: Wrench },
  { id: "inventory" as PageId, label: "انبار", icon: Package },
];

export function MobileBottomNav() {
  const { currentPage, setCurrentPage, toggleSidebar } = useAppState();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#0d0d0d] border-t border-gray-200 dark:border-[#1a1a1a] pb-safe">
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-amber-500' : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              {isActive && <span className="absolute top-0 w-8 h-0.5 bg-amber-500 rounded-b-full" />}
            </button>
          );
        })}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-gray-500"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px]">بیشتر</span>
        </button>
      </div>
    </nav>
  );
}
