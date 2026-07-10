"use client";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { Settings as GearIcon, Bell, Shield, Database, Save, Sun, Moon } from "lucide-react";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState("general");
  const tabs = [{ id: "general", label: "عمومی", icon: GearIcon }, { id: "notifications", label: "اعلان‌ها", icon: Bell }, { id: "security", label: "امنیت", icon: Shield }, { id: "backup", label: "پشتیبان‌گیری", icon: Database }];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">
      <div className="chart-card p-2 flex gap-1">{tabs.map(tab => { const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-[#0a0a0a] font-bold' : 'text-gray-400 hover:text-white'}`}><Icon className="w-4 h-4" />{tab.label}</button>); })}</div>
      {activeTab === "general" && (
        <div className="space-y-4">
          <div className="chart-card"><h3 className="font-bold mb-4">تنظیمات عمومی</h3><div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="font-medium text-sm">حالت نمایش</p><p className="text-xs text-gray-500 dark:text-gray-500">تم تاریک یا روشن</p></div><button onClick={toggleTheme} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-100 dark:bg-[#1a1a1a] text-amber-400' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400'}`}>{isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}{isDark ? "تم تاریک" : "تم روشن"}</button></div>
            <div className="border-t border-gray-200 dark:border-[#1a1a1a]" />
            <div className="flex items-center justify-between"><div><p className="font-medium text-sm">زبان</p><p className="text-xs text-gray-500 dark:text-gray-500">زبان رابط کاربری</p></div><select className="select-field w-[120px]" defaultValue="fa"><option value="fa">فارسی</option></select></div>
            <div className="border-t border-gray-200 dark:border-[#1a1a1a]" />
            <div className="flex items-center justify-between"><div><p className="font-medium text-sm">واحد پول</p><p className="text-xs text-gray-500 dark:text-gray-500">واحد پیش‌فرض</p></div><select className="select-field w-[120px]" defaultValue="rial"><option value="rial">ریال</option><option value="toman">تومان</option></select></div>
          </div></div>
          <div className="chart-card"><h3 className="font-bold mb-4">اطلاعات سازمان</h3><div className="space-y-4"><div><label className="text-xs text-gray-500 mb-1 block">نام سازمان</label><input type="text" defaultValue="شرکت تولیدی نمونه" className="input-field" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-gray-500 mb-1 block">واحد</label><input type="text" defaultValue="تولید" className="input-field" /></div><div><label className="text-xs text-gray-500 mb-1 block">کد</label><input type="text" defaultValue="PRD-001" className="input-field" /></div></div><button className="btn-primary"><Save className="w-4 h-4" /> ذخیره</button></div></div>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="chart-card"><h3 className="font-bold mb-4">تنظیمات اعلان‌ها</h3><div className="space-y-3">{[{ label: "اعلان PM سررسید", desc: "هشدار ۳ روز قبل", on: true }, { label: "هشدار خرابی بحرانی", desc: "اعلان فوری", on: true }, { label: "کمبود موجودی", desc: "اعلان زیر حداقل", on: true }, { label: "گزارش هفتگی", desc: "خلاصه عملکرد", on: false }, { label: "تحلیل AI", desc: "پیشنهادات خودکار", on: true }].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a]"><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-gray-500 dark:text-gray-500">{item.desc}</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={item.on} className="sr-only peer" /><div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div></label></div>
        ))}</div></div>
      )}
      {activeTab === "security" && (
        <div className="chart-card"><h3 className="font-bold mb-4">تنظیمات امنیتی</h3><div className="space-y-4"><div><label className="text-xs text-gray-500 mb-1 block">رمز فعلی</label><input type="password" className="input-field" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-gray-500 mb-1 block">رمز جدید</label><input type="password" className="input-field" /></div><div><label className="text-xs text-gray-500 mb-1 block">تکرار</label><input type="password" className="input-field" /></div></div><button className="btn-primary"><Save className="w-4 h-4" /> تغییر رمز</button></div></div>
      )}
      {activeTab === "backup" && (
        <div className="chart-card"><h3 className="font-bold mb-4">پشتیبان‌گیری</h3><div className="space-y-4"><div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a]"><p className="text-sm font-medium">آخرین پشتیبان</p><p className="text-xs mt-1 text-gray-500 dark:text-gray-500">۱۰۳/۱۰/۵ - ۴۵ مگابایت</p><div className="flex gap-2 mt-3"><button className="btn-primary text-xs py-1.5"><Database className="w-3.5 h-3.5" /> پشتیبان‌گیری</button></div></div></div></div>
      )}
    </div>
  );
}
