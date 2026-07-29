"use client";

import { useState } from "react";
import type { MaintenancePlan, ChecklistItem } from "@/lib/maintenance-data";
import { X, CheckCircle2, XCircle, Camera, Clock, AlertCircle, Sparkles, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Props {
  pm: MaintenancePlan | null;
  onClose: () => void;
}

interface ChecklistResult {
  itemId: string;
  value: any;
  checked: boolean;
}

export function PMExecutionModal({ pm, onClose }: Props) {
  const toast = useToast();
  const [results, setResults] = useState<Record<string, ChecklistResult>>({});
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"prepare" | "execute" | "review" | "done">("prepare");

  if (!pm) return null;

  const completedCount = Object.values(results).filter(r => r.checked || r.value).length;
  const requiredItems = pm.checklistItems.filter(i => i.required).length;
  const progress = pm.checklistItems.length > 0 ? Math.round((completedCount / pm.checklistItems.length) * 100) : 0;

  const setResult = (itemId: string, updates: Partial<ChecklistResult>) => {
    setResults(prev => ({ ...prev, [itemId]: { ...prev[itemId], itemId, ...updates } as ChecklistResult }));
  };

  const canComplete = pm.checklistItems.filter(i => i.required).every(i => {
    const r = results[i.id];
    return r && (r.checked || r.value);
  });

  const handleComplete = () => {
    if (!canComplete) {
      toast.warning("ناقص", "لطفاً همه آیتم‌های الزامی را تکمیل کنید");
      return;
    }
    setStep("done");
    setTimeout(() => {
      toast.success("PM تکمیل شد", `${pm.title} با موفقیت اجرا شد`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-2xl max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 mb-0.5">اجرای برنامه PM</p>
              <h3 className="font-bold text-sm text-amber-600 dark:text-amber-500">{pm.title}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{pm.assetName} • {pm.assetCode}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-1">
            {(["prepare", "execute", "review", "done"] as const).map((s, i) => {
              const labels = ["آماده‌سازی", "اجرا", "بررسی", "تکمیل"];
              const idx = ["prepare", "execute", "review", "done"].indexOf(step);
              const isActive = s === step;
              const isDone = i < idx;
              return (
                <div key={s} className="flex-1 flex items-center gap-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      isDone ? 'bg-green-500' : isActive ? 'bg-amber-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'
                    }`}
                  />
                  <span className={`text-[9px] font-bold whitespace-nowrap ${isActive ? 'text-amber-500' : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                    {labels[i]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          {step === "execute" && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span>پیشرفت: {completedCount} / {pm.checklistItems.length}</span>
                <span className="font-bold text-amber-500">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === "prepare" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">اطلاعات برنامه</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">مسئول: </span>
                    <strong>{pm.assignedTo}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">زمان: </span>
                    <strong>{pm.estimatedHours}h</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">استاندارد: </span>
                    <strong>{pm.standard}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">هزینه: </span>
                    <strong>{(pm.estimatedCost / 1000000).toFixed(1)}M</strong>
                  </div>
                </div>
              </div>

              {pm.requiredSkills.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-2">مهارت‌های مورد نیاز:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pm.requiredSkills.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pm.requiredParts.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-2">قطعات مورد نیاز:</p>
                  <div className="space-y-1">
                    {pm.requiredParts.map((part, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-xs">
                        <span>{part.partName}</span>
                        <span className="font-mono text-gray-500">{part.quantity} عدد</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  قبل از شروع، از رعایت پروتکل ایمنی (LOTO) و آماده‌بودن ابزار اطمینان حاصل کنید.
                </p>
              </div>
            </div>
          )}

          {step === "execute" && (
            <div className="space-y-3 animate-fade-in">
              {pm.checklistItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  این PM چک‌لیست ندارد. مستقیماً به بررسی بروید.
                </div>
              ) : (
                pm.checklistItems.map((item, i) => {
                  const result = results[item.id];
                  const isDone = result && (result.checked || result.value);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isDone
                          ? 'border-green-500/40 bg-green-500/5'
                          : 'border-gray-200 dark:border-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-6 flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-bold">{item.title}</p>
                            {item.required && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 font-bold">
                                الزامی
                              </span>
                            )}
                          </div>

                          {item.type === "checkbox" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setResult(item.id, { checked: true, value: "OK" })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                  result?.value === "OK"
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                تایید
                              </button>
                              <button
                                onClick={() => setResult(item.id, { checked: true, value: "NG" })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                  result?.value === "NG"
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                رد
                              </button>
                            </div>
                          )}

                          {item.type === "number" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder={`مقدار${item.unit ? ` (${item.unit})` : ''}`}
                                value={result?.value || ""}
                                onChange={e => setResult(item.id, { value: e.target.value, checked: !!e.target.value })}
                                className="input-field flex-1"
                                dir="ltr"
                              />
                              {item.unit && <span className="text-xs text-gray-500">{item.unit}</span>}
                              {item.min !== undefined && item.max !== undefined && (
                                <span className="text-[9px] text-gray-500">({item.min}-{item.max})</span>
                              )}
                            </div>
                          )}

                          {item.type === "text" && (
                            <textarea
                              placeholder="توضیحات..."
                              value={result?.value || ""}
                              onChange={e => setResult(item.id, { value: e.target.value, checked: !!e.target.value })}
                              className="input-field !py-2 min-h-[60px] resize-y"
                            />
                          )}

                          {item.type === "photo" && (
                            <button
                              onClick={() => setResult(item.id, { checked: true, value: "photo_uploaded" })}
                              className={`w-full py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border-2 border-dashed ${
                                result?.checked
                                  ? 'border-green-500 bg-green-500/10 text-green-500'
                                  : 'border-gray-300 dark:border-[#2a2a2a] text-gray-500'
                              }`}
                            >
                              <Camera className="w-4 h-4" />
                              {result?.checked ? "عکس بارگذاری شد" : "بارگذاری عکس"}
                            </button>
                          )}

                          {item.type === "signature" && (
                            <button
                              onClick={() => setResult(item.id, { checked: true, value: "signed" })}
                              className={`w-full py-3 rounded-lg text-xs font-bold ${
                                result?.checked
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'
                              }`}
                            >
                              {result?.checked ? "✓ امضا شد" : "امضا"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm font-bold text-green-600 dark:text-green-500 mb-2">✅ خلاصه اجرا</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• آیتم‌های تکمیل شده: <strong>{completedCount} / {pm.checklistItems.length}</strong></li>
                  <li>• درصد پیشرفت: <strong>{progress}%</strong></li>
                  <li>• آیتم‌های الزامی: <strong>{requiredItems}</strong> ({canComplete ? "✓ همه تکمیل" : "⚠ ناقص"})</li>
                </ul>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">یادداشت و مشاهدات:</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مواردی که نیاز به توجه دارد..."
                  className="input-field min-h-[100px] resize-y"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  پس از تکمیل، سیستم به صورت خودکار دستور کار مرتبط را تولید و آمار MTBF/MTTR را به‌روز می‌کند.
                </p>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-lg font-bold text-green-500 mb-1">PM با موفقیت تکمیل شد!</p>
              <p className="text-xs text-gray-500">در حال ثبت نتایج...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "done" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            {step !== "prepare" && (
              <button
                onClick={() => setStep(step === "review" ? "execute" : "prepare")}
                className="btn-secondary flex-1 justify-center"
              >
                → مرحله قبل
              </button>
            )}
            {step === "prepare" && (
              <button onClick={() => setStep("execute")} className="btn-primary flex-1 justify-center">
                شروع اجرا ←
              </button>
            )}
            {step === "execute" && (
              <button onClick={() => setStep("review")} className="btn-primary flex-1 justify-center">
                بررسی نهایی ←
              </button>
            )}
            {step === "review" && (
              <button onClick={handleComplete} className="btn-primary flex-1 justify-center">
                <CheckCircle2 className="w-4 h-4" />
                تکمیل و ثبت
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
