"use client";

import { useState } from "react";
import { assetsTreeData } from "@/lib/assets-data";
import { maintenancePlansData } from "@/lib/maintenance-data";
import { personnelData } from "@/lib/personnel-data";
import { workOrdersData, failuresData, sparePartsData } from "@/lib/data";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { FileText, Download, Filter, Calendar, TrendingUp, Users, Wrench, Package, AlertTriangle, Sparkles, Printer, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type ReportId = "maintenance" | "failures" | "pm" | "personnel" | "inventory" | "reliability" | "cost";

const reports = [
  { id: "maintenance" as const, label: "گزارش نگهداری", icon: Wrench, color: "#22c55e" },
  { id: "failures" as const, label: "گزارش خرابی‌ها", icon: AlertTriangle, color: "#ef4444" },
  { id: "pm" as const, label: "گزارش PM", icon: Wrench, color: "#3b82f6" },
  { id: "personnel" as const, label: "عملکرد پرسنل", icon: Users, color: "#8b5cf6" },
  { id: "inventory" as const, label: "گزارش انبار", icon: Package, color: "#f59e0b" },
  { id: "reliability" as const, label: "قابلیت اطمینان", icon: TrendingUp, color: "#d4a017" },
  { id: "cost" as const, label: "تحلیل هزینه", icon: FileSpreadsheet, color: "#ec4899" },
];

export function ReportsPage() {
  const toast = useToast();
  const [selected, setSelected] = useState<ReportId>("maintenance");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const currentReport = reports.find(r => r.id === selected)!;

  // Export to Excel (dynamic import to avoid SSR issues)
  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    let data: any[] = [];
    let filename = "report";

    switch (selected) {
      case "maintenance":
        data = maintenancePlansData.map(pm => ({
          "کد": pm.code, "عنوان": pm.title, "تجهیز": pm.assetName,
          "نوع": pm.type, "وضعیت": pm.status, "مسئول": pm.assignedTo,
          "زمان تخمینی": pm.estimatedHours, "هزینه": pm.estimatedCost,
          "استاندارد": pm.standard,
        }));
        filename = "maintenance-report";
        break;
      case "personnel":
        data = personnelData.map(p => ({
          "کد پرسنلی": p.employeeCode, "نام": p.fullName, "سمت": p.position,
          "دپارتمان": p.department, "بهره‌وری": p.productivity + "%",
          "دستور کارها": p.completedWorkOrders, "امتیاز": p.rating,
          "شیفت": p.currentShift,
        }));
        filename = "personnel-report";
        break;
      case "reliability":
        data = assetsTreeData.filter(a => a.mtbf).map(a => ({
          "کد": a.code, "نام": a.name, "MTBF": a.mtbf,
          "MTTR": a.mttr, "Availability": a.availability + "%",
          "Reliability": a.reliability + "%", "OEE": a.oee + "%",
          "خرابی": a.totalFailures,
        }));
        filename = "reliability-report";
        break;
      case "inventory":
        data = sparePartsData.map(p => ({
          "کد": p.code, "نام": p.name, "دسته": p.category,
          "موجودی": p.currentStock, "حداقل": p.minimumStock,
          "قیمت واحد": p.unitPrice, "محل": p.location, "وضعیت": p.status,
        }));
        filename = "inventory-report";
        break;
      case "failures":
        data = failuresData.map(f => ({
          "عنوان": f.title, "تجهیز": f.assetName, "نوع": f.failureType,
          "شدت": f.severity, "وضعیت": f.status, "توقف (ساعت)": f.downtimeHours,
          "هزینه": f.cost, "تاریخ": f.createdAt,
        }));
        filename = "failures-report";
        break;
      case "pm":
        data = maintenancePlansData.map(pm => ({
          "کد": pm.code, "عنوان": pm.title, "تجهیز": pm.assetName,
          "دوره": pm.intervalValue + " " + (pm.intervalUnit || ""),
          "سررسید": pm.nextDue, "وضعیت": pm.status,
        }));
        filename = "pm-report";
        break;
      case "cost":
        data = assetsTreeData.filter(a => a.totalFailures).map(a => ({
          "تجهیز": a.name, "کد": a.code, "تعداد خرابی": a.totalFailures,
          "توقف (h)": a.totalDowntime, "MTTR": a.mttr,
          "هزینه تخمینی (میلیون)": (a.totalFailures || 0) * 5,
        }));
        filename = "cost-report";
        break;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentReport.label);
    XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`);
    toast.success("خروجی Excel", `${data.length} رکورد در فایل ذخیره شد`);
  };

  const exportCSV = () => {
    exportExcel(); // Will download as xlsx; can be changed to CSV
    toast.info("CSV", "به‌جای CSV، فایل Excel ذخیره شد (سازگارتر)");
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Report Selector */}
      <div className="chart-card !p-3">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-sm">انتخاب گزارش</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {reports.map(r => {
            const Icon = r.icon;
            const isActive = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isActive ? 'border-amber-500 bg-amber-500/10' : 'border-gray-200 dark:border-[#1a1a1a]'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1`} style={{ color: isActive ? r.color : '#888' }} />
                <p className={`text-[10px] ${isActive ? 'font-bold' : 'text-gray-500'}`} style={{ color: isActive ? r.color : undefined }}>
                  {r.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Export */}
      <div className="chart-card !p-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="از تاریخ" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field w-32 text-xs" />
          <span className="text-gray-500 text-xs">تا</span>
          <input type="text" placeholder="تا تاریخ" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field w-32 text-xs" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportExcel} className="btn-primary text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5" /> خروجی Excel
          </button>
          <button onClick={exportCSV} className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={printReport} className="btn-secondary text-xs">
            <Printer className="w-3.5 h-3.5" /> چاپ/PDF
          </button>
        </div>
      </div>

      {/* Report Content */}
      {selected === "reliability" && <ReliabilityReport />}
      {selected === "personnel" && <PersonnelReport />}
      {selected === "maintenance" && <MaintenanceReport />}
      {selected === "cost" && <CostReport />}
      {(selected === "failures" || selected === "pm" || selected === "inventory") && <GenericReport type={selected} />}
    </div>
  );
}

