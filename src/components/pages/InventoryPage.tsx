"use client";
import { useAppState } from "@/context/AppStateContext";
import { sparePartsData, getStatusBadge } from "@/lib/data";
import { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, Package, Sparkles, TrendingDown, TrendingUp,
  AlertCircle, Brain, Target, ShoppingCart, Zap, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend, PieChart, Pie, Cell
} from "recharts";

export function InventoryPage() {
  const { setModalOpen, setModalType, setSelectedItem } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAIForm, setShowAIForm] = useState(false);

  let filtered = sparePartsData;
  if (searchTerm) filtered = filtered.filter(s => s.name.includes(searchTerm) || s.code.includes(searchTerm));
  const totalValue = sparePartsData.reduce((s, p) => s + Number(p.unitPrice) * p.currentStock, 0);
  const lowStock = sparePartsData.filter(s => s.status === "low_stock" || s.status === "out_of_stock");

  // Smart consumption data (last 6 months)
  const consumptionData = [
    { month: "شهریور", used: 45, ordered: 40, predicted: 42 },
    { month: "مهر", used: 52, ordered: 48, predicted: 50 },
    { month: "آبان", used: 38, ordered: 45, predicted: 41 },
    { month: "آذر", used: 61, ordered: 55, predicted: 58 },
    { month: "دی", used: 55, ordered: 60, predicted: 57 },
    { month: "بهمن", used: 48, ordered: 50, predicted: 52 },
    { month: "اسفند (پیش‌بینی)", used: 0, ordered: 0, predicted: 55 },
    { month: "فروردین (پیش‌بینی)", used: 0, ordered: 0, predicted: 62 },
  ];

  // Category distribution
  const categoryData = [
    { name: "بلبرینگ", value: 25, color: "#d4a017" },
    { name: "تسمه", value: 15, color: "#3b82f6" },
    { name: "فیلتر", value: 20, color: "#22c55e" },
    { name: "سنسور", value: 10, color: "#8b5cf6" },
    { name: "الکتریکی", value: 18, color: "#f59e0b" },
    { name: "روغن و گریس", value: 12, color: "#ef4444" },
  ];

  // AI Recommendations
  const aiRecommendations = [
    {
      icon: AlertCircle,
      severity: "critical",
      title: "کمبود قریب‌الوقوع اورینگ سیلندر",
      desc: "بر اساس مصرف ۳ ماه اخیر (میانگین ۱۲ عدد/ماه)، این قطعه در ۵ روز آینده تمام می‌شود. توصیه: سفارش فوری ۵۰ عدد.",
      action: "سفارش خودکار",
    },
    {
      icon: Brain,
      severity: "high",
      title: "نقطه سفارش بهینه شده با AI",
      desc: "برای تسمه V-Belt B68، حداقل موجودی ۵ عدد نامناسب است. با تحلیل الگوی مصرف، نقطه سفارش بهینه = ۸ عدد.",
      action: "اعمال بهینه‌سازی",
    },
    {
      icon: TrendingUp,
      severity: "medium",
      title: "پیش‌بینی افزایش مصرف بلبرینگ",
      desc: "به دلیل افزایش ساعت کار آسیاب صنعتی، مصرف بلبرینگ در ۲ ماه آینده ۳۰٪ افزایش خواهد یافت.",
      action: "افزایش موجودی",
    },
    {
      icon: Target,
      severity: "medium",
      title: "قطعات کم‌گردش شناسایی شد",
      desc: "کنتاکتور 3RT60 در ۶ ماه اخیر مصرف نشده. توصیه: کاهش موجودی از ۴ به ۲ عدد برای آزادسازی ۵ میلیون ریال.",
      action: "بازبینی موجودی",
    },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">

      {/* Header with AI */}
      <div className="chart-card !p-3 md:!p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-lg font-bold text-amber-600 dark:text-amber-500">انبار هوشمند قطعات یدکی</h2>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 mt-0.5">مدیریت هوشمند موجودی با تحلیل و پیش‌بینی AI</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => setShowAIForm(true)}
              className="btn-primary text-xs flex-1 md:flex-initial justify-center whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" /> افزودن هوشمند
            </button>
            <button
              onClick={() => { setModalType("addSparePart"); setSelectedItem(null); setModalOpen(true); }}
              className="btn-secondary text-xs flex-1 md:flex-initial justify-center whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> افزودن دستی
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "کل قطعات", value: sparePartsData.length, color: "#3b82f6", icon: Package },
          { label: "ارزش انبار", value: (totalValue / 1000000).toFixed(1) + "M", color: "#d4a017", icon: BarChart3 },
          { label: "کمبود", value: lowStock.length, color: "#ef4444", icon: AlertCircle },
          { label: "پیش‌بینی AI", value: "۸", color: "#8b5cf6", icon: Brain },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '18' }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h4 className="text-red-600 dark:text-red-400 font-bold text-sm">هشدار کمبود موجودی:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(s => (
              <span key={s.id} className="text-xs bg-red-500/20 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
                {s.name} ({s.currentStock})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Smart Consumption Chart */}
        <div className="chart-card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm">نمودار مصرف هوشمند</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">مقایسه مصرف واقعی، سفارش و پیش‌بینی AI</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-amber-600 dark:text-amber-400">پیش‌بینی AI</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData}>
                <defs>
                  <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                <XAxis dataKey="month" stroke="#888" fontSize={9} tick={{ fill: '#888' }} />
                <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="used" name="مصرف واقعی" stroke="#d4a017" fill="url(#usedGrad)" strokeWidth={2} />
                <Line type="monotone" dataKey="ordered" name="سفارش" stroke="#3b82f6" strokeWidth={2} />
                <Area type="monotone" dataKey="predicted" name="پیش‌بینی AI" stroke="#8b5cf6" fill="url(#predictGrad)" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-1">توزیع دسته‌بندی</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-3">تعداد قطعات هر دسته</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="chart-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">توصیه‌های هوش مصنوعی انبار</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-500">تحلیل خودکار و پیش‌بینی نیازهای انبار</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiRecommendations.map((rec, i) => {
            const Icon = rec.icon;
            const colors = {
              critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500', btn: 'bg-red-500 hover:bg-red-600' },
              high: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 text-[#0a0a0a]' },
              medium: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500', btn: 'bg-blue-500 hover:bg-blue-600' },
            };
            const c = colors[rec.severity as keyof typeof colors];
            return (
              <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{rec.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{rec.desc}</p>
                    <button className={`mt-3 text-[11px] px-3 py-1 rounded-md text-white font-medium ${c.btn} transition-colors`}>
                      {rec.action}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="chart-card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
            <input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-10" />
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {filtered.map(sp => (
          <div key={sp.id} className="chart-card !p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-gray-500">{sp.code}</span>
                  <span className="text-[9px] text-gray-500">• {sp.category}</span>
                </div>
                <p className="text-sm font-bold">{sp.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">محل: {sp.location}</p>
              </div>
              <span className={`badge ${getStatusBadge(sp.status).className} flex-shrink-0`}>{getStatusBadge(sp.status).label}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
              <div className="flex items-center gap-3 text-[10px]">
                <div>
                  <span className="text-gray-500">موجودی: </span>
                  <span className={sp.currentStock <= sp.minimumStock ? "text-red-500 font-bold" : "text-green-500 font-bold"}>{sp.currentStock}</span>
                </div>
                <div>
                  <span className="text-gray-500">حداقل: </span>
                  <span className="text-gray-600 dark:text-gray-400">{sp.minimumStock}</span>
                </div>
                <div>
                  <span className="text-gray-500">قیمت: </span>
                  <span className="text-amber-500 font-bold">{(Number(sp.unitPrice) / 1000).toFixed(0)}K</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500" onClick={() => { setModalType("editSparePart"); setSelectedItem(sp); setModalOpen(true); }}>
                  <Edit2 className="w-3 h-3" />
                </button>
                <button className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block chart-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">کد</th>
                <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">نام</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">دسته</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">موجودی</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">حداقل</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">قیمت</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">محل</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">وضعیت</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-500 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sp => (
                <tr key={sp.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">{sp.code}</td>
                  <td className="py-3 px-4 font-medium">{sp.name}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">{sp.category}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={sp.currentStock <= sp.minimumStock ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                      {sp.currentStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{sp.minimumStock}</td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{Number(sp.unitPrice).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">{sp.location}</td>
                  <td className="py-3 px-4 text-center"><span className={`badge ${getStatusBadge(sp.status).className}`}>{getStatusBadge(sp.status).label}</span></td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-amber-500" onClick={() => { setModalType("editSparePart"); setSelectedItem(sp); setModalOpen(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart AI Form Modal */}
      {showAIForm && <SmartInventoryForm onClose={() => setShowAIForm(false)} />}
    </div>
  );
}

// Smart Step-by-Step AI Form
function SmartInventoryForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    partNumber: "",
    linkedAsset: "",
    unitPrice: "",
    initialStock: "",
    location: "",
  });

  // AI Suggestions (simulated)
  const aiSuggestions = {
    minimumStock: 8,
    reorderPoint: 12,
    maxStock: 25,
    supplier: "شرکت پارت تجارت",
    leadTime: 14,
    consumptionPattern: "متوسط - ۳ عدد در ماه",
    similarParts: ["بلبرینگ 6204-2RS", "بلبرینگ 6206-2RS"],
    priceRange: "۷۵۰,۰۰۰ - ۹۰۰,۰۰۰ ریال",
  };

  const totalSteps = 4;

  const stepTitles = [
    "اطلاعات اولیه قطعه",
    "دسته‌بندی و اتصال به تجهیز",
    "اطلاعات مالی و انبار",
    "تحلیل و توصیه هوش مصنوعی",
  ];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Smart form submitted:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-600 dark:text-amber-500">افزودن هوشمند قطعه یدکی</h3>
                <p className="text-[10px] text-gray-500">فرم گام به گام با کمک هوش مصنوعی</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl">✕</button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isDone = stepNum < step;
              return (
                <div key={i} className="flex-1 flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isDone ? 'bg-green-500 text-white' :
                        isActive ? 'bg-amber-500 text-[#0a0a0a] animate-pulse-glow' :
                        'bg-gray-200 dark:bg-[#1a1a1a] text-gray-400'}`}
                  >
                    {isDone ? '✓' : stepNum}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`flex-1 h-0.5 ${stepNum < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            گام {step} از {totalSteps}: <span className="text-amber-600 dark:text-amber-500 font-bold">{stepTitles[step - 1]}</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-5 min-h-[280px]">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">نام قطعه <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="مثال: بلبرینگ 6205-2RS"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                {formData.name.length > 2 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-500">
                    <Sparkles className="w-3 h-3" />
                    <span>AI پیشنهاد می‌کند: قطعات مشابه یافت شد</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">شماره فنی</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Part Number"
                    value={formData.partNumber}
                    onChange={e => setFormData({ ...formData, partNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">سازنده</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="SKF، NSK، ..."
                    value={formData.manufacturer}
                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">راهنمای AI</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                      نام دقیق قطعه با استاندارد یا شماره فنی وارد کنید تا سیستم بتواند قطعات مشابه و تامین‌کنندگان را شناسایی کند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">دسته‌بندی <span className="text-red-500">*</span></label>
                <select
                  className="select-field"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">انتخاب کنید...</option>
                  <option>بلبرینگ</option>
                  <option>تسمه</option>
                  <option>فیلتر</option>
                  <option>سنسور</option>
                  <option>الکتریکی</option>
                  <option>روغن و گریس</option>
                  <option>واشر و اورینگ</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">تجهیز مرتبط</label>
                <select
                  className="select-field"
                  value={formData.linkedAsset}
                  onChange={e => setFormData({ ...formData, linkedAsset: e.target.value })}
                >
                  <option value="">بدون اتصال</option>
                  <option>دستگاه آسیاب صنعتی</option>
                  <option>نوار نقاله اصلی</option>
                  <option>پمپ هیدرولیک</option>
                  <option>کمپرسور هوا</option>
                  <option>موتور الکتریکی</option>
                </select>
              </div>
              {formData.linkedAsset && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">تحلیل هوشمند</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                        <strong>{formData.linkedAsset}</strong> در ۶ ماه اخیر <strong>۴ خرابی</strong> داشته. AI پیشنهاد می‌کند حداقل موجودی این قطعه <strong>{aiSuggestions.minimumStock} عدد</strong> باشد.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">قیمت واحد (ریال)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="۸۵۰,۰۰۰"
                    value={formData.unitPrice}
                    onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                  <p className="text-[10px] text-amber-500 mt-1">
                    <Sparkles className="inline w-3 h-3" /> بازه بازار: {aiSuggestions.priceRange}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">موجودی اولیه</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="۱۰"
                    value={formData.initialStock}
                    onChange={e => setFormData({ ...formData, initialStock: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">محل نگهداری</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="قفسه A-1"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">تامین‌کننده پیشنهادی AI</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                      <strong>{aiSuggestions.supplier}</strong> - زمان تحویل: {aiSuggestions.leadTime} روز - رتبه ۴.۸/۵
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">تحلیل کامل AI برای این قطعه</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">حداقل موجودی توصیه شده</p>
                  <p className="text-xl font-black text-amber-500">{aiSuggestions.minimumStock} عدد</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">نقطه سفارش</p>
                  <p className="text-xl font-black text-blue-500">{aiSuggestions.reorderPoint} عدد</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">حداکثر موجودی</p>
                  <p className="text-xl font-black text-green-500">{aiSuggestions.maxStock} عدد</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">الگوی مصرف</p>
                  <p className="text-sm font-bold text-purple-500 mt-1">{aiSuggestions.consumptionPattern}</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">✨ خلاصه توصیه‌های AI</p>
                <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• قیمت وارد شده در بازه معقول قرار دارد ✓</li>
                  <li>• تامین‌کننده پیشنهاد شده با بالاترین امتیاز</li>
                  <li>• قطعات مشابه در انبار: {aiSuggestions.similarParts.join(', ')}</li>
                  <li>• برنامه سفارش خودکار فعال خواهد شد</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-[#1a1a1a] flex justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            → مرحله قبل
          </button>
          {step < totalSteps ? (
            <button onClick={handleNext} className="btn-primary">
              مرحله بعد ←
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary">
              <Sparkles className="w-4 h-4" /> ذخیره با AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
