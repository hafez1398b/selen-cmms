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
      {/* View Selector - Desktop */}
      <div className="hidden md:flex chart-card !p-1.5 mb-4 gap-1">
        {views.map(v => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                view === v.id
                  ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* View Selector - Mobile Dropdown */}
      <div className="md:hidden mb-4 relative">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full chart-card !p-3 flex items-center justify-between"
        >
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
                <button
                  key={v.id}
                  onClick={() => { setView(v.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm border-b border-gray-100 dark:border-[#0a0a0a] last:border-0 ${
                    view === v.id ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {v.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      {view === "dashboard" && <MaintenanceDashboard />}
      {view === "list" && <PMList onExecute={setExecutePM} onEdit={handleEdit} onAdd={handleAdd} />}
      {view === "calendar" && <PMCalendar onSelectPM={setExecutePM} />}
      {view === "kanban" && <PMKanban onSelectPM={setExecutePM} />}
      {view === "lubrication" && <LubricationView />}
      {view === "inspection" && <InspectionView />}

      {/* Modals */}
      <PMExecutionModal pm={executePM} onClose={() => setExecutePM(null)} />
      <PMFormAdvanced isOpen={formOpen} onClose={() => setFormOpen(false)} initialData={editPM} />
    </div>
  );
}

// Lubrication Routes View
function LubricationView() {
  const { lubricationRoutesData, lubricationPointsData } = require("@/lib/maintenance-data");
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="chart-card !p-3">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-bold text-sm">مسیرهای روانکاری</h3>
            <p className="text-[10px] text-gray-500">{lubricationRoutesData.length} مسیر • {lubricationPointsData.length} نقطه روانکاری</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {lubricationRoutesData.map((route: any) => (
          <div key={route.id} className="chart-card !p-3 card-hover">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[9px] font-mono text-gray-500">{route.code}</span>
                <p className="font-bold text-sm mt-0.5">{route.name}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                backgroundColor: route.status === 'overdue' ? '#ef444420' : route.status === 'due_soon' ? '#f59e0b20' : '#22c55e20',
                color: route.status === 'overdue' ? '#ef4444' : route.status === 'due_soon' ? '#f59e0b' : '#22c55e'
              }}>
                {route.status === 'overdue' ? 'عقب‌افتاده' : route.status === 'due_soon' ? 'نزدیک' : 'طبق برنامه'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
              <p>👤 مسئول: {route.assignedTo}</p>
              <p>⏱ زمان: {route.estimatedMinutes} دقیقه</p>
              <p>📍 نقاط: {route.points.length}</p>
              <p>📅 دفعات: {route.frequency}</p>
              <p>🕐 سررسید: {route.nextDue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">نقاط روانکاری</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-2 px-2 text-gray-500">کد</th>
                <th className="text-right py-2 px-2 text-gray-500">تجهیز</th>
                <th className="text-right py-2 px-2 text-gray-500">محل</th>
                <th className="text-right py-2 px-2 text-gray-500">روانکار</th>
                <th className="text-center py-2 px-2 text-gray-500">مقدار</th>
                <th className="text-center py-2 px-2 text-gray-500">دفعات</th>
                <th className="text-center py-2 px-2 text-gray-500">روش</th>
              </tr>
            </thead>
            <tbody>
              {lubricationPointsData.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-[#0a0a0a] table-row-hover">
                  <td className="py-2 px-2 font-mono">{p.pointCode}</td>
                  <td className="py-2 px-2">{p.assetName}</td>
                  <td className="py-2 px-2">{p.location}</td>
                  <td className="py-2 px-2 text-blue-500">{p.lubricantType}</td>
                  <td className="py-2 px-2 text-center">{p.quantity} {p.unit}</td>
                  <td className="py-2 px-2 text-center">{p.frequency}</td>
                  <td className="py-2 px-2 text-center">{p.method === 'auto' ? '🤖 خودکار' : p.method === 'central' ? '🏭 مرکزی' : '👤 دستی'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Inspection Rounds View
function InspectionView() {
  const { inspectionRoundsData, inspectionPointsData } = require("@/lib/maintenance-data");
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="chart-card !p-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className="font-bold text-sm">گشت‌های بازرسی</h3>
            <p className="text-[10px] text-gray-500">{inspectionRoundsData.length} گشت • {inspectionPointsData.length} نقطه بازرسی</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {inspectionRoundsData.map((round: any) => (
          <div key={round.id} className="chart-card !p-3 card-hover">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[9px] font-mono text-gray-500">{round.code}</span>
                <p className="font-bold text-sm mt-0.5">{round.name}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                backgroundColor: round.status === 'overdue' ? '#ef444420' : round.status === 'due_soon' ? '#f59e0b20' : '#22c55e20',
                color: round.status === 'overdue' ? '#ef4444' : round.status === 'due_soon' ? '#f59e0b' : '#22c55e'
              }}>
                {round.status === 'overdue' ? 'عقب‌افتاده' : round.status === 'due_soon' ? 'نزدیک' : 'طبق برنامه'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
              <p>👤 مسئول: {round.assignedTo}</p>
              <p>⏱ زمان: {round.estimatedMinutes} دقیقه</p>
              <p>🔍 نقاط: {round.points.length}</p>
              <p>📅 دفعات: {round.frequency}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3">نقاط بازرسی</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-2 px-2 text-gray-500">تجهیز</th>
                <th className="text-right py-2 px-2 text-gray-500">نقطه</th>
                <th className="text-right py-2 px-2 text-gray-500">پارامتر</th>
                <th className="text-center py-2 px-2 text-gray-500">حداقل</th>
                <th className="text-center py-2 px-2 text-gray-500">حداکثر</th>
                <th className="text-center py-2 px-2 text-gray-500">واحد</th>
                <th className="text-center py-2 px-2 text-gray-500">روش</th>
              </tr>
            </thead>
            <tbody>
              {inspectionPointsData.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-[#0a0a0a] table-row-hover">
                  <td className="py-2 px-2">{p.assetName}</td>
                  <td className="py-2 px-2 font-bold">{p.pointName}</td>
                  <td className="py-2 px-2 text-purple-500" dir="ltr">{p.parameter}</td>
                  <td className="py-2 px-2 text-center">{p.minValue ?? "-"}</td>
                  <td className="py-2 px-2 text-center">{p.maxValue ?? "-"}</td>
                  <td className="py-2 px-2 text-center">{p.unit ?? "-"}</td>
                  <td className="py-2 px-2 text-center text-gray-500">{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
