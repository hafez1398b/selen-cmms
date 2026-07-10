"use client";
import { useTheme } from "@/context/ThemeContext";
import { assetsData, workOrdersData, personnelData } from "@/lib/data";
import { useState } from "react";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line } from "recharts";

export function ReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedReport, setSelectedReport] = useState("maintenance");
  const reports = [{ id: "maintenance", label: "گزارش تعمیرات" }, { id: "failures", label: "گزارش خرابی‌ها" }, { id: "pm", label: "گزارش PM" }, { id: "personnel", label: "عملکرد پرسنل" }, { id: "inventory", label: "گزارش انبار" }, { id: "reliability", label: "قابلیت اطمینان" }];
  const repairCostData = [{ month: "فر", cost: 45, planned: 30 }, { month: "ار", cost: 32, planned: 30 }, { month: "خر", cost: 55, planned: 30 }, { month: "تیر", cost: 38, planned: 30 }, { month: "مرد", cost: 62, planned: 30 }, { month: "شهر", cost: 28, planned: 30 }];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">
      <div className="chart-card"><div className="flex items-center gap-2 mb-4"><Filter className="w-4 h-4 text-amber-400" /><span className="font-bold text-sm">نوع گزارش</span></div>
        <div className="flex flex-wrap gap-2">{reports.map(r => (<button key={r.id} onClick={() => setSelectedReport(r.id)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${selectedReport === r.id ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-[#0a0a0a] font-bold' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 hover:text-white'}`}>{r.label}</button>))}</div>
      </div>
      <div className="chart-card"><div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500 dark:text-gray-500" /><input type="text" placeholder="از تاریخ" className="input-field w-[120px] text-xs" /><span className="text-gray-500 text-xs">تا</span><input type="text" placeholder="تا تاریخ" className="input-field w-[120px] text-xs" /></div>
        <div className="flex gap-2 mr-auto"><button className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" /> Excel</button><button className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" /> PDF</button></div>
      </div></div>
      {selectedReport === "maintenance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{ label: "کل دستور کارها", value: workOrdersData.length }, { label: "تکمیل شده", value: workOrdersData.filter(w => w.status === "completed").length }, { label: "در حال انجام", value: workOrdersData.filter(w => w.status === "in_progress").length }, { label: "هزینه", value: "۲.۱M" }].map((c, i) => (<div key={i} className="kpi-card text-center"><p className="text-[10px] text-gray-500 mb-1">{c.label}</p><p className="text-xl font-black text-amber-500">{c.value}</p></div>))}</div>
          <div className="chart-card"><h4 className="font-bold text-sm mb-4">هزینه تعمیرات ماهانه</h4><ResponsiveContainer width="100%" height={250}><AreaChart data={repairCostData}><defs><linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4a017" stopOpacity={0.2} /><stop offset="95%" stopColor="#d4a017" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" /><XAxis dataKey="month" stroke="#555" fontSize={10} tick={{ fill: '#888' }} /><YAxis stroke="#555" fontSize={10} tick={{ fill: '#888' }} /><Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} /><Area type="monotone" dataKey="cost" stroke="#d4a017" fill="url(#costGrad)" strokeWidth={2} /><Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} /></AreaChart></ResponsiveContainer></div>
        </div>
      )}
      {selectedReport === "personnel" && (
        <div className="chart-card"><h4 className="font-bold text-sm mb-4">عملکرد پرسنل</h4><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200 dark:border-[#1a1a1a]"><th className="text-right py-3 px-4 text-gray-500 font-medium">نام</th><th className="text-center py-3 px-4 text-gray-500 font-medium">سمت</th><th className="text-center py-3 px-4 text-gray-500 font-medium">دستور کارها</th><th className="text-center py-3 px-4 text-gray-500 font-medium">بهره‌وری</th></tr></thead><tbody>{personnelData.map((p, i) => (<tr key={i} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover"><td className="py-3 px-4 font-medium">{p.fullName}</td><td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">{p.position}</td><td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{p.completedWorkOrders}</td><td className="py-3 px-4 text-center"><div className="flex items-center justify-center gap-2"><div className="progress-bar w-16"><div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${p.productivity}%` }} /></div><span className="text-green-400 text-xs font-bold">{p.productivity}%</span></div></td></tr>))}</tbody></table></div></div>
      )}
      {selectedReport === "reliability" && (
        <div className="chart-card"><h4 className="font-bold text-sm mb-4">مقایسه MTBF</h4><ResponsiveContainer width="100%" height={250}><BarChart data={assetsData.filter(a => Number(a.mtbf) > 0).slice(0, 6).map(a => ({ name: a.name.substring(0, 10), mtbf: Number(a.mtbf) }))}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" /><XAxis dataKey="name" stroke="#555" fontSize={10} tick={{ fill: '#888' }} /><YAxis stroke="#555" fontSize={10} tick={{ fill: '#888' }} /><Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} /><Bar dataKey="mtbf" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={30} /></BarChart></ResponsiveContainer></div>
      )}
      {!["maintenance", "personnel", "reliability"].includes(selectedReport) && (
        <div className="chart-card p-8 text-center"><FileText className="w-12 h-12 mx-auto mb-4 text-gray-500 dark:text-gray-600" /><p className="text-sm text-gray-500 dark:text-gray-500">گزارش مورد نظر در حال توسعه است</p></div>
      )}
    </div>
  );
}
