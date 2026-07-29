"use client";

import { useState } from "react";
import { maintenancePlansData, statusColors, statusLabels, standardColors, standardLabels, categoryColors, categoryLabels, typeLabels, type PMStatus, type MaintenanceType, type MaintenancePlan } from "@/lib/maintenance-data";
import { Search, Filter, Plus, Play, Edit2, Trash2, MoreVertical, Clock, User, Calendar as CalendarIcon, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  onExecute: (pm: MaintenancePlan) => void;
  onEdit: (pm: MaintenancePlan) => void;
  onAdd: () => void;
}

export function PMList({ onExecute, onEdit, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<MaintenanceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<PMStatus | "all">("all");

  let filtered = maintenancePlansData;
  if (search) filtered = filtered.filter(p =>
    p.title.includes(search) || p.assetName.includes(search) || p.code.toLowerCase().includes(search.toLowerCase())
  );
  if (filterType !== "all") filtered = filtered.filter(p => p.type === filterType);
  if (filterStatus !== "all") filtered = filtered.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Toolbar */}
      <div className="chart-card !p-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="جستجو..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pr-10"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="select-field flex-1 md:w-[140px] md:flex-initial">
              <option value="all">همه انواع</option>
              <option value="preventive">پیشگیرانه</option>
              <option value="corrective">اصلاحی</option>
              <option value="predictive">پیش‌بینانه</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="select-field flex-1 md:w-[140px] md:flex-initial">
              <option value="all">همه وضعیت‌ها</option>
              <option value="scheduled">برنامه‌ریزی</option>
              <option value="in_progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
              <option value="overdue">عقب‌افتاده</option>
            </select>
            <button onClick={onAdd} className="btn-primary md:flex-initial flex-1 justify-center whitespace-nowrap">
              <Plus className="w-4 h-4" /> برنامه جدید
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-gray-500">{filtered.length} برنامه نمایش داده شد</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(pm => {
          const statusColor = statusColors[pm.status];
          const standardColor = standardColors[pm.standard];
          const categoryColor = categoryColors[pm.category];

          const isDueSoon = pm.daysUntilDue <= 3 && pm.daysUntilDue >= 0 && pm.status === "scheduled";
          const isOverdue = pm.status === "overdue";

          return (
            <div
              key={pm.id}
              className={`chart-card !p-3 card-hover border-r-4 ${isOverdue ? 'bg-red-500/5' : isDueSoon ? 'bg-amber-500/5' : ''}`}
              style={{ borderRightColor: statusColor }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: standardColor + '20', color: standardColor }}
                    >
                      {standardLabels[pm.standard]}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: categoryColor + '15', color: categoryColor }}
                    >
                      {categoryLabels[pm.category]}
                    </span>
                    {pm.aiOptimized && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 text-white font-bold flex items-center gap-0.5">
                        <Sparkles className="w-2 h-2" /> AI
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm truncate">{pm.title}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{pm.assetName}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <User className="w-3 h-3" />
                  <span className="truncate">{pm.assignedTo}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{pm.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{pm.intervalValue ? `${pm.intervalValue} ${pm.intervalUnit}` : pm.meterThreshold ? `${pm.meterThreshold}h` : "شرایطی"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">سررسید:</span>
                  <strong style={{ color: statusColor }}>
                    {isOverdue ? `${Math.abs(pm.daysUntilDue)} روز عقب` :
                     pm.daysUntilDue === 0 ? "امروز" :
                     pm.daysUntilDue === 1 ? "فردا" :
                     `${pm.daysUntilDue} روز`}
                  </strong>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#0a0a0a]">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                    style={{ backgroundColor: statusColor + '20', color: statusColor }}
                  >
                    {statusLabels[pm.status]}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onExecute(pm)}
                      className="text-[10px] px-2 py-1 rounded bg-amber-500 text-[#0a0a0a] font-bold flex items-center gap-1 hover:bg-amber-600 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      اجرا
                    </button>
                    <button
                      onClick={() => onEdit(pm)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="chart-card text-center py-12">
          <p className="text-sm text-gray-500">هیچ برنامه‌ای با این فیلترها یافت نشد</p>
        </div>
      )}
    </div>
  );
}
