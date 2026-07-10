"use client";

import { getAssetPMs } from "@/lib/asset-workspace-data";
import { Wrench, Clock, User, Calendar, CheckCircle2, AlertTriangle, Plus, Play } from "lucide-react";

interface Props {
  assetId: number;
}

export function PMTab({ assetId }: Props) {
  const pms = getAssetPMs(assetId);

  const statusConfig = {
    on_schedule: { label: "طبق برنامه", color: "#22c55e", icon: CheckCircle2 },
    due_soon: { label: "نزدیک سررسید", color: "#f59e0b", icon: Clock },
    overdue: { label: "عقب‌افتاده", color: "#ef4444", icon: AlertTriangle },
  };

  const typeLabel = {
    time: "زمانی",
    meter: "کارکردی",
    condition: "شرایطی",
  };

  const standardColor = {
    ISO: "#3b82f6",
    TPM: "#22c55e",
    RCM: "#8b5cf6",
    Custom: "#6b7280",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کل PM ها</p>
          <p className="text-xl font-black text-amber-500">{pms.length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">طبق برنامه</p>
          <p className="text-xl font-black text-green-500">{pms.filter(p => p.status === "on_schedule").length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">نزدیک سررسید</p>
          <p className="text-xl font-black text-amber-500">{pms.filter(p => p.status === "due_soon").length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">عقب‌افتاده</p>
          <p className="text-xl font-black text-red-500">{pms.filter(p => p.status === "overdue").length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="chart-card !p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">برنامه‌های نگهداری این تجهیز</span>
        </div>
        <button className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          افزودن PM
        </button>
      </div>

      {/* PM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pms.map(pm => {
          const statusCfg = statusConfig[pm.status];
          const StatusIcon = statusCfg.icon;
          return (
            <div
              key={pm.id}
              className="chart-card !p-4 card-hover border-r-4"
              style={{ borderRightColor: statusCfg.color }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: standardColor[pm.standard] + '20', color: standardColor[pm.standard] }}
                    >
                      {pm.standard}
                    </span>
                    <span className="text-[9px] text-gray-500">{typeLabel[pm.type]}</span>
                  </div>
                  <p className="font-bold text-sm">{pm.title}</p>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: statusCfg.color + '18', color: statusCfg.color }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>فواصل: <strong className="text-gray-700 dark:text-gray-300">{pm.interval}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{pm.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-3 h-3" />
                  <span className="truncate">{pm.assignedTo}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>سررسید: <strong style={{ color: statusCfg.color }}>{pm.nextDue}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-[#0a0a0a]">
                <span className="text-[10px] text-gray-500">آخرین اجرا: {pm.lastExecuted}</span>
                <button
                  className="text-[10px] px-3 py-1 rounded bg-amber-500 text-[#0a0a0a] font-bold flex items-center gap-1 hover:bg-amber-600"
                >
                  <Play className="w-3 h-3" />
                  اجرا
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
