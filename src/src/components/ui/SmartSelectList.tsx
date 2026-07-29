"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, CheckCircle2, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface SmartListOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  isCustom?: boolean; // اضافه شده توسط کاربر
}

interface Props {
  options: SmartListOption[];                       // گزینه‌های اولیه
  value?: string;                                   // مقدار انتخاب شده
  onChange: (value: string, label: string) => void; // callback
  storageKey?: string;                              // کلید localStorage برای ذخیره موارد کاربر
  placeholder?: string;                             // متن جستجو
  allowMultiple?: boolean;                          // چند انتخابی
  columns?: 1 | 2 | 3;
  addLabel?: string;                                // متن دکمه افزودن
  showSearch?: boolean;                             // نمایش جستجو
  customItemsEditable?: boolean;                    // امکان ویرایش موارد سفارشی
}

export function SmartSelectList({
  options,
  value,
  onChange,
  storageKey,
  placeholder = "جستجو...",
  columns = 1,
  addLabel = "افزودن مورد جدید",
  showSearch = true,
  customItemsEditable = true,
}: Props) {
  const toast = useToast();
  const [customItems, setCustomItems] = useState<SmartListOption[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [search, setSearch] = useState("");

  // Load custom items from localStorage
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(`smartlist:${storageKey}`);
      if (stored) setCustomItems(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [storageKey]);

  // Save to localStorage
  const persist = (items: SmartListOption[]) => {
    setCustomItems(items);
    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.setItem(`smartlist:${storageKey}`, JSON.stringify(items));
      } catch { /* ignore */ }
    }
  };

  const handleAddNew = () => {
    if (!newLabel.trim()) {
      toast.warning("خالی", "لطفاً عنوان را وارد کنید");
      return;
    }
    const newValue = `custom_${Date.now()}`;
    const newItem: SmartListOption = {
      value: newValue,
      label: newLabel.trim(),
      description: newDescription.trim() || undefined,
      isCustom: true,
    };
    const updated = [...customItems, newItem];
    persist(updated);
    onChange(newValue, newItem.label);
    setNewLabel("");
    setNewDescription("");
    setShowAddForm(false);
    toast.success("افزوده شد", `«${newItem.label}» به لیست اضافه و انتخاب شد`);
  };

  const handleEdit = (item: SmartListOption) => {
    setEditingValue(item.value);
    setEditLabel(item.label);
    setEditDescription(item.description || "");
  };

  const handleSaveEdit = () => {
    if (!editLabel.trim() || !editingValue) return;
    const updated = customItems.map(i =>
      i.value === editingValue
        ? { ...i, label: editLabel.trim(), description: editDescription.trim() || undefined }
        : i
    );
    persist(updated);
    setEditingValue(null);
    toast.success("ویرایش شد", "تغییرات ذخیره شد");
  };

  const handleDelete = (item: SmartListOption) => {
    if (!confirm(`آیا از حذف «${item.label}» اطمینان دارید؟`)) return;
    const updated = customItems.filter(i => i.value !== item.value);
    persist(updated);
    // If deleted item was selected, clear
    if (value === item.value) onChange("", "");
    toast.success("حذف شد", `«${item.label}» حذف شد`);
  };

  const allOptions = [...options, ...customItems];
  const filtered = search
    ? allOptions.filter(o => o.label.includes(search) || o.description?.includes(search))
    : allOptions;

  const gridCols = columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "";

  return (
    <div className="space-y-3">
      {/* Search */}
      {showSearch && allOptions.length > 5 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pr-10"
          />
        </div>
      )}

      {/* Options */}
      <div className={`grid grid-cols-1 ${gridCols} gap-2 max-h-[400px] overflow-y-auto`}>
        {filtered.map(opt => {
          const isSelected = value === opt.value;
          const isEditing = editingValue === opt.value;

          if (isEditing) {
            return (
              <div key={opt.value} className="p-3 rounded-xl border-2 border-amber-500 bg-amber-500/5 space-y-2">
                <input
                  type="text"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  placeholder="نام"
                  className="input-field !py-1.5 !text-xs"
                  autoFocus
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="توضیحات (اختیاری)"
                  className="input-field !py-1.5 !text-xs"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> ذخیره
                  </button>
                  <button
                    onClick={() => setEditingValue(null)}
                    className="flex-1 py-1.5 rounded-lg bg-gray-200 dark:bg-[#1a1a1a] text-xs"
                  >
                    <X className="inline w-3 h-3 mr-0.5" /> انصراف
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={opt.value}
              className={`p-3 rounded-xl border-2 transition-all group relative ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500/50'
              }`}
            >
              <button
                onClick={() => onChange(opt.value, opt.label)}
                className="w-full text-right"
              >
                <div className="flex items-start gap-2">
                  {opt.icon && <span className="text-lg flex-shrink-0">{opt.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <p className="font-bold text-sm truncate">{opt.label}</p>
                      {opt.isCustom && (
                        <span className="text-[8px] px-1 rounded-full bg-blue-500/20 text-blue-500 font-bold">
                          سفارشی
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-[10px] text-gray-500 truncate">{opt.description}</p>
                    )}
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                </div>
              </button>

              {/* Actions for custom items */}
              {opt.isCustom && customItemsEditable && (
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(opt); }}
                    className="p-1 rounded bg-amber-500/20 text-amber-500 hover:bg-amber-500/40"
                    title="ویرایش"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(opt); }}
                    className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/40"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showAddForm ? (
        <div className="p-3 rounded-xl border-2 border-amber-500 bg-amber-500/5 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">افزودن مورد جدید</span>
          </div>
          <input
            type="text"
            placeholder="عنوان (الزامی)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            className="input-field"
            autoFocus
            onKeyDown={e => e.key === "Enter" && handleAddNew()}
          />
          <input
            type="text"
            placeholder="توضیحات (اختیاری)"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            className="input-field"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddNew}
              className="btn-primary flex-1 justify-center !py-2 text-xs"
            >
              <Check className="w-4 h-4" />
              افزودن و انتخاب
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewLabel(""); setNewDescription(""); }}
              className="btn-secondary !py-2 text-xs"
            >
              انصراف
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 text-amber-500 font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      )}

      {customItems.length > 0 && (
        <p className="text-[10px] text-gray-500 text-center">
          💡 موارد سفارشی برای دفعات بعدی ذخیره می‌شوند
        </p>
      )}
    </div>
  );
}
