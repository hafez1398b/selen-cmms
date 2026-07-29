"use client";

import { useState } from "react";
import { MaintenanceDashboard } from "@/components/features/maintenance/MaintenanceDashboard";
import { PMList } from "@/components/features/maintenance/PMList";
import { PMCalendar } from "@/components/features/maintenance/PMCalendar";
import { PMKanban } from "@/components/features/maintenance/PMKanban";
import { PMExecutionModal } from "@/components/features/maintenance/PMExecutionModal";
import { PMFormAdvanced } from "@/components/features/maintenance/PMFormAdvanced";
import type { MaintenancePlan } from "@/lib/maintenance-data";
import { LayoutDashboard, List, Calendar, Kanban, Droplet, Search, ChevronDown } from "lucide-react";

type ViewMode = "dashboard" | "list" | "calendar" | "kanban" | "lubrication" | "inspection";

export function MaintenancePage() {
  const [view, setView] = useState<ViewMode>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [executePM, setExecutePM] = useState<MaintenancePlan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editPM, setEditPM] = useState<MaintenancePlan | null>(null);

  const views: { id: ViewMode; label: string; icon: any }[] = [
    { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
    { id: "list", label: "لیست PM ها", icon: List },
    { id: "calendar", label: "تقویم", icon: Calendar },
    { id: "kanban", label: "کانبان", icon: Kanban },
    { id: "lubrication", label: "روانکاری", icon: Droplet },
    { id: "inspection", label: "بازرسی", icon: Search },
  ];

  const activeView = views.find(v => v.id === view);

  const handleEdit = (pm: MaintenancePlan) => {
    setEditPM(pm);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditPM(null);
    setFormOpen(true);
  };

  return (
    <div className="p-3 md:p-5 lg:p-6 animate-fade-in">
      {/* View Selector */}
      <div className="hidden md:flex chart-card !p-1.5 mb-4 gap-1">
        {views.map(v => {
          const Icon = v.icon;
          return (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                view === v.id ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
              }`}>
              <Icon className="w-4 h-4" />{v.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden mb-4 relative">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-full chart-card !p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeView && <activeView.icon className="w-4 h-4 text-amber-500" />}
            <span className="text-sm font-bold">{activeView?.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-lg shadow-2xl z-30 overflow-hidden">
            {views.map(v => {
              const Icon = v.icon;
              return (
                <button key={v.id} onClick={() => { setView(v.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm border-b border-gray-100 dark:border-[#0a0a0a] last:border-0 ${
                    view === v.id ? 'bg-amber-500/10 text-amber-500 font-bold' : ''
                  }`}>
                  <Icon className="w-4 h-4" />{v.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {view === "dashboard" && <MaintenanceDashboard />}
      {view === "list" && <PMList onExecute={setExecutePM} onEdit={handleEdit} onAdd={handleAdd} />}
      {view === "calendar" && <PMCalendar onSelectPM={setExecutePM} />}
      {view === "kanban" && <PMKanban onSelectPM={setExecutePM} />}
      {view === "lubrication" && <LubricationView />}
      {view === "inspection" && <InspectionView />}

      <PMExecutionModal pm={executePM} onClose={() => setExecutePM(null)} />
      <PMFormAdvanced isOpen={formOpen} onClose={() => setFormOpen(false)} initialData={editPM} />
    </div>
  );
}

function LubricationView() {
  const { lubricationRoutesData, lubricationPointsData } = require("@/lib/maintenance-data");
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="chart-card !p-3 flex items-center gap-2">
        <Droplet className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-bold text-sm">مسیرهای روانکاری</h3>
          <p className="text-[10px] text-gray-500">{lubricationRoutesData.length} مسیر • {lubricationPointsData.length} نقطه</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {lubricationRoutesData.map((r: any) => (
          <div key={r.id} className="chart-card !p-3 card-hover">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[9px] font-mono text-gray-500">{r.code}</span>
                <p className="font-bold text-sm mt-0.5">{r.name}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                backgroundColor: r.status === 'overdue' ? '#ef444420' : r.status === 'due_soon' ? '#f59e0b20' : '#22c55e20',
                color: r.status === 'overdue' ? '#ef4444' : r.status === 'due_soon' ? '#f59e0b' : '#22c55e'
              }}>{r.status === 'overdue' ? 'عقب‌افتاده' : r.status === 'due_soon' ? 'نزدیک' : 'طبق برنامه'}</span>
            </div>
            <div className="text-[10px] text-gray-500 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
              <p>👤 {r.assignedTo}</p>
              <p>⏱ {r.estimatedMinutes} دقیقه • 📍 {r.points.length} نقطه</p>
              <p>🕐 سررسید: {r.nextDue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectionView() {
  const { inspectionRoundsData, inspectionPointsData } = require("@/lib/maintenance-data");
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="chart-card !p-3 flex items-center gap-2">
        <Search className="w-5 h-5 text-purple-500" />
        <div>
          <h3 className="font-bold text-sm">گشت‌های بازرسی</h3>
          <p className="text-[10px] text-gray-500">{inspectionRoundsData.length} گشت • {inspectionPointsData.length} نقطه</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {inspectionRoundsData.map((r: any) => (
          <div key={r.id} className="chart-card !p-3 card-hover">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[9px] font-mono text-gray-500">{r.code}</span>
                <p className="font-bold text-sm mt-0.5">{r.name}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                backgroundColor: r.status === 'overdue' ? '#ef444420' : r.status === 'due_soon' ? '#f59e0b20' : '#22c55e20',
                color: r.status === 'overdue' ? '#ef4444' : r.status === 'due_soon' ? '#f59e0b' : '#22c55e'
              }}>{r.status === 'overdue' ? 'عقب‌افتاده' : r.status === 'due_soon' ? 'نزدیک' : 'طبق برنامه'}</span>
            </div>
            <div className="text-[10px] text-gray-500 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
              <p>👤 {r.assignedTo}</p>
              <p>⏱ {r.estimatedMinutes} دقیقه • 🔍 {r.points.length} نقطه</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
