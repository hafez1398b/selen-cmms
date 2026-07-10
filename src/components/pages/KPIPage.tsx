"use client";

import { assetsData } from "@/lib/data";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { TrendingUp, TrendingDown, Sparkles, Target, Activity, Award, AlertCircle, Lightbulb } from "lucide-react";

type KPIKey = "mtbf" | "mttr" | "availability" | "reliability" | "oee" | "failureRate";

interface KPIDef {
  key: KPIKey;
  label: string;
  unit: string;
  target: number;
  reverse: boolean; // true = lower is better
  color: string;
  description: string;
}

const KPI_DEFS: KPIDef[] = [
  { key: "mtbf", label: "MTBF", unit: "ساعت", target: 500, reverse: false, color: "#22c55e", description: "میانگین زمان بین خرابی‌ها" },
  { key: "mttr", label: "MTTR", unit: "ساعت", target: 3, reverse: true, color: "#f59e0b", description: "میانگین زمان تعمیر" },
  { key: "availability", label: "Availability", unit: "%", target: 95, reverse: false, color: "#d4a017", description: "دسترس‌پذیری تجهیزات" },
  { key: "reliability", label: "Reliability", unit: "%", target: 92, reverse: false, color: "#3b82f6", description: "قابلیت اطمینان" },
  { key: "oee", label: "OEE", unit: "%", target: 85, reverse: false, color: "#8b5cf6", description: "اثربخشی کلی تجهیزات" },
  { key: "failureRate", label: "Failure Rate", unit: "%", target: 2, reverse: true, color: "#ef4444", description: "نرخ خرابی" },
];

