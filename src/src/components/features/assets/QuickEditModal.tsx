"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, CheckCircle2 } from "lucide-react";
import type { AssetNode, AssetTypeKey } from "@/lib/assets-data";
import { assetTypes, isStructural } from "@/lib/assets-data";
import { useToast } from "@/components/ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetNode | null;
  onSave: (id: number, updates: Partial<AssetNode>) => void;
  onDelete?: (id: number) => void;
}

export function QuickEditModal({ isOpen, onClose, asset, onSave, onDelete }: Props) {
  const toast = useToast();
  const [data, setData] = useState<Partial<AssetNode>>({});

  useEffect(() => {
    if (asset) setData({ ...asset });
  }, [asset]);

  if (!isOpen || !asset) return null;

  const isStruct = isStructural(asset.typeKey);
  const typeInfo = assetTypes[asset.typeKey];

  const handleSave = () => {
    if (!data.name || !data.code) {
      toast.warning("ناقص", "نام و کد الزامی است");
      return;
    }
    onSave(asset.id, data);
    toast.success("ذخیره شد", `تغییرات ${data.name} ذخیره شد`);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`آیا از حذف "${asset.name}" و تمام زیرمجموعه‌ها اطمینان دارید؟`)) {
      onDelete?.(asset.id);
      toast.success("حذف شد", `${asset.name} حذف شد`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full md:max-w-lg max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-2"><div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" /></div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: typeInfo.color + '20' }}
              >
                {typeInfo.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                  {isStruct && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-500 font-bold">
                      ساختار سازمانی
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm truncate">ویرایش سریع</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="text-xs font-bold mb-1 block">نام <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input-field"
              value={data.name || ""}
              onChange={e => setData({ ...data, name: e.target.value })}
              placeholder="نام کامل"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">کد <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input-field"
              value={data.code || ""}
              onChange={e => setData({ ...data, code: e.target.value })}
              placeholder="کد یکتا"
              dir="ltr"
            />
          </div>

          {/* Fields only for real equipment/subsystem/part */}
          {!isStruct && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1 block">سازنده</label>
                  <input type="text" className="input-field" value={data.manufacturer || ""} onChange={e => setData({ ...data, manufacturer: e.target.value })} placeholder="Cannon" />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">مدل</label>
                  <input type="text" className="input-field" value={data.model || ""} onChange={e => setData({ ...data, model: e.target.value })} placeholder="A80" dir="ltr" />
                </div>
              </div>

              {asset.typeKey === "equipment" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold mb-1 block">شماره سریال</label>
                      <input type="text" className="input-field" value={data.serialNumber || ""} onChange={e => setData({ ...data, serialNumber: e.target.value })} dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">شناسنامه</label>
                      <input type="text" className="input-field" value={data.identityNumber || ""} onChange={e => setData({ ...data, identityNumber: e.target.value })} dir="ltr" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold mb-1 block">سال ساخت</label>
                      <input type="number" className="input-field" value={data.yearManufactured || ""} onChange={e => setData({ ...data, yearManufactured: Number(e.target.value) || undefined })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">سال نصب</label>
                      <input type="number" className="input-field" value={data.yearInstalled || ""} onChange={e => setData({ ...data, yearInstalled: Number(e.target.value) || undefined })} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-1 block">محل نصب</label>
                    <input type="text" className="input-field" value={data.location || ""} onChange={e => setData({ ...data, location: e.target.value })} />
                  </div>
                </>
              )}

              {/* Quantity for parts */}
              {(asset.typeKey === "part" || asset.typeKey === "subpart") && (
                <div>
                  <label className="text-xs font-bold mb-1 block">تعداد</label>
                  <input type="number" className="input-field" value={data.quantity || 1} onChange={e => setData({ ...data, quantity: Number(e.target.value) })} />
                </div>
              )}
            </>
          )}

          {/* Status */}
          <div>
            <label className="text-xs font-bold mb-2 block">وضعیت</label>
            <div className="flex gap-1">
              {[
                { v: "active", l: "فعال", c: "#22c55e" },
                { v: "maintenance", l: "تعمیر", c: "#f59e0b" },
                { v: "inactive", l: "غیرفعال", c: "#6b7280" },
                { v: "failed", l: "خراب", c: "#ef4444" },
              ].map(o => (
                <button
                  key={o.v}
                  onClick={() => setData({ ...data, status: o.v as any })}
                  className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                  style={{
                    borderColor: data.status === o.v ? o.c : "#e5e7eb",
                    backgroundColor: data.status === o.v ? o.c + '18' : "transparent",
                    color: data.status === o.v ? o.c : "#6b7280",
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* Criticality */}
          <div>
            <label className="text-xs font-bold mb-2 block">بحرانیت</label>
            <div className="flex gap-1">
              {[
                { v: "low", l: "کم", c: "#22c55e" },
                { v: "medium", l: "متوسط", c: "#3b82f6" },
                { v: "high", l: "بالا", c: "#f59e0b" },
                { v: "critical", l: "بحرانی", c: "#ef4444" },
              ].map(o => (
                <button
                  key={o.v}
                  onClick={() => setData({ ...data, criticality: o.v as any })}
                  className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                  style={{
                    borderColor: data.criticality === o.v ? o.c : "#e5e7eb",
                    backgroundColor: data.criticality === o.v ? o.c + '18' : "transparent",
                    color: data.criticality === o.v ? o.c : "#6b7280",
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* Health */}
          <div>
            <label className="text-xs font-bold mb-1 block">
              امتیاز سلامت: <span className="text-amber-500 font-black">{data.healthScore || 100}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={data.healthScore || 100}
              onChange={e => setData({ ...data, healthScore: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
          {onDelete && asset.id !== 1 && asset.id !== 2 && (
            <button onClick={handleDelete} className="btn-danger !px-3">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">انصراف</button>
          <button onClick={handleSave} className="btn-primary flex-1 justify-center">
            <Save className="w-4 h-4" />
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}
