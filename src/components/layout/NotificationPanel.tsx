"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, X, AlertTriangle, Wrench, Package, ClipboardList,
  CheckCircle, Clock, User, ChevronLeft, Trash2, Check,
  Sparkles, Filter, Send
} from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

export interface AppNotification {
  id: number;
  type: "critical" | "warning" | "info" | "success";
  category: "failure" | "pm" | "inventory" | "workOrder" | "ai";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  relatedAsset?: string;
  actions?: {
    label: string;
    type: "primary" | "secondary" | "danger";
    action: string;
  }[];
}

const initialNotifications: AppNotification[] = [
  {
    id: 1,
    type: "critical",
    category: "failure",
    title: "خرابی بحرانی: پمپ هیدرولیک",
    message: "نشتی شدید روغن هیدرولیک گزارش شد. تجهیز نیاز به توقف فوری دارد.",
    time: "۵ دقیقه پیش",
    isRead: false,
    relatedAsset: "پمپ هیدرولیک HP-350",
    actions: [
      { label: "صدور دستور کار اضطراری", type: "danger", action: "createWorkOrder" },
      { label: "بازدید فوری", type: "primary", action: "inspect" },
    ]
  },
  {
    id: 2,
    type: "warning",
    category: "pm",
    title: "PM عقب‌افتاده: موتور الکتریکی",
    message: "بررسی وایبرشن ماهانه موتور ۳ روز از موعد گذشته است.",
    time: "۲ ساعت پیش",
    isRead: false,
    relatedAsset: "موتور الکتریکی SE-001",
    actions: [
      { label: "زمان‌بندی مجدد", type: "primary", action: "reschedule" },
      { label: "تخصیص تکنسین", type: "secondary", action: "assign" },
    ]
  },
  {
    id: 3,
    type: "warning",
    category: "inventory",
    title: "کمبود موجودی: اورینگ سیلندر",
    message: "موجودی اورینگ سیلندر 50mm به صفر رسیده. AI پیشنهاد می‌کند ۵۰ عدد سفارش دهید.",
    time: "۴ ساعت پیش",
    isRead: false,
    relatedAsset: "SP-004",
    actions: [
      { label: "سفارش خودکار AI", type: "primary", action: "aiOrder" },
      { label: "سفارش دستی", type: "secondary", action: "manualOrder" },
    ]
  },
  {
    id: 4,
    type: "info",
    category: "workOrder",
    title: "درخواست تعمیر جدید",
    message: "درخواست تعمیر برای نوار نقاله اصلی ثبت شد. نیاز به تایید و تخصیص.",
    time: "۶ ساعت پیش",
    isRead: false,
    relatedAsset: "نوار نقاله اصلی",
    actions: [
      { label: "تایید و صدور دستور", type: "primary", action: "approve" },
      { label: "رد درخواست", type: "danger", action: "reject" },
    ]
  },
  {
    id: 5,
    type: "success",
    category: "workOrder",
    title: "دستور کار WO-1406 تکمیل شد",
    message: "تعویض فیلتر روغن موتور با موفقیت توسط رضا احمدی انجام شد.",
    time: "۸ ساعت پیش",
    isRead: true,
    relatedAsset: "موتور الکتریکی",
    actions: [
      { label: "مشاهده گزارش", type: "primary", action: "viewReport" },
    ]
  },
  {
    id: 6,
    type: "info",
    category: "ai",
    title: "توصیه هوش مصنوعی",
    message: "بر اساس روند مصرف، بلبرینگ آسیاب صنعتی در ۱۵ روز آینده نیاز به تعویض دارد.",
    time: "۱ روز پیش",
    isRead: true,
    relatedAsset: "دستگاه آسیاب صنعتی",
    actions: [
      { label: "برنامه‌ریزی PM", type: "primary", action: "schedulePM" },
    ]
  },
  {
    id: 7,
    type: "warning",
    category: "pm",
    title: "PM سررسید در ۲ روز",
    message: "سرویس ماهانه دستگاه آسیاب صنعتی در تاریخ ۱۴۰۳/۱۱/۰۱ سررسید می‌شود.",
    time: "۱ روز پیش",
    isRead: true,
    relatedAsset: "دستگاه آسیاب صنعتی",
    actions: [
      { label: "برنامه‌ریزی", type: "primary", action: "schedule" },
    ]
  },
];

const categoryConfig = {
  failure: { icon: AlertTriangle, label: "خرابی", color: "text-red-500", bg: "bg-red-500/10" },
  pm: { icon: Wrench, label: "PM", color: "text-amber-500", bg: "bg-amber-500/10" },
  inventory: { icon: Package, label: "انبار", color: "text-blue-500", bg: "bg-blue-500/10" },
  workOrder: { icon: ClipboardList, label: "دستور کار", color: "text-green-500", bg: "bg-green-500/10" },
  ai: { icon: Sparkles, label: "AI", color: "text-purple-500", bg: "bg-purple-500/10" },
};

const typeColors = {
  critical: "border-r-red-500 bg-red-500/5",
  warning: "border-r-amber-500 bg-amber-500/5",
  info: "border-r-blue-500 bg-blue-500/5",
  success: "border-r-green-500 bg-green-500/5",
};

