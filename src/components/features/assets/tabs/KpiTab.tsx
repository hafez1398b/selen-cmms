"use client";

import type { AssetNode } from "@/lib/assets-data";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Activity, Clock, TrendingUp, TrendingDown, AlertCircle, Zap } from "lucide-react";

interface Props {
  asset: AssetNode;
}

export function KpiTab({ asset }: Props) {
  const kpis = [
    { label: "MTBF", value: asset.mtbf || 0, unit: "ساعت", color: "#22c55e", icon: TrendingUp, target: 500, description: "میانگین زمان بین خرابی" },
    { label: "MTTR", value: asset.mttr || 0, unit: "ساعت", color: "#f59e0b", icon: Clock, target: 3, reverse: true, description: "میانگین زمان تعمیر" },
    { label: "Availability", value: asset.availability || 0, unit: "%", color: "#d4a017", icon: Activity, target: 95, description: "دسترس‌پذیری" },
    { label: "Reliability", value: asset.reliability || 0, unit: "%", color: "#3b82f6", icon: Zap, target: 92, description: "قابلیت اطمینان" },
    { label: "OEE", value: asset.oee || 0, unit: "%", color: "#8b5cf6", icon: TrendingUp, target: 85, description: "اثربخشی کلی تجهیز" },
    { label: "Failure Rate", value: asset.failureRate || 0, unit: "%", color: "#ef4444", icon: AlertCircle, target: 2, reverse: true, description: "نرخ خرابی" },
  ];

  const trendData = [
    { month: "مرداد", availability: 88, reliability: 85, oee: 78 },
    { month: "شهریور", availability: 89, reliability: 86, oee: 80 },
    { month: "مهر", availability: 90, reliability: 87, oee: 81 },
    { month: "آبان", availability: 91, reliability: 88, oee: 82 },
    { month: "آذر", availability: 92, reliability: 89, oee: 83 },
    { month: "دی", availability: asset.availability || 90, reliability: asset.reliability || 87, oee: asset.oee || 82 },
  ];

  const radarData = kpis.slice(0, 5).map(k => ({
    kpi: k.label,
    performance: k.reverse ? Math.min(100, (k.target / (k.value || 1)) * 100) : Math.min(100, (k.value / k.target) * 100),
  }));

  const failureHistoryData = [
    { month: "مرداد", failures: 2 },
    { month: "شهریور", failures: 1 },
    { month: "مهر", failures: 3 },
    { month: "آبان", failures: 1 },
    { month: "آذر", failures: 0 },
    { month: "دی", failures: 1 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const performance = kpi.reverse
            ? Math.min(100, (kpi.target / (kpi.value || 1)) * 100)
            : Math.min(100, (kpi.value / kpi.target) * 100);
          const isGood = performance >= 90;
          return (
            <div key={i} className="kpi-card !p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '18' }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isGood ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  {Math.round(performance)}%
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mb-1">{kpi.description}</p>
              <p className="text-lg font-black" style={{ color: kpi.color }}>
                {kpi.value.toFixed(kpi.unit === "%" ? 0 : 1)}
                <span className="text-[10px] text-gray-500 mr-1 font-normal">{kpi.unit}</span>
              </p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${performance}%`, backgroundColor: kpi.color }} />
              </div>
              <p className="text-[9px] text-gray-500 mt-1">هدف: {kpi.target}{kpi.unit}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">روند شاخص‌ها (۶ ماه)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                <XAxis dataKey="month" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="availability" name="Availability" stroke="#d4a017" strokeWidth={2} />
                <Line type="monotone" dataKey="reliability" name="Reliability" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="oee" name="OEE" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">نمای کلی عملکرد</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis dataKey="kpi" tick={{ fill: '#888', fontSize: 10 }} />
                <PolarRadiusAxis stroke="#333" tick={{ fill: '#555', fontSize: 8 }} />
                <Radar name="عملکرد" dataKey="performance" stroke="#d4a017" fill="#d4a017" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure History */}
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">تاریخچه خرابی‌ها</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failureHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
              <XAxis dataKey="month" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
              <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="failures" name="خرابی" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
