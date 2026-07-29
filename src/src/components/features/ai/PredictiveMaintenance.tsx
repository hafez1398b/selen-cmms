"use client";

import { assetsTreeData } from "@/lib/assets-data";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar } from "recharts";
import { Brain, AlertTriangle, TrendingDown, Zap, Target, Sparkles, ChevronLeft, DollarSign, Clock } from "lucide-react";

interface Prediction {
  assetId: number;
  assetName: string;
  assetCode: string;
  failureProbability: number; // 0-100
  daysUntilFailure: number;
  confidence: number;
  recommendedAction: string;
  estimatedSaving: number; // Million Rial
  criticality: "low" | "medium" | "high" | "critical";
  failureMode: string;
}

// Simulated AI predictions
const predictions: Prediction[] = [
  { assetId: 8, assetName: "پمپ هیدرولیک HP-350", assetCode: "EQ-003", failureProbability: 87, daysUntilFailure: 15, confidence: 92, recommendedAction: "تعویض بلبرینگ و سیل روغن", estimatedSaving: 45, criticality: "critical", failureMode: "فرسودگی مکانیکی" },
  { assetId: 44, assetName: "دستگاه بسته‌بندی PK-301", assetCode: "PK-301", failureProbability: 72, daysUntilFailure: 25, confidence: 85, recommendedAction: "بازرسی و کالیبراسیون سنسورها", estimatedSaving: 28, criticality: "high", failureMode: "خرابی الکترونیکی" },
  { assetId: 13, assetName: "میکسر اصلی MX-101", assetCode: "MX-101", failureProbability: 45, daysUntilFailure: 45, confidence: 78, recommendedAction: "تعویض روغن و بازرسی وایبرشن", estimatedSaving: 18, criticality: "high", failureMode: "افزایش وایبرشن" },
  { assetId: 24, assetName: "میکسر فرعی MX-102", assetCode: "MX-102", failureProbability: 38, daysUntilFailure: 60, confidence: 72, recommendedAction: "PM تقویتی و بازرسی موتور", estimatedSaving: 12, criticality: "medium", failureMode: "کاهش MTBF" },
];

export function PredictiveMaintenance() {
  const totalSaving = predictions.reduce((s, p) => s + p.estimatedSaving, 0);
  const criticalCount = predictions.filter(p => p.criticality === "critical").length;

  return (
    <div className="space-y-4">
      {/* AI Header */}
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 via-transparent to-amber-500/10 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center animate-pulse-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-amber-600 dark:text-amber-500">پیش‌بینی خرابی با هوش مصنوعی</h3>
            <p className="text-xs text-gray-500 mt-1">
              تحلیل بر اساس ML و تاریخچه ۱۲ ماه اخیر • آخرین به‌روزرسانی: هم‌اکنون
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
              <span className="flex items-center gap-1 text-red-500 font-bold">
                <AlertTriangle className="w-3 h-3" /> {criticalCount} تجهیز بحرانی
              </span>
              <span className="flex items-center gap-1 text-green-500 font-bold">
                <DollarSign className="w-3 h-3" /> {totalSaving}M ریال صرفه‌جویی
              </span>
              <span className="flex items-center gap-1 text-blue-500 font-bold">
                <Target className="w-3 h-3" /> {predictions.length} پیش‌بینی فعال
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {predictions.map(pred => {
          const color =
            pred.criticality === "critical" ? "#ef4444" :
            pred.criticality === "high" ? "#f59e0b" :
            pred.criticality === "medium" ? "#3b82f6" : "#22c55e";
          return (
            <div key={pred.assetId} className="chart-card !p-4 border-r-4" style={{ borderRightColor: color }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] font-mono text-gray-500">{pred.assetCode}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: color + '20', color }}>
                      {pred.criticality === "critical" ? "بحرانی" : pred.criticality === "high" ? "بالا" : pred.criticality === "medium" ? "متوسط" : "پایین"}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{pred.assetName}</p>
                </div>
                <div className="text-center">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-[#1a1a1a]" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pred.failureProbability}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black" style={{ color }}>{pred.failureProbability}</span>
                      <span className="text-[7px] text-gray-500">احتمال</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <p className="text-[9px] text-gray-500">تا خرابی</p>
                  <p className="font-bold" style={{ color }}>{pred.daysUntilFailure}<span className="text-[9px] mr-0.5">روز</span></p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <p className="text-[9px] text-gray-500">اطمینان AI</p>
                  <p className="font-bold text-purple-500">{pred.confidence}%</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <p className="text-[9px] text-gray-500">صرفه‌جویی</p>
                  <p className="font-bold text-green-500">{pred.estimatedSaving}M</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold text-amber-600 dark:text-amber-500 mb-0.5">توصیه AI:</p>
                  <p className="text-gray-600 dark:text-gray-400">{pred.recommendedAction}</p>
                  <p className="text-gray-500 mt-1">حالت خرابی: <strong>{pred.failureMode}</strong></p>
                </div>
              </div>

              <button className="btn-primary text-xs w-full mt-3 justify-center">
                <Zap className="w-3.5 h-3.5" /> ایجاد PM اضطراری
              </button>
            </div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">روند پیش‌بینی سلامت تجهیزات (۱۲ ماه آینده)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={[
            { month: "بهمن", health: 89, predicted: 89 },
            { month: "اسفند", health: 89, predicted: 87 },
            { month: "فروردین", health: 89, predicted: 85 },
            { month: "اردیبهشت", health: 89, predicted: 82 },
            { month: "خرداد", health: 89, predicted: 78 },
            { month: "تیر", health: 89, predicted: 75 },
            { month: "مرداد", health: 89, predicted: 72 },
            { month: "شهریور", health: 89, predicted: 68 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
            <XAxis dataKey="month" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
            <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} domain={[50, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            <Line type="monotone" dataKey="health" name="سلامت فعلی" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="predicted" name="پیش‌بینی AI (بدون اقدام)" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
