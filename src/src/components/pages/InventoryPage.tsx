"use client";

import { useState } from "react";
import { inventoryData, suppliersData, purchaseOrdersData, getInventoryStats, type SparePart } from "@/lib/inventory-data";
import {
  Package, Search, Plus, AlertCircle, Sparkles, TrendingUp, TrendingDown,
  ShoppingCart, Users, DollarSign, Brain, QrCode, ChevronLeft, Edit2,
  Trash2, Filter, Download, Upload, CheckCircle2, Truck, X
} from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { useToast } from "@/components/ui/Toast";
import { SmartImportGateway } from "@/components/features/import/SmartImportGateway";

type Tab = "parts" | "suppliers" | "orders" | "ai_insights";

export function InventoryPage() {
  const { selectedItem, setSelectedItem } = useAppState();
  const initialFilter = (selectedItem?.filterStatus as string) || "all";
  const [tab, setTab] = useState<Tab>("parts");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const stats = getInventoryStats();

  // Show notification if entered with filter
  const filterActive = filterStatus !== "all";

  const tabs = [
    { id: "parts" as const, label: "قطعات یدکی", icon: Package, color: "#d4a017" },
    { id: "suppliers" as const, label: "تأمین‌کنندگان", icon: Users, color: "#3b82f6" },
    { id: "orders" as const, label: "سفارشات خرید", icon: ShoppingCart, color: "#22c55e" },
    { id: "ai_insights" as const, label: "تحلیل AI", icon: Brain, color: "#8b5cf6" },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Stats - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
        <button onClick={() => { setTab("parts"); setFilterStatus("all"); }} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center"><Package className="w-4 h-4 text-amber-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">کل قطعات</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{stats.total}</p>
        </button>
        <button onClick={() => { setTab("parts"); setFilterStatus("in_stock"); }} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-green-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">موجود</p>
          <p className="text-xl md:text-2xl font-black text-green-500">{stats.inStock}</p>
        </button>
        <button onClick={() => { setTab("parts"); setFilterStatus("low_stock"); }} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-amber-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">کم موجود</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{stats.lowStock}</p>
        </button>
        <button onClick={() => { setTab("parts"); setFilterStatus("out_of_stock"); }} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-red-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">ناموجود</p>
          <p className="text-xl md:text-2xl font-black text-red-500">{stats.outOfStock}</p>
        </button>
        <div className="kpi-card !p-3 hidden lg:block">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center"><DollarSign className="w-4 h-4 text-purple-500" /></div>
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">ارزش کل</p>
          <p className="text-lg md:text-xl font-black text-purple-500">{(stats.totalValue / 1000000).toFixed(0)}M</p>
        </div>
      </div>

      {/* AI Alert Banner */}
      {stats.aiAlerts > 0 && (
        <button
          onClick={() => setTab("ai_insights")}
          className="w-full chart-card !p-4 bg-gradient-to-l from-purple-500/10 to-amber-500/10 border-amber-500/30 card-hover text-right group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-amber-600 dark:text-amber-500">
                <Sparkles className="inline w-4 h-4" /> هشدار AI: {stats.aiAlerts} قطعه نیاز به بررسی دارد
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                بر اساس تحلیل مصرف، AI پیش‌بینی کمبود در ۳۰ روز آینده کرده است
              </p>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
        </button>
      )}

      {/* Tabs */}
      <div className="chart-card !p-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[130px] px-3 py-2 rounded-lg text-xs whitespace-nowrap flex items-center justify-center gap-1.5 ${
                tab === t.id ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold' : 'text-gray-500'
              }`}>
              <Icon className="w-3.5 h-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      {tab === "parts" && <PartsView search={search} setSearch={setSearch} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onPartClick={setSelectedPart} onImportClick={() => setImportOpen(true)} />}
      {tab === "suppliers" && <SuppliersView />}
      {tab === "orders" && <OrdersView />}
      {tab === "ai_insights" && <AIInsightsView />}

      {selectedPart && <PartDetailModal part={selectedPart} onClose={() => setSelectedPart(null)} />}
      <SmartImportGateway isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

function PartsView({ search, setSearch, filterStatus, setFilterStatus, onPartClick, onImportClick }: any) {
  let filtered = inventoryData;
  if (search) filtered = filtered.filter(p => p.name.includes(search) || p.code.toLowerCase().includes(search.toLowerCase()));
  if (filterStatus !== "all") filtered = filtered.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-3">
      <div className="chart-card !p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-10" />
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-field flex-1 md:w-[140px]">
            <option value="all">همه</option>
            <option value="in_stock">موجود</option>
            <option value="low_stock">کم موجود</option>
            <option value="out_of_stock">ناموجود</option>
          </select>
          <button onClick={onImportClick} className="btn-secondary text-xs whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" /> ورود هوشمند
          </button>
          <button className="btn-primary text-xs whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> افزودن
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => {
          const statusConfig: Record<string, { color: string; label: string; bg: string }> = {
            in_stock: { color: "#22c55e", label: "موجود", bg: "bg-green-500/10" },
            low_stock: { color: "#f59e0b", label: "کم موجود", bg: "bg-amber-500/10" },
            out_of_stock: { color: "#ef4444", label: "ناموجود", bg: "bg-red-500/10" },
            on_order: { color: "#3b82f6", label: "در سفارش", bg: "bg-blue-500/10" },
          };
          const cfg = statusConfig[p.status];
          const criticalityColor: Record<string, string> = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#22c55e" };
          return (
            <button key={p.id} onClick={() => onPartClick(p)} className="chart-card !p-3 card-hover text-right">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-mono text-amber-500" dir="ltr">{p.code}</span>
                    {p.hasQRCode && <QrCode className="w-3 h-3 text-blue-500" />}
                  </div>
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{p.brand} • {p.category}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0`} style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center text-xs my-3 pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
                <div>
                  <p className="text-[9px] text-gray-500">موجودی</p>
                  <p className={`font-bold ${p.currentStock <= p.minimumStock ? 'text-red-500' : 'text-green-500'}`}>{p.currentStock}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">حداقل</p>
                  <p className="font-bold text-gray-600 dark:text-gray-400">{p.minimumStock}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">قیمت</p>
                  <p className="font-bold text-amber-500">{(p.unitPrice / 1000).toFixed(0)}K</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">📍 {p.location}</span>
                <span className="px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: criticalityColor[p.criticality] + '20', color: criticalityColor[p.criticality] }}>
                  {p.criticality === "critical" ? "بحرانی" : p.criticality === "high" ? "بالا" : p.criticality === "medium" ? "متوسط" : "کم"}
                </span>
              </div>

              {p.aiPrediction && p.aiPrediction.daysUntilShortage <= 30 && (
                <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] text-amber-500 font-bold">
                    {p.aiPrediction.daysUntilShortage === 0 ? "کمبود فوری!" : `${p.aiPrediction.daysUntilShortage} روز تا کمبود`}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SuppliersView() {
  return (
    <div className="space-y-3">
      <div className="chart-card !p-3 flex justify-between items-center">
        <h3 className="font-bold text-sm">تأمین‌کنندگان ({suppliersData.length})</h3>
        <button className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> افزودن</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suppliersData.map(s => (
          <div key={s.id} className="chart-card !p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-sm">{s.name}</h4>
                <p className="text-[10px] text-gray-500 mt-1">👤 {s.contact}</p>
                <p className="text-[10px] text-gray-500 mt-0.5" dir="ltr">📞 {s.phone}</p>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-amber-500">{s.rating}</span>
                  <span className="text-amber-500">⭐</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{s.totalOrders} سفارش</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">تحویل به موقع</span>
                <span className="font-bold text-green-500">{s.onTimeDelivery}%</span>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill bg-gradient-to-l from-green-500 to-green-700" style={{ width: `${s.onTimeDelivery}%` }} />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.category.map(c => (
                  <span key={c} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersView() {
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: "پیش‌نویس", color: "#6b7280", icon: Edit2 },
    pending: { label: "در انتظار تایید", color: "#f59e0b", icon: AlertCircle },
    approved: { label: "تایید شده", color: "#3b82f6", icon: CheckCircle2 },
    in_transit: { label: "در حال ارسال", color: "#8b5cf6", icon: Truck },
    delivered: { label: "تحویل شده", color: "#22c55e", icon: CheckCircle2 },
    cancelled: { label: "لغو شده", color: "#ef4444", icon: X },
  };

  return (
    <div className="space-y-3">
      <div className="chart-card !p-3 flex justify-between items-center">
        <h3 className="font-bold text-sm">سفارشات خرید ({purchaseOrdersData.length})</h3>
        <button className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> سفارش جدید</button>
      </div>
      <div className="space-y-2">
        {purchaseOrdersData.map(po => {
          const cfg = statusConfig[po.status];
          const Icon = cfg.icon;
          return (
            <div key={po.id} className="chart-card !p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-amber-500">{po.code}</span>
                    <span className="text-[10px] text-gray-500">{po.date}</span>
                  </div>
                  <p className="text-sm font-bold">{po.supplierName}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{po.items.length} قلم • {po.createdBy}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>
                  <Icon className="w-3 h-3" />{cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
                <span className="text-gray-500">مجموع:</span>
                <span className="font-black text-amber-500">{(po.totalAmount / 1000000).toFixed(1)}M ریال</span>
              </div>
              {po.expectedDelivery && (
                <p className="text-[10px] text-gray-500 mt-1">تحویل مورد انتظار: <strong>{po.expectedDelivery}</strong></p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIInsightsView() {
  const alertItems = inventoryData.filter(p => p.aiPrediction && p.aiPrediction.daysUntilShortage <= 60);

  return (
    <div className="space-y-3">
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 to-transparent">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">تحلیل هوش مصنوعی انبار</h3>
            <p className="text-xs text-gray-500 mt-1">پیش‌بینی مصرف و پیشنهاد سفارش بر اساس روند</p>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h4 className="font-bold text-sm mb-3">پیش‌بینی کمبود ({alertItems.length} قطعه)</h4>
        <div className="space-y-2">
          {alertItems.map(p => {
            const trend = p.aiPrediction?.trend;
            const trendIcon = trend === "increasing" ? TrendingUp : trend === "decreasing" ? TrendingDown : null;
            const TrendIcon = trendIcon;
            return (
              <div key={p.id} className={`p-3 rounded-lg border-r-4 ${p.aiPrediction!.daysUntilShortage === 0 ? 'border-red-500 bg-red-500/5' : p.aiPrediction!.daysUntilShortage <= 15 ? 'border-amber-500 bg-amber-500/5' : 'border-blue-500 bg-blue-500/5'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[9px] font-mono text-gray-500">{p.code}</span>
                      {TrendIcon && <TrendIcon className={`w-3 h-3 ${trend === "increasing" ? "text-red-500" : "text-green-500"}`} />}
                    </div>
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">موجودی: {p.currentStock} | مصرف ماهانه: {p.monthlyConsumption}</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-lg font-black ${p.aiPrediction!.daysUntilShortage === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.aiPrediction!.daysUntilShortage === 0 ? "الان!" : `${p.aiPrediction!.daysUntilShortage} روز`}
                    </p>
                    <p className="text-[9px] text-gray-500">تا کمبود</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#0a0a0a] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px]">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-gray-500">پیشنهاد سفارش:</span>
                    <span className="font-bold text-amber-500">{p.aiPrediction!.recommendedOrder} عدد</span>
                  </div>
                  <button className="text-[10px] px-3 py-1 rounded-full bg-amber-500 text-[#0a0a0a] font-bold">
                    ثبت سفارش
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-card !p-4">
        <h4 className="font-bold text-sm mb-3">توصیه‌های AI</h4>
        <div className="space-y-2">
          <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-xs">
            <p className="font-bold text-green-600">💡 صرفه‌جویی هزینه</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">با تجمیع سفارشات ماهانه از شرکت بهران، ۱۵٪ در هزینه حمل صرفه‌جویی می‌شود</p>
          </div>
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs">
            <p className="font-bold text-blue-600">📈 روند مصرف</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">مصرف اورینگ سیلندر ۴۰٪ افزایش یافته. نیاز به بازنگری نقطه سفارش</p>
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs">
            <p className="font-bold text-amber-600">⚠️ تأمین‌کننده جایگزین</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">برای بلبرینگ SKF، تأمین‌کننده جایگزین با قیمت ۱۲٪ کمتر شناسایی شد</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartDetailModal({ part, onClose }: { part: SparePart; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full md:max-w-lg max-h-[95vh] overflow-y-auto bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-2"><div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" /></div>
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-amber-500">{part.code}</p>
            <h3 className="font-bold text-base mt-1">{part.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg"><p className="text-[10px] text-gray-500">موجودی فعلی</p><p className="text-lg font-black text-green-500">{part.currentStock}</p></div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg"><p className="text-[10px] text-gray-500">حداقل</p><p className="text-lg font-black">{part.minimumStock}</p></div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg"><p className="text-[10px] text-gray-500">قیمت واحد</p><p className="text-sm font-bold text-amber-500">{(part.unitPrice / 1000).toFixed(0)}K ریال</p></div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg"><p className="text-[10px] text-gray-500">Lead Time</p><p className="text-sm font-bold">{part.leadTime || "-"} روز</p></div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">دسته:</span><span className="font-bold">{part.category}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">برند:</span><span className="font-bold">{part.brand}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">محل نگهداری:</span><span className="font-bold">{part.location}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">تأمین‌کننده:</span><span className="font-bold">{part.supplier}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">مصرف ماهانه:</span><span className="font-bold text-amber-500">{part.monthlyConsumption || 0}</span></div>
          </div>

          {part.linkedEquipment && part.linkedEquipment.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2">تجهیزات مرتبط:</p>
              <div className="flex flex-wrap gap-1">
                {part.linkedEquipment.map(eq => (
                  <span key={eq} className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 font-mono">{eq}</span>
                ))}
              </div>
            </div>
          )}

          {part.aiPrediction && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs font-bold text-purple-600 mb-2 flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> تحلیل AI</p>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600 dark:text-gray-400">روزهای تا کمبود: <strong className={part.aiPrediction.daysUntilShortage <= 15 ? 'text-red-500' : 'text-amber-500'}>{part.aiPrediction.daysUntilShortage}</strong></p>
                <p className="text-gray-600 dark:text-gray-400">پیشنهاد سفارش: <strong className="text-amber-500">{part.aiPrediction.recommendedOrder} عدد</strong></p>
                <p className="text-gray-600 dark:text-gray-400">روند: <strong>{part.aiPrediction.trend === "increasing" ? "افزایشی" : part.aiPrediction.trend === "decreasing" ? "کاهشی" : "پایدار"}</strong></p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
          <button className="btn-secondary flex-1 justify-center"><Edit2 className="w-4 h-4" />ویرایش</button>
          <button className="btn-primary flex-1 justify-center"><ShoppingCart className="w-4 h-4" />سفارش</button>
        </div>
      </div>
    </div>
  );
}
