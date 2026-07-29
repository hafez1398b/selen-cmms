"use client";

import { useState } from "react";
import { getStatusBadge } from "@/lib/data";
import { WorkOrderDetail } from "@/components/features/workorders/WorkOrderDetail";
import { WorkOrderWizard } from "@/components/features/workorders/WorkOrderWizard";
import { Search, User, Clock, DollarSign, Wrench, Sparkles, Phone, Video, Mic, Camera, Plus } from "lucide-react";
import { useWorkOrders } from "@/context/WorkOrdersContext";
import { useAppState } from "@/context/AppStateContext";

export function WorkOrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const { workOrders: workOrdersData } = useWorkOrders();
  const { selectedItem } = useAppState();

  // Apply filter from dashboard navigation
  const filterStatus = selectedItem?.filterStatus as string | undefined;

  let filtered: any[] = workOrdersData;
  if (filterStatus) filtered = filtered.filter(w => w.status === filterStatus);
  if (search) filtered = filtered.filter(w => w.title.includes(search) || w.orderNumber.includes(search));

  const openDetail = (wo: any) => {
    setSelectedWO({
      id: wo.orderNumber,
      title: wo.title,
      description: wo.description || "شرح دستور کار...",
      equipmentName: wo.assetName,
      status: wo.status === "open" ? "باز" : wo.status === "in_progress" ? "در حال انجام" : wo.status === "completed" ? "تکمیل شده" : "لغو شده",
      priority: wo.priority === "critical" ? "بحرانی" : wo.priority === "high" ? "بالا" : wo.priority === "medium" ? "متوسط" : "پایین",
      assignedTo: wo.assignedTo,
      team: [wo.assignedTo],
      createdBy: "مدیر فنی",
      createdAt: wo.scheduledDate,
      estimatedHours: Number(wo.estimatedHours),
      diagnosedCause: "خرابی بلبرینگ اصلی موتور (تایید شده توسط AI)",
      recommendedAction: "تعویض بلبرینگ 6205-2RS و بازرسی هم‌محوری شفت با Dial Indicator",
      parts: ["بلبرینگ 6205-2RS", "روغن ISO 46", "سیل روغن"],
      cost: 8500000,
    });
  };

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "کل دستور کارها", value: workOrdersData.length, color: "#3b82f6" },
          { label: "باز", value: workOrdersData.filter((w: any) => w.status === "open").length, color: "#d4a017" },
          { label: "در حال انجام", value: workOrdersData.filter((w: any) => w.status === "in_progress").length, color: "#f59e0b" },
          { label: "تکمیل شده", value: workOrdersData.filter((w: any) => w.status === "completed").length, color: "#22c55e" },
        ].map((c, i) => (
          <div key={i} className="kpi-card !p-3 text-center">
            <p className="text-[10px] text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl md:text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Info about new capabilities */}
      <div className="chart-card !p-4 bg-gradient-to-l from-blue-500/10 via-transparent to-amber-500/10 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-600 dark:text-amber-500">قابلیت‌های جدید دستور کار</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Sparkles className="w-3 h-3 text-purple-500" /> دستیار AI سلن
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Mic className="w-3 h-3 text-red-500" /> تبدیل صوت به متن
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Camera className="w-3 h-3 text-green-500" /> تصویر قبل و بعد
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Video className="w-3 h-3 text-blue-500" /> تماس با مدیر فنی
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <div className="chart-card !p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-10" />
        </div>
        <button onClick={() => setWizardOpen(true)} className="btn-primary justify-center whitespace-nowrap">
          <Plus className="w-4 h-4" />
          دستور کار جدید (گام به گام)
        </button>
      </div>

      {/* Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((wo: any) => (
          <button
            key={wo.id}
            onClick={() => openDetail(wo)}
            className="chart-card !p-3 card-hover text-right"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-amber-500">{wo.orderNumber}</span>
                  <span className={`badge ${getStatusBadge(wo.priority).className} !text-[9px]`}>{getStatusBadge(wo.priority).label}</span>
                </div>
                <p className="text-sm font-bold">{wo.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{wo.assetName}</p>
              </div>
              <span className={`badge ${getStatusBadge(wo.status).className} flex-shrink-0`}>{getStatusBadge(wo.status).label}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#1a1a1a] text-[10px]">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{wo.assignedTo}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{wo.estimatedHours}h</span>
              </div>
              <span className="text-[10px] text-amber-500 font-bold">مشاهده →</span>
            </div>
          </button>
        ))}
      </div>

      {selectedWO && <WorkOrderDetail isOpen={true} onClose={() => setSelectedWO(null)} workOrder={selectedWO} />}
      <WorkOrderWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