export function NotificationPanel() {
  const {
    notificationPanelOpen,
    toggleNotificationPanel,
    setModalOpen,
    setModalType,
    setSelectedItem,
    setCurrentPage
  } = useAppState();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [filter, setFilter] = useState<string>("all");
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && notificationPanelOpen) {
        toggleNotificationPanel();
      }
    };
    if (notificationPanelOpen) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationPanelOpen, toggleNotificationPanel]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.type === "critical" && !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.category === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setActionFeedback("همه اعلان‌ها خوانده شد");
    setTimeout(() => setActionFeedback(""), 2000);
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedNotif(null);
  };

  const handleAction = (notif: AppNotification, action: string) => {
    markAsRead(notif.id);

    switch (action) {
      case "createWorkOrder":
      case "approve":
        setModalType("addWorkOrder");
        setSelectedItem({ title: notif.title, assetName: notif.relatedAsset });
        setModalOpen(true);
        toggleNotificationPanel();
        setActionFeedback("در حال صدور دستور کار...");
        break;
      case "reschedule":
      case "schedule":
      case "schedulePM":
        setCurrentPage("planning");
        toggleNotificationPanel();
        setActionFeedback("انتقال به مرکز برنامه‌ریزی");
        break;
      case "aiOrder":
        setActionFeedback("✨ سفارش خودکار AI ارسال شد");
        setTimeout(() => setActionFeedback(""), 3000);
        break;
      case "manualOrder":
        setCurrentPage("inventory");
        toggleNotificationPanel();
        break;
      case "inspect":
      case "viewReport":
        setCurrentPage("failures");
        toggleNotificationPanel();
        break;
      case "assign":
        setCurrentPage("personnel");
        toggleNotificationPanel();
        break;
      case "reject":
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
        setSelectedNotif(null);
        setActionFeedback("درخواست رد شد");
        setTimeout(() => setActionFeedback(""), 2000);
        break;
      default:
        setActionFeedback("اقدام ثبت شد");
        setTimeout(() => setActionFeedback(""), 2000);
    }
  };

  if (!notificationPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40 md:bg-transparent" onClick={toggleNotificationPanel} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 md:top-14 left-0 md:left-4 h-screen md:h-auto md:max-h-[85vh] w-full md:w-[420px] z-[70] bg-white dark:bg-[#0d0d0d] md:rounded-2xl border-l md:border border-gray-200 dark:border-[#1a1a1a] shadow-2xl flex flex-col animate-slide-in overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-500" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#0d0d0d] animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm">اعلان‌ها</h3>
              <p className="text-[10px] text-gray-500">{unreadCount} خوانده نشده</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-amber-600 dark:text-amber-500 hover:underline px-2 py-1">
                علامت همه به‌عنوان خوانده شده
              </button>
            )}
            <button onClick={toggleNotificationPanel} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-2 border-b border-gray-200 dark:border-[#1a1a1a] flex gap-1 overflow-x-auto scrollbar-hide flex-shrink-0">
          {[
            { id: "all", label: "همه" },
            { id: "unread", label: `خوانده‌نشده (${unreadCount})` },
            { id: "failure", label: "خرابی" },
            { id: "pm", label: "PM" },
            { id: "inventory", label: "انبار" },
            { id: "workOrder", label: "دستور کار" },
            { id: "ai", label: "AI" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-colors ${
                filter === f.id
                  ? 'bg-amber-500 text-[#0a0a0a] font-bold'
                  : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feedback Toast */}
        {actionFeedback && (
          <div className="mx-3 mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 animate-fade-in flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-xs text-green-600 dark:text-green-400">{actionFeedback}</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">اعلانی وجود ندارد</p>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              {filtered.map(notif => {
                const config = categoryConfig[notif.category];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => { markAsRead(notif.id); setSelectedNotif(notif); }}
                    className={`p-3 rounded-xl border-r-4 ${typeColors[notif.type]} cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors relative`}
                  >
                    {!notif.isRead && (
                      <span className="absolute top-3 left-3 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{config.label}</span>
                        </div>
                        <p className={`text-xs ${!notif.isRead ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-2.5 h-2.5 text-gray-400" />
                          <span className="text-[9px] text-gray-500">{notif.time}</span>
                          {notif.actions && notif.actions.length > 0 && (
                            <span className="text-[9px] text-amber-600 dark:text-amber-500 font-medium">
                              • {notif.actions.length} اقدام قابل انجام
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-[80] flex items-end md:items-center justify-center md:p-4"
          onClick={() => setSelectedNotif(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full md:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="md:hidden flex justify-center pt-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
            </div>

            {/* Header */}
            <div className={`p-4 border-b border-gray-200 dark:border-[#1a1a1a] border-r-4 ${typeColors[selectedNotif.type]}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${categoryConfig[selectedNotif.category].bg} flex items-center justify-center flex-shrink-0`}>
                    {(() => {
                      const Icon = categoryConfig[selectedNotif.category].icon;
                      return <Icon className={`w-5 h-5 ${categoryConfig[selectedNotif.category].color}`} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold">{selectedNotif.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">{selectedNotif.time}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedNotif(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedNotif.message}</p>

              {selectedNotif.relatedAsset && (
                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-gray-200 dark:border-[#1a1a1a]">
                  <p className="text-[10px] text-gray-500 mb-1">تجهیز مرتبط:</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-500">{selectedNotif.relatedAsset}</p>
                </div>
              )}

              {/* AI Recommendation */}
              {selectedNotif.category === "ai" && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">تحلیل هوش مصنوعی</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                      این توصیه بر اساس تحلیل داده‌های ۳ ماه اخیر و الگوهای مصرف تولید شده است.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedNotif.actions && selectedNotif.actions.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] space-y-2">
                <p className="text-[10px] text-gray-500 mb-2">اقدامات قابل انجام:</p>
                {selectedNotif.actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction(selectedNotif, action.action)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      action.type === "primary" ? "btn-primary" :
                      action.type === "danger" ? "bg-red-500 hover:bg-red-600 text-white" :
                      "btn-secondary"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={() => deleteNotification(selectedNotif.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف اعلان
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
