"use client";

import { useState } from "react";
import { failuresData, getStatusBadge } from "@/lib/data";
import { ServiceRequestForm } from "@/components/features/failures/ServiceRequestForm";
import { Plus, Search, AlertTriangle, Clock, DollarSign, Sparkles, ChevronLeft } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { useToast } from "@/components/ui/Toast";

export function FailuresPage() {
  const toast = useToast();
  const { setCurrentPage } = useAppState();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  let filtered = failuresData;
  if (search) filtered = filtered.filter(f => f.title.includes(search) || f.assetName.includes(search));
  if (filterStatus !== "all") filtered = filtered.filter(f => f.status === filterStatus);

  const stats = [
    { label: "کل درخواست‌ها", value: failuresData.length, color: "#ef4444", status: "all" },
    { label: "باز", value: failuresData.filter(f => f.status === "open").length, color: "#f59e0b", status: "open" },
    { label: "در حال بررسی", value: failuresData.filter(f => f.status === "investigating").length, color: "#3b82f6", status: "investigating" },
    { label: "رفع شده", value: failuresData.filter(f => f.status === "resolved").length, color: "#22c55e", status: "resolved" },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Clickable Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((c, i) => (
          <button key={i} onClick={() => setFilterStatus(c.status)} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.color + '20' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
            </div>
            <p className="text-[10px] text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl md:text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
            {filterStatus === c.status && <p className="text-[9px] text-amber-500 mt-1 font-bold">✓ فیلتر فعال</p>}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="chart-card !p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-10" />
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary md:w-auto w-full justify-center">
          <Sparkles className="w-4 h-4" />
          ثبت درخواست جدید (با AI)
        </button>
      </div>

      {/* AI Info */}
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 via-transparent to-amber-500/10 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-600 dark:text-amber-500">فرآیند ثبت درخواست</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              AI سلن با تحلیل شرح مشکل، <strong>علت‌های احتمالی خرابی</strong> را پیشنهاد می‌دهد. پس از تایید مدیر فنی، دستور کار به‌طور خودکار به تکنسین تخصیص می‌یابد.
            </p>
          </div>
        </div>
      </div>

      {/* Failures Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(f => (
          <div key={f.id} className="chart-card !p-3 card-hover">
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
              <button
                onClick={() => setCurrentPage("workOrders")}
                className="text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 font-bold hover:bg-amber-500/30"
              >
                مشاهده دستور کار →
              </button>
            </div>
          </div>
        ))}
      </div>

      <ServiceRequestForm isOpen={formOpen} onClose={() => setFormOpen(false)} onCreateWorkOrder={(data) => console.log("WO created:", data)} />
    </div>
  );
}
