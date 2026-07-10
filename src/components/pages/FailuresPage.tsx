"use client";
import { useAppState } from "@/context/AppStateContext";
import { failuresData, getStatusBadge } from "@/lib/data";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Clock, DollarSign } from "lucide-react";

export function FailuresPage() {
  const { setModalOpen, setModalType, setSelectedItem } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  let filtered = failuresData;
  if (searchTerm) filtered = filtered.filter(f => f.title.includes(searchTerm) || f.assetName.includes(searchTerm));

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "کل خرابی‌ها", value: failuresData.length, color: "#ef4444" },
          { label: "باز", value: failuresData.filter(f => f.status === "open").length, color: "#d4a017" },
          { label: "در حال بررسی", value: failuresData.filter(f => f.status === "investigating").length, color: "#3b82f6" },
          { label: "رفع شده", value: failuresData.filter(f => f.status === "resolved").length, color: "#22c55e" },
        ].map((c, i) => (
          <div key={i} className="kpi-card !p-3 md:!p-4 text-center">
            <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl md:text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="chart-card !p-3 md:!p-5">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-10" />
          </div>
          <button className="btn-primary md:w-auto w-full justify-center" onClick={() => { setModalType("addFailure"); setSelectedItem(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> ثبت خرابی
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {filtered.map(f => (
          <div key={f.id} className="chart-card !p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${getStatusBadge(f.severity).className} !text-[9px]`}>{getStatusBadge(f.severity).label}</span>
                  <span className="text-[9px] text-gray-500">{f.failureType}</span>
                </div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{f.assetName}</p>
              </div>
              <span className={`badge ${getStatusBadge(f.status).className} flex-shrink-0`}>{getStatusBadge(f.status).label}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#1a1a1a] text-[10px]">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{f.downtimeHours}h</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{(Number(f.cost) / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500" onClick={() => { setModalType("editFailure"); setSelectedItem(f); setModalOpen(true); }}>
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
      <div className="hidden md:block chart-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-3 px-4 text-gray-500 font-medium">عنوان</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">تجهیز</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">نوع</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">شدت</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">توقف</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">هزینه</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">وضعیت</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">تاریخ</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                  <td className="py-3 px-4 font-medium">{f.title}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">{f.assetName}</td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{f.failureType}</td>
                  <td className="py-3 px-4 text-center"><span className={`badge ${getStatusBadge(f.severity).className}`}>{getStatusBadge(f.severity).label}</span></td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{f.downtimeHours}</td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{Number(f.cost).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center"><span className={`badge ${getStatusBadge(f.status).className}`}>{getStatusBadge(f.status).label}</span></td>
                  <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">{f.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-amber-500" onClick={() => { setModalType("editFailure"); setSelectedItem(f); setModalOpen(true); }}><Edit2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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
