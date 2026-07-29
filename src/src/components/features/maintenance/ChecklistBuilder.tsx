"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/maintenance-data";
import { Plus, Trash2, GripVertical, Check, Hash, FileText, Camera, Edit2, Sparkles } from "lucide-react";

interface Props {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const itemTypeConfig = {
  checkbox: { icon: Check, label: "چک‌باکس", color: "#22c55e" },
  number: { icon: Hash, label: "عدد", color: "#3b82f6" },
  text: { icon: FileText, label: "متن", color: "#8b5cf6" },
  photo: { icon: Camera, label: "عکس", color: "#f59e0b" },
  signature: { icon: Edit2, label: "امضا", color: "#ef4444" },
};

export function ChecklistBuilder({ items, onChange }: Props) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const addItem = (type: ChecklistItem["type"]) => {
    const newItem: ChecklistItem = {
      id: String(Date.now()),
      title: "آیتم جدید",
      type,
      required: true,
      order: items.length + 1,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ChecklistItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => setDraggedIdx(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    onChange(newItems.map((item, i) => ({ ...item, order: i + 1 })));
    setDraggedIdx(null);
  };

  const loadTemplate = (template: "daily" | "monthly" | "annual") => {
    const templates: Record<string, ChecklistItem[]> = {
      daily: [
        { id: "1", title: "بازرسی چشمی", type: "checkbox", required: true, order: 1 },
        { id: "2", title: "اندازه‌گیری دما", type: "number", required: true, unit: "°C", order: 2 },
        { id: "3", title: "بررسی صدا", type: "checkbox", required: true, order: 3 },
      ],
      monthly: [
        { id: "1", title: "خاموش کردن و LOTO", type: "checkbox", required: true, order: 1 },
        { id: "2", title: "تعویض روغن", type: "checkbox", required: true, order: 2 },
        { id: "3", title: "تمیزکاری فیلترها", type: "checkbox", required: true, order: 3 },
        { id: "4", title: "گریس‌کاری", type: "checkbox", required: true, order: 4 },
        { id: "5", title: "کالیبراسیون سنسورها", type: "checkbox", required: true, order: 5 },
        { id: "6", title: "امضای مسئول", type: "signature", required: true, order: 6 },
      ],
      annual: [
        { id: "1", title: "Overhaul کامل", type: "checkbox", required: true, order: 1 },
        { id: "2", title: "تست عملکرد", type: "text", required: true, order: 2 },
        { id: "3", title: "گزارش نهایی", type: "text", required: true, order: 3 },
        { id: "4", title: "عکس‌برداری", type: "photo", required: true, order: 4 },
        { id: "5", title: "امضاها", type: "signature", required: true, order: 5 },
      ],
    };
    onChange(templates[template]);
  };

  return (
    <div className="space-y-3">
      {/* Templates */}
      <div className="chart-card !p-3 bg-purple-500/5 border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold">قالب‌های آماده AI</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => loadTemplate("daily")} className="text-[10px] px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
            روزانه (۳ آیتم)
          </button>
          <button onClick={() => loadTemplate("monthly")} className="text-[10px] px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
            ماهانه (۶ آیتم)
          </button>
          <button onClick={() => loadTemplate("annual")} className="text-[10px] px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
            سالانه Overhaul (۵ آیتم)
          </button>
        </div>
      </div>

      {/* Add Item Types */}
      <div className="chart-card !p-3">
        <p className="text-xs font-bold mb-2">افزودن آیتم جدید:</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(itemTypeConfig) as [ChecklistItem["type"], typeof itemTypeConfig[ChecklistItem["type"]]][]).map(([type, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => addItem(type)}
                className="text-[10px] px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 hover:border-amber-500"
                style={{ borderColor: cfg.color + '30', color: cfg.color }}
              >
                <Plus className="w-3 h-3" />
                <Icon className="w-3 h-3" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="chart-card !p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold">آیتم‌های چک‌لیست ({items.length})</span>
          {items.length > 0 && (
            <button onClick={() => onChange([])} className="text-[10px] text-red-500 hover:underline">پاک کردن همه</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            هنوز آیتمی اضافه نشده. یک قالب انتخاب کنید یا آیتم دستی بسازید.
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, i) => {
              const cfg = itemTypeConfig[item.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(i)}
                  className={`p-2 rounded-lg border border-gray-200 dark:border-[#1a1a1a] flex items-center gap-2 group hover:border-amber-500 transition-all ${draggedIdx === i ? 'opacity-50' : ''}`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
                  <span className="text-[10px] font-mono text-gray-400 w-6">#{i + 1}</span>
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.color + '20' }}
                  >
                    <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => updateItem(i, { title: e.target.value })}
                    className="flex-1 bg-transparent text-xs focus:outline-none"
                  />
                  {item.type === "number" && (
                    <input
                      type="text"
                      placeholder="واحد"
                      value={item.unit || ""}
                      onChange={e => updateItem(i, { unit: e.target.value })}
                      className="w-16 text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1a1a1a] text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                      dir="ltr"
                    />
                  )}
                  <label className="flex items-center gap-1 text-[10px] flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={e => updateItem(i, { required: e.target.checked })}
                      className="w-3 h-3 accent-amber-500"
                    />
                    <span className="text-gray-500">الزامی</span>
                  </label>
                  <button
                    onClick={() => removeItem(i)}
                    className="p-1 rounded hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
