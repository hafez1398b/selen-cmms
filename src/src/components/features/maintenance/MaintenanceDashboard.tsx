"use client";

import { maintenancePlansData, statusColors, standardColors, standardLabels, categoryColors, categoryLabels, typeLabels, type Standard } from "@/lib/maintenance-data";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Wrench, AlertTriangle, CheckCircle2, Clock, Calendar, TrendingUp, Sparkles } from "lucide-react";

export function MaintenanceDashboard() {
  const total = maintenancePlansData.length;
  const scheduled = maintenancePlansData.filter(p => p.status === "scheduled").length;
  const overdue = maintenancePlansData.filter(p => p.status === "overdue").length;
  const inProgress = maintenancePlansData.filter(p => p.status === "in_progress").length;
  const dueSoon = maintenancePlansData.filter(p => p.status === "scheduled" && p.daysUntilDue <= 3 && p.daysUntilDue >= 0).length;
  const completionRate = 87;

  // Distribution by type
  const byType = [
    { name: "پیشگیرانه", value: maintenancePlansData.filter(p => p.type === "preventive").length, color: "#22c55e" },
    { name: "اصلاحی", value: maintenancePlansData.filter(p => p.type === "corrective").length, color: "#f59e0b" },
    { name: "پیش‌بینانه", value: maintenancePlansData.filter(p => p.type === "predictive").length, color: "#8b5cf6" },
  ];

  // By category
  const byCategory = Object.keys(categoryLabels).map(cat => ({
    name: categoryLabels[cat],
    count: maintenancePlansData.filter(p => p.category === cat).length,
    color: categoryColors[cat],
  })).filter(c => c.count > 0);

  // By standard
  const byStandard = (Object.keys(standardLabels) as Standard[]).map(std => ({
    name: standardLabels[std],
    count: maintenancePlansData.filter(p => p.standard === std).length,
    color: standardColors[std],
  })).filter(s => s.count > 0);

  // Upcoming (next 7 days)
  const upcoming = maintenancePlansData
    .filter(p => p.daysUntilDue >= 0 && p.daysUntilDue <= 7 && p.status === "scheduled")
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 5);

  // Overdue list
  const overdueList = maintenancePlansData
    .filter(p => p.status === "overdue")
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  // Compliance chart
  const complianceData = [
    { month: "شهریور", planned: 45, executed: 42 },
    { month: "مهر", planned: 48, executed: 45 },
    { month: "آبان", planned: 52, executed: 49 },
    { month: "آذر", planned: 50, executed: 47 },
    { month: "دی", planned: 55, executed: 51 },
    { month: "بهمن", planned: 58, executed: 50 },
  ];

  const kpis = [
    { label: "کل برنامه‌ها", value: total, icon: Wrench, color: "#d4a017" },
    { label: "برنامه‌ریزی شده", value: scheduled, icon: Calendar, color: "#3b82f6" },
    { label: "نزدیک سررسید", value: dueSoon, icon: Clock, color: "#f59e0b" },
    { label: "عقب‌افتاده", value: overdue, icon: AlertTriangle, color: "#ef4444" },
    { label: "در حال انجام", value: inProgress, icon: TrendingUp, color: "#8b5cf6" },
    { label: "تطابق ماه", value: completionRate + "%", icon: CheckCircle2, color: "#22c55e" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="kpi-card !p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.color + '20' }}>
                  <Icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mb-0.5">{k.label}</p>
              <p className="text-xl md:text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Overdue Alert */}
      {overdueList.length > 0 && (
        <div className="chart-card bg-red-500/5 border-red-500/30 !p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-600 dark:text-red-500">هشدار: {overdueList.length} PM عقب‌افتاده</h3>
              <p className="text-[10px] text-gray-500">این موارد نیاز به توجه فوری دارند</p>
            </div>
          </div>
          <div className="space-y-2">
            {overdueList.map(pm => (
              <div key={pm.id} className="flex items-center justify-between p-2 bg-white dark:bg-[#0a0a0a] rounded-lg text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{pm.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{pm.assetName} • {pm.assignedTo}</p>
                </div>
                <span className="text-[10px] font-bold text-red-500 flex-shrink-0 mr-2">
                  {Math.abs(pm.daysUntilDue)} روز عقب
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compliance Trend */}
        <div className="chart-card lg:col-span-2">
          <h3 className="font-bold text-sm mb-3">روند تطابق PM (۶ ماه)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                <XAxis dataKey="month" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="planned" name="برنامه‌ریزی" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="executed" name="اجرا شده" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">توزیع بر اساس نوع</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {byType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-1.5 mt-2">
            {byType.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{t.name}</span>
                </div>
                <span className="font-bold">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming PMs */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            سررسیدهای هفته آینده
          </h3>
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">هیچ PM ای در ۷ روز آینده نیست</p>
            ) : upcoming.map(pm => (
              <div key={pm.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-[#0a0a0a]">
                <div
                  className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: pm.daysUntilDue <= 1 ? '#ef4444' : pm.daysUntilDue <= 3 ? '#f59e0b' : '#3b82f6' }}
                >
                  <span className="text-xs">{pm.daysUntilDue === 0 ? "امروز" : pm.daysUntilDue === 1 ? "فردا" : `${pm.daysUntilDue}`}</span>
                  {pm.daysUntilDue > 1 && <span className="text-[8px] opacity-80">روز</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{pm.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{pm.assetName}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{
                  backgroundColor: standardColors[pm.standard] + '20',
                  color: standardColors[pm.standard]
                }}>
                  {standardLabels[pm.standard]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">دسته‌بندی PM ها</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                <XAxis type="number" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                <YAxis type="category" dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#888' }} width={70} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="chart-card bg-gradient-to-l from-purple-500/5 via-transparent to-amber-500/5 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-600 dark:text-amber-500">تحلیل AI</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              با اجرای <strong className="text-green-500">۳ برنامه PdM جدید</strong> برای تجهیزات بحرانی، می‌توان از <strong className="text-red-500">۴ خرابی احتمالی</strong> در ۳ ماه آینده جلوگیری کرد. صرفه‌جویی تخمینی: <strong className="text-amber-500">۳۵ میلیون ریال</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
