"use client";

import { useState } from "react";
import { getAssetHistory } from "@/lib/asset-workspace-data";
import { AlertTriangle, Wrench, Settings, Search, Package, ShieldCheck, Filter } from "lucide-react";

interface Props {
  assetId: number;
}

const eventConfig = {
  failure: { icon: AlertTriangle, label: "خرابی", color: "#ef4444", bg: "bg-red-500/10" },
  pm: { icon: Wrench, label: "PM", color: "#22c55e", bg: "bg-green-500/10" },
  repair: { icon: Settings, label: "تعمیر", color: "#f59e0b", bg: "bg-amber-500/10" },
  modification: { icon: Settings, label: "اصلاح", color: "#8b5cf6", bg: "bg-purple-500/10" },
  inspection: { icon: Search, label: "بازرسی", color: "#3b82f6", bg: "bg-blue-500/10" },
  install: { icon: Package, label: "نصب", color: "#06b6d4", bg: "bg-cyan-500/10" },
};

export function HistoryTab({ assetId }: Props) {
  const events = getAssetHistory(assetId);
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = filter === "all" ? events : events.filter(e => e.type === filter);

  const stats = {
    total: events.length,
    failures: events.filter(e => e.type === "failure").length,
    pms: events.filter(e => e.type === "pm").length,
    repairs: events.filter(e => e.type === "repair").length,
    totalCost: events.reduce((s, e) => s + (e.cost || 0), 0),
    totalDowntime: events.reduce((s, e) => s + (e.duration || 0), 0),
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کل رویدادها</p>
          <p className="text-xl font-black text-amber-500">{stats.total}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">خرابی‌ها</p>
          <p className="text-xl font-black text-red-500">{stats.failures}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">PM انجام شده</p>
          <p className="text-xl font-black text-green-500">{stats.pms}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">هزینه کل</p>
          <p className="text-xl font-black text-blue-500">{(stats.totalCost / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Filter */}
      <div className="chart-card !p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold ml-2">فیلتر:</span>
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1 rounded-full transition-all ${filter === "all" ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'}`}
          >
            همه ({events.length})
          </button>
          {Object.entries(eventConfig).map(([key, cfg]) => {
            const count = events.filter(e => e.type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${filter === key ? `text-white font-bold` : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'}`}
                style={{ backgroundColor: filter === key ? cfg.color : undefined }}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-4">تایم‌لاین سوابق</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-[#1a1a1a]" />

          <div className="space-y-4">
            {filteredEvents.map(event => {
              const cfg = eventConfig[event.type];
              const Icon = cfg.icon;
              return (
                <div key={event.id} className="relative pr-12">
                  {/* Icon */}
                  <div
                    className={`absolute right-0 top-0 w-8 h-8 rounded-full ${cfg.bg} border-2 border-white dark:border-[#111] flex items-center justify-center z-10`}
                  >
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className={`p-3 rounded-xl border ${event.status === 'in_progress' ? 'border-amber-500/40 bg-amber-500/5' : 'border-gray-200 dark:border-[#1a1a1a]'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-gray-500">{event.date}</span>
                          {event.status === 'in_progress' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-[#0a0a0a] font-bold animate-pulse">
                              در حال انجام
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-[#0a0a0a] text-[10px] text-gray-500">
                      <span>👤 {event.by}</span>
                      {event.duration && <span>⏱ {event.duration}h</span>}
                      {event.cost && <span>💰 {(event.cost / 1000000).toFixed(1)}M</span>}
                      {event.attachments && <span>📎 {event.attachments} فایل</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