export function KPIPage() {
  const [selectedKPI, setSelectedKPI] = useState<KPIKey>("oee");
  const [comparisonMode, setComparisonMode] = useState<"assets" | "trend">("assets");

  const kpiDef = KPI_DEFS.find(k => k.key === selectedKPI)!;
  const assetsWithData = assetsData.filter(a => Number(a[selectedKPI as keyof typeof a] as string) > 0);

  // Calculate averages
  const kpiAverages = KPI_DEFS.map(def => {
    const values = assetsData.filter(a => Number(a[def.key as keyof typeof a] as string) > 0);
    const avg = values.reduce((sum, a) => sum + Number(a[def.key as keyof typeof a] as string), 0) / (values.length || 1);
    const gap = def.reverse ? def.target - avg : avg - def.target;
    const performance = def.reverse
      ? Math.min(100, (def.target / avg) * 100)
      : Math.min(100, (avg / def.target) * 100);
    return { ...def, value: avg, gap, performance };
  });

  // Radar chart data
  const radarData = kpiAverages.map(k => ({
    kpi: k.label,
    actual: Math.round(k.performance),
    target: 100,
  }));

  // Trend data (last 6 months)
  const trendData = [
    { month: "شهریور", mtbf: 380, mttr: 4.2, availability: 88, reliability: 85, oee: 78, failureRate: 3.2 },
    { month: "مهر", mtbf: 410, mttr: 3.9, availability: 89, reliability: 87, oee: 80, failureRate: 2.8 },
    { month: "آبان", mtbf: 435, mttr: 3.7, availability: 90, reliability: 88, oee: 81, failureRate: 2.5 },
    { month: "آذر", mtbf: 455, mttr: 3.5, availability: 91, reliability: 89, oee: 82, failureRate: 2.3 },
    { month: "دی", mtbf: 470, mttr: 3.4, availability: 92, reliability: 90, oee: 83, failureRate: 2.1 },
    { month: "بهمن", mtbf: 480, mttr: 3.3, availability: 93, reliability: 91, oee: 84, failureRate: 1.9 },
  ];

  // Assets comparison for selected KPI
  const assetComparison = assetsWithData.map(a => ({
    name: a.name.substring(0, 14),
    value: Number(a[selectedKPI as keyof typeof a] as string),
    target: kpiDef.target,
  }));

  // AI Recommendations
  const aiRecommendations = [
    {
      icon: AlertCircle,
      severity: "critical",
      title: "پمپ هیدرولیک نیاز به توجه فوری دارد",
      desc: "MTBF این تجهیز ۲۸۰ ساعت است که ۴۴٪ کمتر از میانگین شرکت. توصیه: بازرسی جامع و تعویض قطعات فرسوده.",
      impact: "افزایش ۳۵٪ در قابلیت اطمینان",
    },
    {
      icon: Lightbulb,
      severity: "high",
      title: "بهبود OEE با کاهش زمان تنظیم",
      desc: "میانگین OEE سیستم ۸۰٪ است. تحلیل نشان می‌دهد ۱۲٪ افت به دلیل زمان‌های Setup طولانی است.",
      impact: "افزایش ۸٪ در OEE",
    },
    {
      icon: TrendingUp,
      severity: "medium",
      title: "روند صعودی availability",
      desc: "در ۶ ماه اخیر availability از ۸۸٪ به ۹۳٪ افزایش یافته. ادامه برنامه PM فعلی توصیه می‌شود.",
      impact: "حفظ روند مثبت",
    },
    {
      icon: Target,
      severity: "medium",
      title: "پیش‌بینی رسیدن به هدف OEE",
      desc: "با روند فعلی، در ۸ ماه آینده OEE به هدف ۸۵٪ خواهد رسید. با اقدامات تکمیلی، در ۴ ماه.",
      impact: "کاهش زمان به ۵۰٪",
    },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">

      {/* Header */}
      <div className="chart-card">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-500">شاخص‌های کلیدی عملکرد (KPI)</h2>
            <p className="text-xs text-gray-500 mt-0.5">تحلیل و مقایسه هوشمند شاخص‌های نگهداری و تعمیرات</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-400">مبتنی بر AI</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiAverages.map(k => {
          const isGood = k.performance >= 90;
          const isOk = k.performance >= 75;
          return (
            <div
              key={k.key}
              onClick={() => setSelectedKPI(k.key)}
              className={`kpi-card cursor-pointer transition-all ${selectedKPI === k.key ? 'border-amber-500 shadow-lg shadow-amber-500/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: k.color }}>{k.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isGood ? 'bg-green-500/20 text-green-400' : isOk ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {Math.round(k.performance)}%
                </span>
              </div>
              <p className="text-lg font-black" style={{ color: k.color }}>
                {k.value.toFixed(1)}
                <span className="text-[10px] text-gray-500 mr-1 font-normal">{k.unit}</span>
              </p>
              <div className="mt-2 flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-500">
                <span>هدف: {k.target}{k.unit}</span>
                <span className={k.gap >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {k.gap >= 0 ? '▲' : '▼'} {Math.abs(k.gap).toFixed(1)}
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${Math.min(100, k.performance)}%`, backgroundColor: k.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Radar Chart - Overall KPI Performance */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-1">نمای کلی عملکرد</h3>
          <p className="text-[10px] text-gray-500 mb-3">مقایسه با اهداف تعریف شده</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis dataKey="kpi" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} />
                <PolarRadiusAxis stroke="#333" tick={{ fill: '#555', fontSize: 9 }} />
                <Radar name="عملکرد فعلی" dataKey="actual" stroke="#d4a017" fill="#d4a017" fillOpacity={0.4} strokeWidth={2} />
                <Radar name="هدف" dataKey="target" stroke="#22c55e" fill="#22c55e" fillOpacity={0.05} strokeWidth={1} strokeDasharray="3 3" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Comparison Chart */}
        <div className="chart-card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm">تحلیل {kpiDef.label}</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">{kpiDef.description}</p>
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1">
              <button onClick={() => setComparisonMode("assets")} className={`text-[10px] px-3 py-1 rounded ${comparisonMode === "assets" ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'text-gray-400'}`}>مقایسه تجهیزات</button>
              <button onClick={() => setComparisonMode("trend")} className={`text-[10px] px-3 py-1 rounded ${comparisonMode === "trend" ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'text-gray-400'}`}>روند زمانی</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {comparisonMode === "assets" ? (
                <BarChart data={assetComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="name" stroke="#555" fontSize={10} tick={{ fill: '#888' }} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke="#555" fontSize={10} tick={{ fill: '#888' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="value" name={`${kpiDef.label} فعلی`} fill={kpiDef.color} radius={[6, 6, 0, 0]} barSize={30} />
                  <Line type="monotone" dataKey="target" name="هدف" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </BarChart>
              ) : (
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={kpiDef.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={kpiDef.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="month" stroke="#555" fontSize={10} tick={{ fill: '#888' }} />
                  <YAxis stroke="#555" fontSize={10} tick={{ fill: '#888' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} />
                  <Area type="monotone" dataKey={selectedKPI} name={kpiDef.label} stroke={kpiDef.color} fill="url(#trendGrad)" strokeWidth={2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="chart-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">پیشنهادات و تحلیل هوش مصنوعی</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-500">تحلیل خودکار و پیشنهاد راهکارهای بهبود</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiRecommendations.map((rec, i) => {
            const Icon = rec.icon;
            const colors = {
              critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400' },
              high: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' },
              medium: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
            };
            const c = colors[rec.severity as keyof typeof colors];
            return (
              <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rec.desc}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-medium">{rec.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed KPI Table */}
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-4">جدول تفصیلی شاخص‌ها بر اساس تجهیز</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-3 px-3 text-gray-500 font-medium">تجهیز</th>
                {KPI_DEFS.map(k => (
                  <th key={k.key} className="text-center py-3 px-3 text-gray-500 font-medium">{k.label}</th>
                ))}
                <th className="text-center py-3 px-3 text-gray-500 font-medium">امتیاز کلی</th>
              </tr>
            </thead>
            <tbody>
              {assetsWithData.map(asset => {
                const scores = KPI_DEFS.map(def => {
                  const val = Number(asset[def.key as keyof typeof asset] as string);
                  const perf = def.reverse ? Math.min(100, (def.target / (val || 1)) * 100) : Math.min(100, (val / def.target) * 100);
                  return perf;
                });
                const avgScore = scores.reduce((s, v) => s + v, 0) / scores.length;
                return (
                  <tr key={asset.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                    <td className="py-3 px-3 font-medium text-white">{asset.name}</td>
                    {KPI_DEFS.map(k => {
                      const val = Number(asset[k.key as keyof typeof asset] as string);
                      const perf = k.reverse ? (k.target / (val || 1)) * 100 : (val / k.target) * 100;
                      return (
                        <td key={k.key} className="py-3 px-3 text-center">
                          <span className={perf >= 90 ? 'text-green-400' : perf >= 75 ? 'text-amber-400' : 'text-red-400'}>
                            {val.toFixed(k.unit === "%" ? 0 : 1)}{k.unit === "%" ? "%" : ""}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="progress-bar w-14">
                          <div className="progress-fill" style={{ width: `${Math.min(100, avgScore)}%`, backgroundColor: avgScore >= 90 ? '#22c55e' : avgScore >= 75 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: avgScore >= 90 ? '#22c55e' : avgScore >= 75 ? '#f59e0b' : '#ef4444' }}>{Math.round(avgScore)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
