"use client";

import { maintenancePlansData, statusColors, statusLabels, standardColors, standardLabels, type PMStatus, type MaintenancePlan } from "@/lib/maintenance-data";
import { User, Clock, Play, Sparkles } from "lucide-react";

interface Props {
  onSelectPM: (pm: MaintenancePlan) => void;
}

const columns: { status: PMStatus; icon: string }[] = [
  { status: "overdue", icon: "🔴" },
  { status: "in_progress", icon: "🟡" },
  { status: "scheduled", icon: "🔵" },
  { status: "completed", icon: "🟢" },
];

export function PMKanban({ onSelectPM }: Props) {
  const grouped = columns.map(col => ({
    ...col,
    items: maintenancePlansData.filter(p => p.status === col.status),
  }));

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {grouped.map(col => (
          <div key={col.status} className="chart-card !p-3 min-h-[400px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: statusColors[col.status] + '40' }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.icon}</span>
                <span className="text-sm font-bold" style={{ color: statusColors[col.status] }}>
                  {statusLabels[col.status]}
                </span>
              </div>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: statusColors[col.status] + '20', color: statusColors[col.status] }}
              >
                {col.items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
              {col.items.map(pm => (
                <button
                  key={pm.id}
                  onClick={() => onSelectPM(pm)}
                  className="w-full text-right p-2.5 rounded-lg bg-gray-50 dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-[#111] transition-colors border border-gray-100 dark:border-[#1a1a1a] hover:border-amber-500"
                >
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    <span
                      className="text-[8px] px-1 py-0.5 rounded font-bold"
                      style={{ backgroundColor: standardColors[pm.standard] + '20', color: standardColors[pm.standard] }}
                    >
                      {standardLabels[pm.standard]}
                    </span>
                    {pm.aiOptimized && <Sparkles className="w-2.5 h-2.5 text-amber-500" />}
                  </div>
                  <p className="text-xs font-bold truncate">{pm.title}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{pm.assetName}</p>
                  <div className="flex items-center justify-between mt-2 text-[9px] text-gray-500">
                    <span className="flex items-center gap-0.5">
                      <User className="w-2.5 h-2.5" /> {pm.assignedTo.split(" ")[0]}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {pm.estimatedHours}h
                    </span>
                  </div>
                </button>
              ))}
              {col.items.length === 0 && (
                <p className="text-[10px] text-gray-500 text-center py-8">خالی</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
