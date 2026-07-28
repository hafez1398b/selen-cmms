"use client";

import { useState, useMemo } from "react";
import { getAssetPMs } from "@/lib/asset-workspace-data";
import {
  Wrench, Clock, User, Calendar, CheckCircle2, AlertTriangle,
  Plus, Play, Sparkles, FileText, ChevronDown, ChevronLeft
} from "lucide-react";
import { PMFormAdvanced } from "@/components/features/maintenance/PMFormAdvanced";
import { PMExecutionModal } from "@/components/features/maintenance/PMExecutionModal";
import type { MaintenancePlan } from "@/lib/maintenance-data";
import { getAssetById } from "@/lib/assets-data";
import { getEquipmentByIdentity, getPMSummary, type PMActivity } from "@/lib/selen-equipment-data";
import { useToast } from "@/components/ui/Toast";

interface Props {
  assetId: number;
}

export function PMTab({ assetId }: Props) {
  const toast = useToast();
  const pms = getAssetPMs(assetId);
  const asset = getAssetById(assetId);
  const [formOpen, setFormOpen] = useState(false);
  const [executePM, setExecutePM] = useState<MaintenancePlan | null>(null);
  const [editPM, setEditPM] = useState<MaintenancePlan | null>(null);
  const [expandedFreq, setExpandedFreq] = useState<Set<string>>(new Set(["روزانه"]));

  // Try to find matching PM template from Selen equipment library
  const selenEq = asset?.identityNumber ? getEquipmentByIdentity(asset.identityNumber) : null;
  const pmTemplate = useMemo(() => {
    if (!selenEq) return null;
    return getPMSummary(selenEq.category);
  }, [selenEq]);

  const statusConfig = {
    on_schedule: { label: "طبق برنامه", color: "#22c55e", icon: CheckCircle2 },
    due_soon: { label: "نزدیک سررسید", color: "#f59e0b", icon: Clock },
    overdue: { label: "عقب‌افتاده", color: "#ef4444", icon: AlertTriangle },
  };

  const freqColors: Record<string, string> = {
    "روزانه": "#22c55e",
    "هفتگی": "#3b82f6",
    "ماهانه": "#f59e0b",
    "فصلی": "#8b5cf6",
    "شش ماهه": "#ec4899",
    "سالانه": "#ef4444",
  };

  const prefilledData: any = editPM || {
    assetId: assetId,
    assetName: asset?.name || "",
    assetCode: asset?.code || "",
  };

  const toggleFreq = (freq: string) => {
    const next = new Set(expandedFreq);
    if (next.has(freq)) next.delete(freq);
    else next.add(freq);
    setExpandedFreq(next);
  };

  const generateAllPMs = () => {
    if (!pmTemplate) return;
    toast.success(
      "برنامه‌های PM تولید شد",
      `${pmTemplate.totalActivities} فعالیت PM بر اساس ${pmTemplate.standard} برای ${asset?.name} ایجاد شد`
    );
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

      {/* AI-Generated PM Template */}
      {pmTemplate && (
        <div className="chart-card !p-4 border-purple-500/30 bg-gradient-to-l from-purple-500/5 to-transparent">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-purple-600 dark:text-purple-400">
                برنامه PM تولید شده توسط AI سلن
              </h4>
              <p className="text-[10px] text-gray-500 mt-1">
                بر اساس <strong>{pmTemplate.standard}</strong> برای این نوع تجهیز
              </p>
            </div>
            <button
              onClick={generateAllPMs}
              className="btn-primary text-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              فعال‌سازی همه
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-center">
              <p className="text-[9px] text-gray-500">کل فعالیت‌ها</p>
              <p className="text-lg font-black text-purple-500">{pmTemplate.totalActivities}</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-center">
              <p className="text-[9px] text-gray-500">ساعت سالانه</p>
              <p className="text-lg font-black text-amber-500">{pmTemplate.totalHoursPerYear}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-center">
              <p className="text-[9px] text-gray-500">دسته‌بندی‌ها</p>
              <p className="text-lg font-black text-green-500">{Object.keys(pmTemplate.groups).length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-center">
              <p className="text-[9px] text-gray-500">استاندارد</p>
              <p className="text-xs font-bold text-blue-500 mt-1">{pmTemplate.standard.split("+")[0]}</p>
            </div>
          </div>

          {/* Grouped activities */}
          <div className="space-y-2">
            {Object.entries(pmTemplate.groups).map(([freq, activities]) => {
              const isExpanded = expandedFreq.has(freq);
              const color = freqColors[freq] || "#6b7280";
              const totalMin = activities.reduce((s, a) => s + (a.estimatedMinutes || 0), 0);
              return (
                <div key={freq} className="border border-gray-200 dark:border-[#1a1a1a] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFreq(freq)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors"
                    style={{ backgroundColor: color + "08" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-bold text-sm">{freq}</span>
                      <span className="text-[10px] text-gray-500">
                        ({activities.length} فعالیت • {totalMin} دقیقه)
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="p-2 space-y-1 border-t border-gray-100 dark:border-[#0a0a0a]">
                      {activities.map((act: PMActivity, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#0a0a0a] text-xs">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: color + '20' }}>
                            <span className="text-[10px] font-bold" style={{ color }}>{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{act.activity}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                              <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{act.estimatedMinutes} دقیقه</span>
                              {act.standard && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">{act.standard}</span>}
                              {act.requiredParts && act.requiredParts.length > 0 && (
                                <span className="text-amber-500">📦 {act.requiredParts.join("، ")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="chart-card !p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">برنامه‌های PM فعال این تجهیز</span>
        </div>
        <button onClick={() => { setEditPM(null); setFormOpen(true); }} className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          افزودن PM
        </button>
      </div>

      {/* PM Cards */}
      {pms.length === 0 ? (
        <div className="chart-card text-center py-12">
          <Wrench className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 mb-1">هنوز PM فعالی ثبت نشده</p>
          {pmTemplate ? (
            <p className="text-xs text-gray-500 mb-4">می‌توانید از قالب AI بالا استفاده کنید یا PM دستی اضافه کنید</p>
          ) : (
            <p className="text-xs text-gray-500 mb-4">با دکمه بالا اولین برنامه را ایجاد کنید</p>
          )}
          <button onClick={() => { setEditPM(null); setFormOpen(true); }} className="btn-primary text-xs mx-auto justify-center">
            <Plus className="w-3.5 h-3.5" />
            ایجاد برنامه PM جدید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pms.map(pm => {
            const statusCfg = statusConfig[pm.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={pm.id} className="chart-card !p-4 card-hover border-r-4" style={{ borderRightColor: statusCfg.color }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-500">
                        {pm.standard}
                      </span>
                    </div>
                    <p className="font-bold text-sm">{pm.title}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: statusCfg.color + '18', color: statusCfg.color }}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <div>فواصل: <strong>{pm.interval}</strong></div>
                  <div>زمان: <strong>{pm.estimatedHours}h</strong></div>
                  <div>مسئول: <strong>{pm.assignedTo}</strong></div>
                  <div>سررسید: <strong style={{ color: statusCfg.color }}>{pm.nextDue}</strong></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-[#0a0a0a]">
                  <span className="text-[10px] text-gray-500">آخرین اجرا: {pm.lastExecuted}</span>
                  <button
                    onClick={() => {
                      const mp = { ...pm, code: `PM-${pm.id}`, description: "", type: "preventive", trigger: pm.type as any, assetName: asset?.name || "", assetCode: asset?.code || "", assetId, intervalValue: 30, intervalUnit: "day", daysUntilDue: 0, category: "mechanical", checklistItems: [], requiredParts: [], estimatedCost: 0, isActive: true, createdAt: "", createdBy: "-", requiredSkills: [], priority: "medium" } as any;
                      setExecutePM(mp);
                    }}
                    className="text-[10px] px-3 py-1 rounded bg-amber-500 text-[#0a0a0a] font-bold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    اجرا
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PMFormAdvanced
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditPM(null); }}
        initialData={prefilledData}
      />
      <PMExecutionModal pm={executePM} onClose={() => setExecutePM(null)} />
    </div>
  );
}