function ReliabilityReport() {
  const data = assetsTreeData.filter(a => a.mtbf).slice(0, 8).map(a => ({
    name: a.name.substring(0, 12),
    mtbf: a.mtbf || 0, mttr: a.mttr || 0, oee: a.oee || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">مقایسه MTBF تجهیزات</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
              <XAxis dataKey="name" stroke="#888" fontSize={9} tick={{ fill: '#888' }} angle={-20} textAnchor="end" height={70} />
              <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              <Bar dataKey="mtbf" name="MTBF (h)" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">OEE تجهیزات</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
              <XAxis dataKey="name" stroke="#888" fontSize={9} tick={{ fill: '#888' }} angle={-20} textAnchor="end" height={70} />
              <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              <Bar dataKey="oee" name="OEE (%)" fill="#d4a017" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">جدول شاخص‌های قابلیت اطمینان</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-2 px-2 text-gray-500">تجهیز</th>
                <th className="text-center py-2 px-2 text-gray-500">MTBF</th>
                <th className="text-center py-2 px-2 text-gray-500">MTTR</th>
                <th className="text-center py-2 px-2 text-gray-500">Availability</th>
                <th className="text-center py-2 px-2 text-gray-500">Reliability</th>
                <th className="text-center py-2 px-2 text-gray-500">OEE</th>
                <th className="text-center py-2 px-2 text-gray-500">Failure Rate</th>
              </tr>
            </thead>
            <tbody>
              {assetsTreeData.filter(a => a.mtbf).map(a => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-[#0a0a0a] table-row-hover">
                  <td className="py-2 px-2 font-bold">{a.name}</td>
                  <td className="py-2 px-2 text-center">{a.mtbf}</td>
                  <td className="py-2 px-2 text-center">{a.mttr}</td>
                  <td className="py-2 px-2 text-center text-green-500">{a.availability}%</td>
                  <td className="py-2 px-2 text-center text-blue-500">{a.reliability}%</td>
                  <td className="py-2 px-2 text-center text-amber-500">{a.oee}%</td>
                  <td className="py-2 px-2 text-center text-red-500">{a.failureRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PersonnelReport() {
  const data = personnelData.map(p => ({
    name: p.fullName.substring(0, 10),
    productivity: p.productivity,
    workOrders: p.completedWorkOrders,
  }));

  return (
    <div className="space-y-4">
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">مقایسه بهره‌وری پرسنل</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
            <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
            <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="productivity" name="بهره‌وری %" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="workOrders" name="دستور کارها" fill="#d4a017" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MaintenanceReport() {
  const trendData = [
    { month: "شهریور", planned: 45, completed: 42, cost: 24 },
    { month: "مهر", planned: 48, completed: 45, cost: 26 },
    { month: "آبان", planned: 52, completed: 49, cost: 30 },
    { month: "آذر", planned: 50, completed: 47, cost: 28 },
    { month: "دی", planned: 55, completed: 51, cost: 32 },
    { month: "بهمن", planned: 58, completed: 50, cost: 35 },
  ];

  return (
    <div className="space-y-4">
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">روند اجرای برنامه‌های نگهداری</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
            <XAxis dataKey="month" stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
            <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            <Legend />
            <Area type="monotone" dataKey="planned" name="برنامه‌ریزی" stroke="#3b82f6" fill="url(#pGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="completed" name="اجرا شده" stroke="#22c55e" fill="url(#cGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CostReport() {
  const data = [
    { name: "پیشگیرانه", value: 45, color: "#22c55e" },
    { name: "اصلاحی", value: 32, color: "#f59e0b" },
    { name: "خرابی", value: 18, color: "#ef4444" },
    { name: "پیش‌بینانه", value: 5, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">توزیع هزینه‌های نگهداری</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={(e: any) => `${e.name} ${e.value}%`}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">هزینه هر تجهیز (میلیون ریال)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assetsTreeData.filter(a => a.totalFailures).slice(0, 6).map(a => ({ name: a.name.substring(0, 10), cost: (a.totalFailures || 0) * 5 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
              <XAxis dataKey="name" stroke="#888" fontSize={9} tick={{ fill: '#888' }} angle={-20} textAnchor="end" height={70} />
              <YAxis stroke="#888" fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              <Bar dataKey="cost" name="هزینه" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function GenericReport({ type }: { type: string }) {
  return (
    <div className="chart-card p-8 text-center">
      <FileText className="w-12 h-12 mx-auto mb-3 text-amber-500" />
      <p className="text-sm font-bold">گزارش {type}</p>
      <p className="text-xs text-gray-500 mt-2">برای خروجی این گزارش از دکمه‌های بالا استفاده کنید</p>
      <p className="text-[10px] text-amber-500 mt-4">
        <Sparkles className="inline w-3 h-3" /> فایل Excel با تمام داده‌های واقعی تولید می‌شود
      </p>
    </div>
  );
}
