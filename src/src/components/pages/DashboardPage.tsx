"use client";

import { assetsData, workOrdersData, failuresData, pmData, getStatusBadge, formatNumber } from "@/lib/data";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Wrench, AlertTriangle, ClipboardList, Package, Activity, TrendingUp, TrendingDown, ChevronLeft } from "lucide-react";
import { useAppState, type PageId } from "@/context/AppStateContext";

export function DashboardPage() {
  const { setCurrentPage, setSelectedItem } = useAppState();

  const navigateWithFilter = (page: PageId, filter?: Record<string, any>) => {
    setSelectedItem(filter || null);
    setCurrentPage(page);
  };

  const openOrders = workOrdersData.filter(w => w.status === "open").length;
  const inProgressOrders = workOrdersData.filter(w => w.status === "in_progress").length;
  const completedOrders = workOrdersData.filter(w => w.status === "completed").length;
  const totalWO = workOrdersData.length;
  const overduePM = pmData.filter(p => p.status === "overdue").length;

  const avgHealth = Math.round(assetsData.reduce((s, a) => s + Number(a.healthScore), 0) / assetsData.length);

  const kpiCards: Array<{ title: string; value: string; unit: string; icon: any; color: string; trend: string; trendUp: boolean; page: PageId; filter?: Record<string, any> }> = [
    { title: "میانگین سلامت", value: "۸۹", unit: "%", icon: Activity, color: "#d4a017", trend: "۲.۳", trendUp: true, page: "assets" },
    { title: "تطابق PM", value: "۹۵", unit: "%", icon: ClipboardList, color: "#22c55e", trend: "۱.۵", trendUp: true, page: "maintenance" },
    { title: "دستور کار باز", value: `${openOrders}`, unit: "", icon: ClipboardList, color: "#3b82f6", trend: "۳", trendUp: false, page: "workOrders", filter: { filterStatus: "open" } },
    { title: "معوق", value: `${overduePM}`, unit: "", icon: AlertTriangle, color: "#ef4444", trend: "۲.۱", trendUp: false, page: "maintenance", filter: { filterStatus: "overdue" } },
    { title: "تجهیز بحرانی", value: "۲", unit: "", icon: AlertTriangle, color: "#f59e0b", trend: "۰.۵", trendUp: false, page: "assets", filter: { filterCriticality: "critical" } },
    { title: "کمبود انبار", value: "۳", unit: "", icon: Package, color: "#8b5cf6", trend: "۱", trendUp: true, page: "inventory", filter: { filterStatus: "low_stock" } },
  ];

  const woByStatus = [
    { name: "باز", value: openOrders, color: "#d4a017" },
    { name: "در حال انجام", value: inProgressOrders, color: "#3b82f6" },
    { name: "تکمیل", value: completedOrders, color: "#22c55e" },
    { name: "لغو", value: 2, color: "#6b7280" },
  ];

  const healthData = [
    { name: "سالم", value: assetsData.filter(a => Number(a.healthScore) >= 90).length, color: "#22c55e" },
    { name: "هشدار", value: assetsData.filter(a => Number(a.healthScore) >= 75 && Number(a.healthScore) < 90).length, color: "#d4a017" },
    { name: "بحرانی", value: assetsData.filter(a => Number(a.healthScore) < 75).length, color: "#ef4444" },
  ];

  const monthlyData = [
    { month: "فر", failures: 8, orders: 12 },
    { month: "ار", failures: 6, orders: 15 },
    { month: "خر", failures: 10, orders: 18 },
    { month: "تیر", failures: 7, orders: 14 },
    { month: "مرد", failures: 12, orders: 20 },
    { month: "شهر", failures: 5, orders: 10 },
    { month: "مهر", failures: 9, orders: 16 },
    { month: "آبا", failures: 11, orders: 22 },
    { month: "آذر", failures: 8, orders: 14 },
    { month: "دی", failures: 6, orders: 12 },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">

      {/* Welcome Banner - Mobile Optimized */}
      <div className="relative bg-gradient-to-l from-amber-500/10 via-white dark:via-[#111] to-white dark:to-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 md:p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-40 md:w-64 h-40 md:h-64 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-500 mb-1">CMMS/EAM ✦</p>
            <h2 className="text-base md:text-2xl font-black text-amber-600 dark:text-amber-500">خوش آمدید</h2>
            <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mt-1 md:mt-2 leading-relaxed">
              گروه صنعتی سلن (بسپار فوم غرب)
              <span className="hidden md:inline"> — تولید انواع فوم و اسفنج پلی‌اورتان صنعتی</span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-gray-500 dark:text-gray-600">تأسیس</p>
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400">۱۳۹۲</p>
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-[#0a0a0a] font-black text-lg md:text-2xl">S</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Clickable navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <button
              key={i}
              onClick={() => navigateWithFilter(kpi.page, kpi.filter)}
              className="kpi-card !p-3 md:!p-4 card-hover text-right group cursor-pointer w-full"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '18' }}>
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: kpi.color }} />
                </div>
                <span className={`text-[9px] md:text-[10px] ${kpi.trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-0.5 font-medium`}>
                  {kpi.trendUp ? <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                  {kpi.trend}٪
                </span>
              </div>
              <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-500 mb-0.5 truncate">{kpi.title}</p>
              <div className="flex items-center justify-between">
                <p className="text-lg md:text-xl font-black" style={{ color: kpi.color }}>
                  {kpi.value}<span className="text-xs">{kpi.unit}</span>
                </p>
                <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">

        {/* Work Order Distribution */}
        <div className="chart-card !p-4 md:!p-5">
          <div className="mb-3">
            <h3 className="font-bold text-sm">توزیع دستور کارها</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">مجموع {totalWO} دستور کار</p>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex-1 h-40 md:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={woByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                  <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
                  <YAxis stroke="#888" fontSize={9} tick={{ fill: '#888' }} width={25} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} cursor={{ fill: 'rgba(212,160,23,0.05)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={30}>
                    {woByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 md:space-y-3 min-w-[80px] md:min-w-[100px]">
              {woByStatus.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                    <p className="text-xs md:text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Health Donut */}
        <div className="chart-card !p-4 md:!p-5">
          <div className="mb-3">
            <h3 className="font-bold text-sm">سلامت کلی تجهیزات</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">میانگین سلامت</p>
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="relative w-28 h-28 md:w-36 md:h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} dataKey="value" strokeWidth={0}>
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-lg md:text-2xl font-black text-amber-500">{avgHealth}</p>
                <p className="text-[9px] md:text-[10px] text-gray-500">سلامت</p>
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              {healthData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                    <p className="text-xs md:text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="chart-card !p-4 md:!p-5">
        <h3 className="font-bold text-sm mb-3">روند خرابی‌ها و دستور کارها</h3>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a017" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
              <XAxis dataKey="month" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
              <YAxis stroke="#888" fontSize={9} tick={{ fill: '#888' }} width={25} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="orders" name="دستور کار" stroke="#d4a017" fill="url(#orderGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="failures" name="خرابی" stroke="#ef4444" fill="url(#failGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reliability - Table on desktop, Cards on mobile */}
      <div className="chart-card !p-4 md:!p-5">
        <h3 className="font-bold text-sm mb-3">شاخص‌های قابلیت اطمینان</h3>

        {/* Mobile: Card view */}
        <div className="md:hidden space-y-2">
          {assetsData.filter(a => Number(a.mtbf) > 0).map(asset => (
            <div key={asset.id} className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm truncate flex-1 ml-2">{asset.name}</p>
                <span className={`badge ${getStatusBadge(Number(asset.healthScore) >= 80 ? 'active' : Number(asset.healthScore) >= 70 ? 'maintenance' : 'failed').className}`}>
                  {getStatusBadge(Number(asset.healthScore) >= 80 ? 'active' : Number(asset.healthScore) >= 70 ? 'maintenance' : 'failed').label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] text-gray-500">MTBF</p>
                  <p className="text-xs font-bold text-amber-500">{formatNumber(asset.mtbf)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">MTTR</p>
                  <p className="text-xs font-bold text-blue-500">{formatNumber(asset.mttr)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">Avail</p>
                  <p className={`text-xs font-bold ${Number(asset.availability) >= 90 ? 'text-green-500' : Number(asset.availability) >= 80 ? 'text-amber-500' : 'text-red-500'}`}>
                    {formatNumber(asset.availability)}٪
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">Reli</p>
                  <p className={`text-xs font-bold ${Number(asset.reliability) >= 90 ? 'text-green-500' : Number(asset.reliability) >= 80 ? 'text-amber-500' : 'text-red-500'}`}>
                    {formatNumber(asset.reliability)}٪
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">OEE</p>
                  <p className={`text-xs font-bold ${Number(asset.oee) >= 80 ? 'text-green-500' : Number(asset.oee) >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                    {formatNumber(asset.oee)}٪
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500">سلامت</p>
                  <p className="text-xs font-bold">{asset.healthScore}٪</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-3 px-3 text-gray-500 font-medium">نام تجهیز</th>
                <th className="text-center py-3 px-3 text-gray-500 font-medium">MTBF</th>
                <th className="text-center py-3 px-3 text-gray-500 font-medium">MTTR</th>
                <th className="text-center py-3 px-3 text-gray-500 font-medium">Availability</th>
                <th className="text-center py-3 px-3 text-gray-500 font-medium">Reliability</th>
                <th className="text-center py-3 px-3 text-gray-500 font-medium">OEE</th>
                <th className="text-center py-3 px-3 text-gray-500 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {assetsData.filter(a => Number(a.mtbf) > 0).map(asset => (
                <tr key={asset.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                  <td className="py-3 px-3 font-medium">{asset.name}</td>
                  <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">{formatNumber(asset.mtbf)}</td>
                  <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">{formatNumber(asset.mttr)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={Number(asset.availability) >= 90 ? 'text-green-500' : Number(asset.availability) >= 80 ? 'text-amber-500' : 'text-red-500'}>
                      {formatNumber(asset.availability)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={Number(asset.reliability) >= 90 ? 'text-green-500' : Number(asset.reliability) >= 80 ? 'text-amber-500' : 'text-red-500'}>
                      {formatNumber(asset.reliability)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={Number(asset.oee) >= 80 ? 'text-green-500' : Number(asset.oee) >= 70 ? 'text-amber-500' : 'text-red-500'}>
                      {formatNumber(asset.oee)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`badge ${getStatusBadge(Number(asset.healthScore) >= 80 ? 'active' : Number(asset.healthScore) >= 70 ? 'maintenance' : 'failed').className}`}>
                      {getStatusBadge(Number(asset.healthScore) >= 80 ? 'active' : Number(asset.healthScore) >= 70 ? 'maintenance' : 'failed').label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
