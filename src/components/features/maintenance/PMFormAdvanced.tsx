"use client";

import { useState, useEffect } from "react";
import type { MaintenancePlan, MaintenanceType, TriggerType, Standard, ChecklistItem } from "@/lib/maintenance-data";
import { X, Sparkles } from "lucide-react";
import { ChecklistBuilder } from "./ChecklistBuilder";
import { useToast } from "@/components/ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MaintenancePlan | null;
}

export function PMFormAdvanced({ isOpen, onClose, initialData }: Props) {
  const toast = useToast();
  const [tab, setTab] = useState<"info" | "trigger" | "checklist" | "parts">("info");
  const [formData, setFormData] = useState<Partial<MaintenancePlan>>({
    title: "",
    description: "",
    type: "preventive",
    trigger: "time",
    intervalValue: 30,
    intervalUnit: "day",
    priority: "medium",
    standard: "TPM",
    category: "mechanical",
    estimatedHours: 2,
    checklistItems: [],
    requiredParts: [],
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
      title: "",
      description: "",
      type: "preventive",
      trigger: "time",
      intervalValue: 30,
      intervalUnit: "day",
      priority: "medium",
      standard: "TPM",
      category: "mechanical",
      estimatedHours: 2,
      checklistItems: [],
      requiredParts: [],
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: "info", label: "اطلاعات پایه" },
    { id: "trigger", label: "شرایط اجرا" },
    { id: "checklist", label: "چک‌لیست" },
    { id: "parts", label: "قطعات" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-3xl max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-amber-600 dark:text-amber-500">
              {initialData ? "ویرایش برنامه PM" : "ایجاد برنامه PM جدید"}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">تعریف کامل برنامه نگهداری</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-[#1a1a1a] flex overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                tab === t.id
                  ? 'border-amber-500 text-amber-600 dark:text-amber-500 font-bold'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "info" && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="text-xs font-bold mb-1 block">عنوان <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.title || ""}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: سرویس ماهانه میکسر"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">توضیحات</label>
                <textarea
                  className="input-field min-h-[60px] resize-y"
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">تجهیز <span className="text-red-500">*</span></label>
                <select className="select-field" value={formData.assetId || ""} onChange={e => setFormData({ ...formData, assetId: Number(e.target.value) })}>
                  <option value="">انتخاب کنید...</option>
                  <option value="13">میکسر اصلی MX-101</option>
                  <option value="20">نوار نقاله CV-101</option>
                  <option value="33">پرس مموری PR-201</option>
                  <option value="62">کمپرسور CM-501</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-2 block">نوع نگهداری</label>
                  <div className="flex gap-1">
                    {[
                      { v: "preventive", l: "PM", c: "#22c55e" },
                      { v: "corrective", l: "CM", c: "#f59e0b" },
                      { v: "predictive", l: "PdM", c: "#8b5cf6" },
                    ].map(o => (
                      <button
                        key={o.v}
                        onClick={() => setFormData({ ...formData, type: o.v as MaintenanceType })}
                        className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                        style={{
                          borderColor: formData.type === o.v ? o.c : '#e5e7eb',
                          backgroundColor: formData.type === o.v ? o.c + '18' : 'transparent',
                          color: formData.type === o.v ? o.c : '#6b7280',
                        }}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold mb-2 block">اولویت</label>
                  <div className="flex gap-1">
                    {[
                      { v: "low", l: "کم", c: "#22c55e" },
                      { v: "medium", l: "متوسط", c: "#3b82f6" },
                      { v: "high", l: "بالا", c: "#f59e0b" },
                      { v: "critical", l: "بحرانی", c: "#ef4444" },
                    ].map(o => (
                      <button
                        key={o.v}
                        onClick={() => setFormData({ ...formData, priority: o.v as any })}
                        className="flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all"
                        style={{
                          borderColor: formData.priority === o.v ? o.c : '#e5e7eb',
                          backgroundColor: formData.priority === o.v ? o.c + '18' : 'transparent',
                          color: formData.priority === o.v ? o.c : '#6b7280',
                        }}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1 block">استاندارد</label>
                  <select className="select-field" value={formData.standard} onChange={e => setFormData({ ...formData, standard: e.target.value as Standard })}>
                    <option value="TPM">TPM</option>
                    <option value="ISO_55000">ISO 55000</option>
                    <option value="ISO_14224">ISO 14224</option>
                    <option value="RCM">RCM</option>
                    <option value="Custom">سفارشی</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">دسته</label>
                  <select className="select-field" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                    <option value="mechanical">مکانیک</option>
                    <option value="electrical">برق</option>
                    <option value="hydraulic">هیدرولیک</option>
                    <option value="instrumentation">ابزار دقیق</option>
                    <option value="safety">ایمنی</option>
                    <option value="cleaning">نظافت</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1 block">مسئول اجرا</label>
                  <select className="select-field" value={formData.assignedTo || ""} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}>
                    <option value="">انتخاب کنید...</option>
                    <option value="علی محمدی">علی محمدی</option>
                    <option value="حسن رضایی">حسن رضایی</option>
                    <option value="رضا احمدی">رضا احمدی</option>
                    <option value="محمد کریمی">محمد کریمی</option>
                    <option value="امیر حسینی">امیر حسینی</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">زمان تخمینی (h)</label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.5"
                    value={formData.estimatedHours || 0}
                    onChange={e => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "trigger" && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="text-xs font-bold mb-2 block">نوع شرط اجرا</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { v: "time", l: "زمانی", d: "روز/هفته/ماه" },
                    { v: "meter", l: "کارکردی", d: "ساعت/سیکل" },
                    { v: "condition", l: "شرایطی", d: "دما/وایبرشن" },
                    { v: "hybrid", l: "ترکیبی", d: "چند شرط" },
                  ].map(o => (
                    <button
                      key={o.v}
                      onClick={() => setFormData({ ...formData, trigger: o.v as TriggerType })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.trigger === o.v
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-gray-200 dark:border-[#1a1a1a]'
                      }`}
                    >
                      <p className="text-xs font-bold">{o.l}</p>
                      <p className="text-[9px] text-gray-500 mt-1">{o.d}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formData.trigger === "time" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold mb-1 block">فواصل</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.intervalValue || 0}
                      onChange={e => setFormData({ ...formData, intervalValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1 block">واحد</label>
                    <select className="select-field" value={formData.intervalUnit || "day"} onChange={e => setFormData({ ...formData, intervalUnit: e.target.value as any })}>
                      <option value="day">روز</option>
                      <option value="week">هفته</option>
                      <option value="month">ماه</option>
                      <option value="year">سال</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.trigger === "meter" && (
                <div>
                  <label className="text-xs font-bold mb-1 block">آستانه (ساعت کارکرد)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="500"
                    value={formData.meterThreshold || 0}
                    onChange={e => setFormData({ ...formData, meterThreshold: Number(e.target.value) })}
                  />
                </div>
              )}

              {formData.trigger === "condition" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold mb-1 block">پارامتر</label>
                    <select className="select-field" value={formData.conditionParam || ""} onChange={e => setFormData({ ...formData, conditionParam: e.target.value })}>
                      <option value="">انتخاب...</option>
                      <option value="vibration">وایبرشن (mm/s)</option>
                      <option value="temperature">دما (°C)</option>
                      <option value="pressure">فشار (bar)</option>
                      <option value="current">جریان (A)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1 block">آستانه هشدار</label>
                    <input
                      type="number"
                      className="input-field"
                      step="0.1"
                      value={formData.conditionValue || 0}
                      onChange={e => setFormData({ ...formData, conditionValue: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  <strong className="text-purple-500">پیشنهاد AI:</strong> برای این تجهیز با توجه به سابقه خرابی، فاصله <strong>۳۰ روزه</strong> بهینه است.
                </p>
              </div>
            </div>
          )}

          {tab === "checklist" && (
            <ChecklistBuilder
              items={formData.checklistItems || []}
              onChange={items => setFormData({ ...formData, checklistItems: items })}
            />
          )}

          {tab === "parts" && (
            <div className="space-y-3 animate-fade-in">
              <div className="chart-card !p-3">
                <p className="text-xs font-bold mb-2">قطعات مورد نیاز برای این PM</p>
                <p className="text-[10px] text-gray-500 mb-3">این قطعات به‌صورت خودکار در انبار رزرو خواهند شد</p>
                <div className="space-y-2">
                  {(formData.requiredParts || []).map((part, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                      <span className="text-xs flex-1">{part.partName}</span>
                      <span className="text-xs font-mono text-gray-500">{part.quantity}</span>
                    </div>
                  ))}
                  {(!formData.requiredParts || formData.requiredParts.length === 0) && (
                    <p className="text-xs text-gray-500 text-center py-4">قطعه‌ای تعریف نشده</p>
                  )}
                </div>
                <button className="btn-secondary w-full mt-3 justify-center">+ افزودن قطعه</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">انصراف</button>
          <button
            onClick={() => {
              toast.success(
                initialData ? "PM ویرایش شد" : "PM جدید ایجاد شد",
                `«${formData.title}» با موفقیت ${initialData ? "به‌روز" : "ثبت"} شد`
              );
              onClose();
            }}
            disabled={!formData.title}
            className="btn-primary flex-1 justify-center disabled:opacity-40"
          >
            {initialData ? "ذخیره تغییرات" : "ایجاد PM"}
          </button>
        </div>
      </div>
    </div>
  );
}
