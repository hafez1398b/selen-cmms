"use client";

import { useState } from "react";
import {
  Database, FileSpreadsheet, TrendingUp, CheckCircle2, AlertCircle,
  Layers, Wrench, ClipboardList, History, Brain, Sparkles, ArrowLeft,
  Plus, Play, X, Loader2, ChevronRight, ChevronLeft, Package, Users, Upload,
  FileText, Image as ImageIcon, Edit2
} from "lucide-react";
import { calculateMigrationStats, historyRecordsData, activityTypes, standardSubsystems, wizardQuestions, getLastRecordDate, type HistoryRecord } from "@/lib/migration-data";
import { assetsTreeData, getAllRealEquipment, countRealEquipment, type AssetNode, type CategoryKey } from "@/lib/assets-data";
import { personnelData } from "@/lib/personnel-data";
import { useAppState } from "@/context/AppStateContext";
import { useToast } from "@/components/ui/Toast";
import { SmartImportGateway } from "@/components/features/import/SmartImportGateway";
import { SmartSelectList, type SmartListOption } from "@/components/ui/SmartSelectList";

type Tab = "dashboard" | "smart_import" | "wizard" | "history" | "ai_analysis";

export function MigrationPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const { setCurrentPage } = useAppState();

  const tabs = [
    { id: "dashboard" as const, label: "داشبورد", icon: TrendingUp },
    { id: "smart_import" as const, label: "درگاه هوشمند ورود", icon: Upload },
    { id: "wizard" as const, label: "ثبت گام‌به‌گام", icon: Sparkles },
    { id: "history" as const, label: "سوابق ثبت شده", icon: History },
    { id: "ai_analysis" as const, label: "تحلیل AI", icon: Brain },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Header */}
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 via-transparent to-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-600 dark:text-amber-500">مرکز مهاجرت اطلاعات</h2>
            <p className="text-xs text-gray-500 mt-0.5">تبدیل اطلاعات Excel/PDF/تصویر به CMMS استاندارد با AI</p>
          </div>
          <button
            onClick={() => setSmartImportOpen(true)}
            className="btn-primary text-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ورود سریع
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="chart-card !p-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[130px] px-3 py-2 rounded-lg text-xs whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isActive ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold shadow-md' : 'text-gray-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "dashboard" && <MigrationDashboard onTabChange={setTab} onOpenImport={() => setSmartImportOpen(true)} />}
      {tab === "smart_import" && <SmartImportView onOpen={() => setSmartImportOpen(true)} />}
      {tab === "wizard" && <WizardStep />}
      {tab === "history" && <HistoryList />}
      {tab === "ai_analysis" && <AIAnalysis />}

      <SmartImportGateway isOpen={smartImportOpen} onClose={() => setSmartImportOpen(false)} onImportComplete={data => console.log("Imported:", data)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// داشبورد مهاجرت - کارت‌های قابل کلیک
// ═══════════════════════════════════════════════════════════════
function MigrationDashboard({ onTabChange, onOpenImport }: { onTabChange: (t: Tab) => void; onOpenImport: () => void }) {
  const stats = calculateMigrationStats();
  const { setCurrentPage } = useAppState();

  const cards = [
    { label: "تعداد تجهیزات", value: countRealEquipment(), color: "#d4a017", icon: Package, action: () => setCurrentPage("assets"), actionLabel: "→ درخت تجهیزات" },
    { label: "زیرسیستم‌ها", value: assetsTreeData.filter(a => a.typeKey === "subsystem").length, color: "#3b82f6", icon: Layers, action: () => setCurrentPage("assets"), actionLabel: "→ مشاهده" },
    { label: "قطعات ثبت شده", value: assetsTreeData.filter(a => a.typeKey === "part" || a.typeKey === "subpart").length, color: "#8b5cf6", icon: Wrench, action: () => setCurrentPage("inventory"), actionLabel: "→ انبار" },
    { label: "برنامه‌های PM", value: stats.pmPlansCount, color: "#22c55e", icon: ClipboardList, action: () => setCurrentPage("maintenance"), actionLabel: "→ برنامه‌ها" },
    { label: "سوابق ثبت شده", value: stats.historyRecordsCount, color: "#06b6d4", icon: History, action: () => onTabChange("history"), actionLabel: "→ سوابق" },
    { label: "اطلاعات ناقص", value: stats.incompleteRecords, color: "#ef4444", icon: AlertCircle, action: () => onTabChange("wizard"), actionLabel: "→ تکمیل" },
  ];

  return (
    <div className="space-y-3">
      {/* Clickable Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={i}
              onClick={c.action}
              className="kpi-card !p-3 card-hover text-right group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.color + '20' }}>
                  <Icon className="w-4 h-4" style={{ color: c.color }} />
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
              </div>
              <p className="text-[10px] text-gray-500 mb-0.5">{c.label}</p>
              <p className="text-xl md:text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
              <p className="text-[9px] text-amber-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{c.actionLabel}</p>
            </button>
          );
        })}
      </div>

      {/* Bespar Progress - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentPage("assets")}
          className="chart-card !p-4 card-hover text-right group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm">پیشرفت مهاجرت بسپار ۱ (فوم)</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">ماشین‌آلات + تاسیسات + قطعات</p>
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-amber-500">{stats.bespar1Progress}%</span>
              <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-500 mr-auto mt-1" />
            </div>
          </div>
          <div className="progress-bar h-3">
            <div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${stats.bespar1Progress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px]">
            <div className="p-2 bg-green-500/10 rounded-lg"><p className="text-green-500 font-bold">۲۵</p><p className="text-gray-500">تجهیز کامل</p></div>
            <div className="p-2 bg-amber-500/10 rounded-lg"><p className="text-amber-500 font-bold">۴</p><p className="text-gray-500">در حال ثبت</p></div>
            <div className="p-2 bg-red-500/10 rounded-lg"><p className="text-red-500 font-bold">۳</p><p className="text-gray-500">ناقص</p></div>
          </div>
        </button>

        <button
          onClick={() => setCurrentPage("assets")}
          className="chart-card !p-4 card-hover text-right group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm">پیشرفت مهاجرت بسپار ۲ (مموری)</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">پرس، هیدرولیک، خنک‌کننده</p>
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-blue-500">{stats.bespar2Progress}%</span>
              <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mr-auto mt-1" />
            </div>
          </div>
          <div className="progress-bar h-3">
            <div className="progress-fill bg-gradient-to-l from-blue-500 to-blue-700" style={{ width: `${stats.bespar2Progress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px]">
            <div className="p-2 bg-green-500/10 rounded-lg"><p className="text-green-500 font-bold">۱۵</p><p className="text-gray-500">تجهیز کامل</p></div>
            <div className="p-2 bg-amber-500/10 rounded-lg"><p className="text-amber-500 font-bold">۶</p><p className="text-gray-500">در حال ثبت</p></div>
            <div className="p-2 bg-red-500/10 rounded-lg"><p className="text-red-500 font-bold">۵</p><p className="text-gray-500">ناقص</p></div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="chart-card !p-4">
        <h3 className="font-bold text-sm mb-3">اقدامات سریع</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={onOpenImport}
            className="p-3 rounded-xl border border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-bold text-right">ورود هوشمند</p>
            <p className="text-[10px] text-gray-500 text-right mt-0.5">Excel/PDF/عکس</p>
          </button>
          <button
            onClick={() => onTabChange("wizard")}
            className="p-3 rounded-xl border border-gray-200 dark:border-[#1a1a1a] hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-bold text-right">ثبت گام‌به‌گام</p>
            <p className="text-[10px] text-gray-500 text-right mt-0.5">ویزارد سؤالی</p>
          </button>
          <button
            onClick={() => onTabChange("history")}
            className="p-3 rounded-xl border border-gray-200 dark:border-[#1a1a1a] hover:border-green-500 hover:bg-green-500/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <History className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-bold text-right">مشاهده سوابق</p>
            <p className="text-[10px] text-gray-500 text-right mt-0.5">تاریخچه ثبت‌ها</p>
          </button>
          <button
            onClick={() => onTabChange("ai_analysis")}
            className="p-3 rounded-xl border border-gray-200 dark:border-[#1a1a1a] hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-bold text-right">تحلیل AI</p>
            <p className="text-[10px] text-gray-500 text-right mt-0.5">الگوها و توصیه</p>
          </button>
        </div>
      </div>

      {/* Phase Progress - Clickable */}
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">پیشرفت فازهای مهاجرت</h3>
        <div className="space-y-2">
          {[
            { name: "فاز ۱: تحلیل فایل‌ها", progress: 100, status: "completed", tab: "smart_import" },
            { name: "فاز ۲: ساخت ساختار سازمانی", progress: 100, status: "completed", tab: "dashboard", page: "assets" },
            { name: "فاز ۳: ایجاد ساختار تجهیزات", progress: 85, status: "in_progress", page: "assets" },
            { name: "فاز ۴: استخراج زیرسیستم‌ها", progress: 65, status: "in_progress", page: "assets" },
            { name: "فاز ۵: اتصال قطعات", progress: 45, status: "in_progress", page: "assets" },
            { name: "فاز ۶: استخراج برنامه‌های PM", progress: 55, status: "in_progress", page: "maintenance" },
            { name: "فاز ۷: استخراج سوابق تعمیرات", progress: 40, status: "in_progress", tab: "history" },
            { name: "فاز ۸: تکمیل سوابق ۱۴۰۴+ (ویزارد)", progress: 15, status: "in_progress", tab: "wizard" },
            { name: "فاز ۹: یادگیری AI", progress: 20, status: "in_progress", tab: "ai_analysis" },
          ].map((phase: any, i) => (
            <button
              key={i}
              onClick={() => {
                if (phase.page) setCurrentPage(phase.page);
                else if (phase.tab) onTabChange(phase.tab);
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors text-right group"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${phase.status === "completed" ? 'bg-green-500 text-white' : 'bg-amber-500/20 text-amber-500'}`}>
                {phase.status === "completed" ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{phase.name}</p>
                <div className="progress-bar mt-1">
                  <div className="progress-fill" style={{ width: `${phase.progress}%`, backgroundColor: phase.status === "completed" ? '#22c55e' : '#d4a017' }} />
                </div>
              </div>
              <span className="text-xs font-bold w-10 text-left" style={{ color: phase.status === "completed" ? '#22c55e' : '#d4a017' }}>{phase.progress}%</span>
              <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Smart Import View
// ═══════════════════════════════════════════════════════════════
function SmartImportView({ onOpen }: { onOpen: () => void }) {
  const sources = [
    { icon: FileSpreadsheet, label: "فایل Excel/CSV", desc: "ورود گروهی از جداول", color: "#22c55e", features: ["خواندن واقعی .xlsx", "تشخیص هوشمند ستون‌ها", "پشتیبانی چند شیت", "بررسی خطا و تکراری"] },
    { icon: FileText, label: "شناسنامه PDF", desc: "استخراج متن از PDF", color: "#ef4444", features: ["OCR فارسی/انگلیسی", "استخراج فیلدها", "شناسایی مدل و سریال", "پیش‌نمایش قبل ثبت"] },
    { icon: ImageIcon, label: "تصویر نامپلیت", desc: "OCR از عکس", color: "#8b5cf6", features: ["پردازش JPG/PNG", "تشخیص برند و مدل", "استخراج شماره سریال", "ویرایش دستی"] },
    { icon: Edit2, label: "ورود دستی", desc: "فرم گام به گام", color: "#3b82f6", features: ["۸ مرحله ساختاریافته", "دسته‌بندی خودکار", "پیشنهاد AI", "بدون نیاز به فایل"] },
  ];

  return (
    <div className="space-y-3">
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-600 dark:text-amber-500">درگاه هوشمند ورود</h3>
            <p className="text-xs text-gray-500 mt-1">۴ روش برای ثبت تجهیزات - انتخاب کنید</p>
          </div>
          <button onClick={onOpen} className="btn-primary text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            شروع
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={onOpen}
              className="chart-card !p-4 card-hover text-right group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: s.color + '20' }}>
                  <Icon className="w-7 h-7" style={{ color: s.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{s.label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{s.desc}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
              </div>
              <div className="space-y-1">
                {s.features.map((f, j) => (
                  <p key={j} className="text-[10px] text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ویزارد گام به گام
// ═══════════════════════════════════════════════════════════════
function WizardStep() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [selectedBespar, setSelectedBespar] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<AssetNode | null>(null);
  const [hasNewActivity, setHasNewActivity] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const bespars = ["بسپار ۱ (فوم)", "بسپار ۲ (مموری)", "بسپار ۳ (اسفنج)", "بسپار ۴", "بسپار ۵", "بسپار ۶", "تاسیسات جانبی"];
  const locations = ["سالن تولید اصلی", "سالن مواد اولیه", "انبار محصول", "سالن پرس", "موتورخانه", "پست برق"];
  const equipmentList = getAllRealEquipment().filter(a => a.typeKey === "equipment").slice(0, 15);

  const reset = () => {
    setStep(0);
    setSelectedBespar("");
    setSelectedLocation("");
    setSelectedEquipment(null);
    setHasNewActivity(null);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const submitRecord = () => {
    toast.success("ثبت موفق", `سابقه جدید برای ${selectedEquipment?.name} ذخیره شد`);
    reset();
  };

  const totalSteps = step >= 5 ? 5 + wizardQuestions.length : 5;
  const currentStepNum = step >= 5 ? 5 + currentQuestion : step;
  const progress = Math.round((currentStepNum / totalSteps) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="chart-card !p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-amber-500">پیشرفت ثبت سابقه</p>
          <span className="text-xs text-gray-500">{currentStepNum} از {totalSteps}</span>
        </div>
        <div className="progress-bar h-2">
          <div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 && (
        <div className="chart-card !p-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏭</span>
            </div>
            <h3 className="text-lg font-bold">مرحله ۱: انتخاب کارخانه</h3>
            <p className="text-[10px] text-gray-500 mt-1">اگر مورد نظر نیست، «افزودن مورد جدید» را بزنید</p>
          </div>
          <SmartSelectList
            options={bespars.map(b => ({ value: b, label: b, icon: "🏭" }))}
            value={selectedBespar}
            onChange={(v) => { if (v) { setSelectedBespar(v); setStep(1); } }}
            storageKey="migration_bespars"
            columns={3}
            addLabel="افزودن کارخانه/بسپار جدید"
          />
        </div>
      )}

      {step === 1 && (
        <div className="chart-card !p-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-bold">مرحله ۲: انتخاب موقعیت</h3>
            <p className="text-xs text-gray-500 mt-1">موقعیت در {selectedBespar}</p>
          </div>
          <SmartSelectList
            options={locations.map(l => ({ value: l, label: l, icon: "📍" }))}
            value={selectedLocation}
            onChange={(v) => { if (v) { setSelectedLocation(v); setStep(2); } }}
            storageKey={`migration_locations_${selectedBespar}`}
            columns={3}
            addLabel="افزودن موقعیت جدید"
          />
          <button onClick={() => setStep(0)} className="btn-secondary mt-4 justify-center w-full">بازگشت</button>
        </div>
      )}

      {step === 2 && (
        <div className="chart-card !p-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-lg font-bold">مرحله ۳: انتخاب تجهیز</h3>
            <p className="text-[10px] text-gray-500 mt-1">اگر تجهیز جدیدی نصب کردید، آن را اضافه کنید</p>
          </div>
          <SmartSelectList
            options={equipmentList.map(eq => ({
              value: String(eq.id),
              label: eq.name,
              description: `${eq.code} • ${eq.manufacturer || ""} ${eq.model || ""}`,
              icon: "⚙️",
            }))}
            value={selectedEquipment ? String(selectedEquipment.id) : ""}
            onChange={(v, label) => {
              if (!v) return;
              const eq = equipmentList.find(e => String(e.id) === v);
              if (eq) {
                setSelectedEquipment(eq);
              } else {
                // Custom equipment - create a temporary asset
                setSelectedEquipment({
                  id: Date.now(),
                  code: `NEW-${Date.now()}`,
                  name: label,
                  parentId: null,
                  typeKey: "equipment",
                  level: 5,
                  path: "",
                  status: "active",
                  healthScore: 100,
                  criticality: "medium",
                });
              }
              setStep(3);
            }}
            storageKey={`migration_equipment_${selectedBespar}_${selectedLocation}`}
            columns={2}
            addLabel="افزودن تجهیز جدید (به صورت موقت)"
          />
          <button onClick={() => setStep(1)} className="btn-secondary mt-4 justify-center w-full">بازگشت</button>
        </div>
      )}

      {step === 3 && selectedEquipment && (
        <div className="chart-card !p-6 animate-fade-in">
          <div className="text-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-bold">مرحله ۴: آخرین سابقه</h3>
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/30 rounded-xl mb-4">
            <p className="text-xs text-gray-500 mb-2">تجهیز:</p>
            <p className="font-bold text-sm mb-3">{selectedEquipment.name}</p>
            <p className="text-xs text-gray-500 mb-2">آخرین سابقه:</p>
            <p className="text-sm text-amber-600 dark:text-amber-500 font-bold">
              {getLastRecordDate(selectedEquipment.id) || "هیچ سابقه‌ای ثبت نشده است"}
            </p>
          </div>
          <button onClick={() => setStep(4)} className="btn-primary w-full justify-center">ادامه</button>
        </div>
      )}

      {step === 4 && (
        <div className="chart-card !p-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">❓</span>
            </div>
            <h3 className="text-lg font-bold">مرحله ۵: سوال کلیدی</h3>
            <p className="text-xs text-gray-500 mt-2">
              آیا بعد از این تاریخ اقدامی روی <strong>{selectedEquipment?.name}</strong> انجام شده؟
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button onClick={() => { setHasNewActivity(true); setStep(5); setCurrentQuestion(0); }}
              className="p-6 rounded-2xl border-2 border-green-500/40 bg-green-500/10">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-500">بله</p>
            </button>
            <button onClick={() => { toast.info("ثبت شد", "سابقه جدیدی نیست"); reset(); }}
              className="p-6 rounded-2xl border-2 border-gray-300 dark:border-[#2a2a2a]">
              <X className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="font-bold text-gray-500">خیر</p>
            </button>
          </div>
        </div>
      )}

      {step === 5 && hasNewActivity && currentQuestion < wizardQuestions.length && (
        <WizardQuestion
          questionIndex={currentQuestion}
          totalQuestions={wizardQuestions.length}
          answer={answers[currentQuestion]}
          onAnswer={(a: any) => setAnswers({ ...answers, [currentQuestion]: a })}
          onNext={() => {
            if (currentQuestion < wizardQuestions.length - 1) setCurrentQuestion(currentQuestion + 1);
            else setStep(6);
          }}
          onBack={() => currentQuestion > 0 ? setCurrentQuestion(currentQuestion - 1) : setStep(4)}
        />
      )}

      {step === 6 && (
        <div className="chart-card !p-6 animate-fade-in">
          <div className="text-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold">خلاصه اطلاعات</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-xs">
              <p className="text-gray-500">کارخانه: <strong>{selectedBespar}</strong></p>
              <p className="text-gray-500 mt-1">موقعیت: <strong>{selectedLocation}</strong></p>
              <p className="text-gray-500 mt-1">تجهیز: <strong className="text-amber-500">{selectedEquipment?.name}</strong></p>
            </div>
            {wizardQuestions.map((q, i) => answers[i] && (
              <div key={q.id} className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-xs border-r-2 border-amber-500/40">
                <p className="text-gray-500 font-bold mb-1">{q.question}</p>
                <p>{String(answers[i])}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(5)} className="btn-secondary flex-1 justify-center">ویرایش</button>
            <button onClick={submitRecord} className="btn-primary flex-1 justify-center">
              <CheckCircle2 className="w-4 h-4" /> تایید و ثبت
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WizardQuestion({ questionIndex, totalQuestions, answer, onAnswer, onNext, onBack }: any) {
  const q = wizardQuestions[questionIndex];
  return (
    <div className="chart-card !p-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-black text-amber-500">{q.id}</span>
        </div>
        <p className="text-[10px] text-gray-500 mb-1">سوال {questionIndex + 1} از {totalQuestions}</p>
        <h3 className="text-lg font-bold">{q.question}</h3>
        {q.required && <p className="text-[10px] text-red-500 mt-1">* الزامی</p>}
      </div>

      <div className="max-w-md mx-auto">
        {q.type === "date" && (
          <input type="text" placeholder="۱۴۰۴/۱۲/۲۸" value={answer || ""} onChange={e => onAnswer(e.target.value)} className="input-field text-center" dir="ltr" />
        )}
        {q.type === "number" && (
          <input type="number" placeholder="مقدار" value={answer || ""} onChange={e => onAnswer(e.target.value)} className="input-field text-center" />
        )}
        {q.type === "textarea" && (
          <textarea placeholder="پاسخ خود را بنویسید..." value={answer || ""} onChange={e => onAnswer(e.target.value)} className="input-field min-h-[120px] resize-y" />
        )}

        {/* Select → SmartSelectList with add capability */}
        {q.type === "select" && (
          <SmartSelectList
            options={(q.options || []).map((o: string) => ({ value: o, label: o }))}
            value={answer || ""}
            onChange={(v) => onAnswer(v)}
            storageKey={`wizard_q${q.id}`}
            columns={2}
            addLabel="افزودن گزینه جدید"
          />
        )}

        {q.type === "radio" && (
          <div className="grid grid-cols-2 gap-2">
            {q.options?.map((o: string) => (
              <button key={o} onClick={() => onAnswer(o)}
                className={`p-4 rounded-xl border-2 ${answer === o ? 'border-amber-500 bg-amber-500/10 font-bold' : 'border-gray-200 dark:border-[#1a1a1a]'}`}>
                {o}
              </button>
            ))}
          </div>
        )}

        {/* Parts → SmartSelectList with multiple selection */}
        {q.type === "parts" && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 mb-2">قطعات مصرف شده را انتخاب یا اضافه کنید:</p>
            <SmartSelectList
              options={[
                { value: "بلبرینگ 6205", label: "بلبرینگ 6205", icon: "🔩" },
                { value: "روغن هیدرولیک", label: "روغن هیدرولیک ISO 46", icon: "🛢️" },
                { value: "فیلتر روغن", label: "فیلتر روغن", icon: "⚪" },
                { value: "سیل روغن", label: "سیل روغن", icon: "⭕" },
                { value: "تسمه", label: "تسمه V-Belt", icon: "🔗" },
                { value: "کنتاکتور", label: "کنتاکتور", icon: "⚡" },
                { value: "فیوز", label: "فیوز", icon: "🔥" },
              ]}
              value={answer || ""}
              onChange={(v) => onAnswer(v)}
              storageKey="wizard_parts"
              columns={2}
              addLabel="افزودن قطعه جدید"
            />
          </div>
        )}

        {/* Personnel → SmartSelectList from personnelData */}
        {q.type === "personnel" && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 mb-2">نفرات درگیر را انتخاب یا اضافه کنید:</p>
            <SmartSelectList
              options={personnelData.map(p => ({
                value: p.fullName,
                label: p.fullName,
                description: `${p.position} • ${p.department}`,
                icon: "👤",
              }))}
              value={answer || ""}
              onChange={(v) => onAnswer(v)}
              storageKey="wizard_personnel"
              columns={2}
              addLabel="افزودن پرسنل/پیمانکار جدید"
            />
          </div>
        )}

        {q.type === "file" && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl py-8 cursor-pointer hover:border-amber-500 transition-colors">
            <span className="text-3xl mb-2">📎</span>
            <p className="text-xs">فایل بارگذاری کنید (اختیاری)</p>
            <p className="text-[10px] text-gray-500 mt-1">فرمت‌های مجاز: JPG, PNG, PDF</p>
            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onAnswer(e.target.files[0].name)} />
            {answer && <p className="text-[10px] text-green-500 mt-2">✓ {answer}</p>}
          </label>
        )}
      </div>

      <div className="flex gap-2 mt-6 max-w-md mx-auto">
        <button onClick={onBack} className="btn-secondary flex-1 justify-center">← قبلی</button>
        <button onClick={onNext} disabled={q.required && !answer} className="btn-primary flex-1 justify-center disabled:opacity-40">
          {questionIndex === totalQuestions - 1 ? "پایان" : "بعدی ←"}
        </button>
      </div>
    </div>
  );
}

// History List
function HistoryList() {
  return (
    <div className="chart-card">
      <h3 className="font-bold text-sm mb-3">سوابق ثبت شده ({historyRecordsData.length})</h3>
      <div className="space-y-2">
        {historyRecordsData.map(r => {
          const cfg = activityTypes[r.activityType];
          return (
            <div key={r.id} className="p-3 rounded-lg border-r-4 border border-gray-200 dark:border-[#1a1a1a]" style={{ borderRightColor: cfg.color }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-gray-500">{r.date}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">{r.bespar}</span>
                  </div>
                  <p className="text-sm font-bold">{r.description}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{r.equipmentName} • {r.location}</p>
                </div>
                {r.isConfirmed && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] pt-2 border-t border-gray-100 dark:border-[#0a0a0a]">
                <p className="text-gray-500">👥 {r.technicians.join("، ")}</p>
                <p className="text-gray-500">⏱ {r.downtimeHours}h توقف</p>
                <p className="text-gray-500">💰 {(r.cost / 1000000).toFixed(1)}M ریال</p>
                <p className="text-gray-500">📎 {r.hasPhotos ? "📷" : ""} {r.hasFiles ? "📄" : ""}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// AI Analysis
function AIAnalysis() {
  return (
    <div className="space-y-3">
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 to-transparent">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">تحلیل هوش مصنوعی</h3>
            <p className="text-xs text-gray-500 mt-1">AI تمام {historyRecordsData.length} سابقه را تحلیل کرد</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="chart-card !p-4">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />خرابی‌های پرتکرار
          </h4>
          <div className="space-y-2">
            {[
              { name: "خرابی بلبرینگ 6205", count: 5 },
              { name: "نشتی سیل روغن", count: 3 },
              { name: "خرابی فیلتر هیدرولیک", count: 2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-red-500/5 rounded-lg">
                <span className="text-xs">{item.name}</span>
                <span className="text-xs font-bold text-red-500">{item.count} بار</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card !p-4">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />قطعات پرمصرف
          </h4>
          <div className="space-y-2">
            {[
              { name: "بلبرینگ 6205", count: 8 },
              { name: "روغن ISO 46", count: 45 },
              { name: "فیلتر روغن", count: 6 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-amber-500/5 rounded-lg">
                <span className="text-xs">{item.name}</span>
                <span className="text-xs font-bold text-amber-500">{item.count} عدد</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card !p-4">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" />پیشنهاد تغییر تناوب PM
          </h4>
          <div className="space-y-2">
            <div className="p-2 bg-blue-500/5 rounded-lg text-xs">
              <p className="font-bold">میکسر MX-101</p>
              <p className="text-gray-500 mt-1">۹۰ روز → <strong className="text-blue-500">۶۰ روز</strong></p>
            </div>
            <div className="p-2 bg-blue-500/5 rounded-lg text-xs">
              <p className="font-bold">بازرسی وایبرشن</p>
              <p className="text-gray-500 mt-1">ماهانه → <strong className="text-blue-500">هفتگی</strong></p>
            </div>
          </div>
        </div>

        <div className="chart-card !p-4">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />الگوها
          </h4>
          <div className="space-y-2">
            <div className="p-2 bg-green-500/5 rounded-lg text-xs">
              <p>خرابی بلبرینگ در تابستان <strong className="text-red-500">۴۰٪</strong> بیشتر</p>
            </div>
            <div className="p-2 bg-green-500/5 rounded-lg text-xs">
              <p>پس از ۴۰۰ ساعت کارکرد، خرابی هیدرولیک <strong className="text-amber-500">افزایش</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
