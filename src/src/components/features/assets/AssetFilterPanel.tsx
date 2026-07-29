"use client";

import { X, RotateCcw } from "lucide-react";
import { assetTypes, type AssetTypeKey } from "@/lib/assets-data";
import type { AssetFilters } from "@/hooks/useAssetTree";
import { defaultFilters } from "@/hooks/useAssetTree";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: AssetFilters;
  onChange: (f: AssetFilters) => void;
}

const statusOptions = [
  { value: "active", label: "فعال", color: "#22c55e" },
  { value: "maintenance", label: "در تعمیر", color: "#f59e0b" },
  { value: "inactive", label: "غیرفعال", color: "#6b7280" },
  { value: "failed", label: "خراب", color: "#ef4444" },
];

const criticalityOptions = [
  { value: "critical", label: "بحرانی", color: "#ef4444" },
  { value: "high", label: "بالا", color: "#f59e0b" },
  { value: "medium", label: "متوسط", color: "#3b82f6" },
  { value: "low", label: "پایین", color: "#22c55e" },
];

export function AssetFilterPanel({ isOpen, onClose, filters, onChange }: Props) {
  if (!isOpen) return null;

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const activeCount = filters.types.length + filters.statuses.length +
    filters.criticalities.length + (filters.search ? 1 : 0) +
    (filters.minHealth > 0 ? 1 : 0) + (filters.maxHealth < 100 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-amber-600 dark:text-amber-500">فیلترها</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{activeCount} فیلتر فعال</p>
          </div>
          <div className="flex gap-1">
            {activeCount > 0 && (
              <button
                onClick={() => onChange(defaultFilters)}
                className="text-[10px] text-red-500 hover:bg-red-500/10 px-2 py-1 rounded flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                پاک کردن
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-5">

          {/* Type Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">نوع تجهیز</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(assetTypes).map(([key, info]) => {
                const isActive = filters.types.includes(key as AssetTypeKey);
                return (
                  <button
                    key={key}
                    onClick={() => onChange({ ...filters, types: toggleArrayItem(filters.types, key as AssetTypeKey) })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold'
                        : 'border-gray-200 dark:border-[#1a1a1a] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{info.icon}</span>
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">وضعیت</label>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map(opt => {
                const isActive = filters.statuses.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...filters, statuses: toggleArrayItem(filters.statuses, opt.value) })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'font-bold'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    style={{
                      borderColor: isActive ? opt.color : undefined,
                      backgroundColor: isActive ? opt.color + '18' : undefined,
                      color: isActive ? opt.color : undefined,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Criticality Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">بحرانیت</label>
            <div className="flex flex-wrap gap-1.5">
              {criticalityOptions.map(opt => {
                const isActive = filters.criticalities.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...filters, criticalities: toggleArrayItem(filters.criticalities, opt.value) })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-bold`}
                    style={{
                      borderColor: isActive ? opt.color : "transparent",
                      backgroundColor: isActive ? opt.color + '18' : opt.color + '08',
                      color: opt.color,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Score Range */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">
              محدوده سلامت: {filters.minHealth}% - {filters.maxHealth}%
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minHealth}
                onChange={e => onChange({ ...filters, minHealth: Number(e.target.value) })}
                className="flex-1 accent-amber-500"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.maxHealth}
                onChange={e => onChange({ ...filters, maxHealth: Number(e.target.value) })}
                className="flex-1 accent-amber-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>۰٪</span>
              <span>۵۰٪</span>
              <span>۱۰۰٪</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
          <button onClick={() => onChange(defaultFilters)} className="btn-secondary flex-1">
            <RotateCcw className="w-3.5 h-3.5" />
            پاک کردن همه
          </button>
          <button onClick={onClose} className="btn-primary flex-1 justify-center">
            اعمال فیلتر
          </button>
        </div>
      </div>
    </div>
  );
}
