"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { assetTypes, type AssetTypeKey, type AssetNode, assetsTreeData } from "@/lib/assets-data";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AssetNode, "id" | "path" | "level">) => void;
  initialData?: Partial<AssetNode>;
  parentId?: number | null;
  mode: "add" | "edit";
}

export function AssetFormAdvanced({ isOpen, onClose, onSave, initialData, parentId, mode }: Props) {
  const [formData, setFormData] = useState<Partial<AssetNode>>({
    name: "",
    code: "",
    typeKey: "equipment",
    parentId: parentId ?? null,
    status: "active",
    healthScore: 100,
    criticality: "medium",
    manufacturer: "",
    model: "",
    serialNumber: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        name: "",
        code: "",
        typeKey: "equipment",
        parentId: parentId ?? null,
        status: "active",
        healthScore: 100,
        criticality: "medium",
      });
    }
  }, [initialData, parentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name || !formData.code) return;
    onSave(formData as Omit<AssetNode, "id" | "path" | "level">);
    onClose();
  };

  const parentAsset = formData.parentId ? assetsTreeData.find(a => a.id === formData.parentId) : null;

  // Auto-suggest type based on parent
  const suggestChildType = (parentType?: AssetTypeKey): AssetTypeKey => {
    const chain: AssetTypeKey[] = ["company", "plant", "bespar", "location", "category", "equipment", "subsystem", "part", "subpart"];
    if (!parentType) return "company";
    const idx = chain.indexOf(parentType);
    return chain[Math.min(idx + 1, chain.length - 1)];
  };

  const suggestedType = parentAsset ? suggestChildType(parentAsset.typeKey) : "company";

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-amber-600 dark:text-amber-500 text-base md:text-lg">
              {mode === "add" ? "افزودن تجهیز جدید" : "ویرایش تجهیز"}
            </h3>
            {parentAsset && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                زیرمجموعه: {parentAsset.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="text-xs font-bold mb-2 block">نوع تجهیز <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
              {Object.entries(assetTypes).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setFormData({ ...formData, typeKey: key as AssetTypeKey })}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    formData.typeKey === key
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-500'
                      : 'border-gray-200 dark:border-[#1a1a1a] text-gray-500'
                  }`}
                >
                  <div className="text-lg">{info.icon}</div>
                  <div className="text-[9px] mt-0.5">{info.label}</div>
                </button>
              ))}
            </div>
            {suggestedType !== formData.typeKey && parentAsset && (
              <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                پیشنهاد AI: <strong>{assetTypes[suggestedType].label}</strong>
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">نام <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="مثال: میکسر اصلی"
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">کد <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="مثال: MX-101"
                value={formData.code || ""}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">سازنده</label>
              <input
                type="text"
                className="input-field"
                placeholder="Siemens, ABB, ..."
                value={formData.manufacturer || ""}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">مدل</label>
              <input
                type="text"
                className="input-field"
                value={formData.model || ""}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">شماره سریال</label>
              <input
                type="text"
                className="input-field"
                value={formData.serialNumber || ""}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">سال ساخت</label>
              <input
                type="number"
                className="input-field"
                placeholder="2020"
                value={formData.yearManufactured || ""}
                onChange={e => setFormData({ ...formData, yearManufactured: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">موقعیت نصب</label>
            <input
              type="text"
              className="input-field"
              placeholder="سالن تولید ۱، ردیف A"
              value={formData.location || ""}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Status & Criticality */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">وضعیت</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { v: "active", l: "فعال", c: "#22c55e" },
                  { v: "maintenance", l: "تعمیر", c: "#f59e0b" },
                  { v: "inactive", l: "غیرفعال", c: "#6b7280" },
                  { v: "failed", l: "خراب", c: "#ef4444" },
                ].map(o => (
                  <button
                    key={o.v}
                    onClick={() => setFormData({ ...formData, status: o.v as any })}
                    className="text-[10px] px-2 py-1 rounded-lg border transition-all"
                    style={{
                      borderColor: formData.status === o.v ? o.c : "#e5e7eb",
                      backgroundColor: formData.status === o.v ? o.c + '18' : "transparent",
                      color: formData.status === o.v ? o.c : "#6b7280",
                      fontWeight: formData.status === o.v ? 700 : 400,
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">بحرانیت</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { v: "low", l: "کم", c: "#22c55e" },
                  { v: "medium", l: "متوسط", c: "#3b82f6" },
                  { v: "high", l: "بالا", c: "#f59e0b" },
                  { v: "critical", l: "بحرانی", c: "#ef4444" },
                ].map(o => (
                  <button
                    key={o.v}
                    onClick={() => setFormData({ ...formData, criticality: o.v as any })}
                    className="text-[10px] px-2 py-1 rounded-lg border transition-all"
                    style={{
                      borderColor: formData.criticality === o.v ? o.c : "#e5e7eb",
                      backgroundColor: formData.criticality === o.v ? o.c + '18' : "transparent",
                      color: formData.criticality === o.v ? o.c : "#6b7280",
                      fontWeight: formData.criticality === o.v ? 700 : 400,
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              امتیاز سلامت: <strong className="text-amber-500">{formData.healthScore}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.healthScore || 100}
              onChange={e => setFormData({ ...formData, healthScore: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.code}
            className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === "add" ? "افزودن" : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
