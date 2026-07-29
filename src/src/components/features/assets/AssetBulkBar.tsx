"use client";

import { X, Trash2, Move, Download, Copy } from "lucide-react";

interface Props {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onExport: () => void;
}

export function AssetBulkBar({ selectedCount, onClear, onDelete, onMove, onExport }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
      <div className="bg-white dark:bg-[#111] border border-amber-500/40 shadow-2xl rounded-full flex items-center gap-2 p-2 pr-4">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-[#0a0a0a] font-bold flex items-center justify-center text-xs">
          {selectedCount}
        </div>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          مورد انتخاب شد
        </span>
        <div className="h-6 w-px bg-gray-200 dark:bg-[#1a1a1a]" />
        <button
          onClick={onMove}
          className="p-2 rounded-full hover:bg-blue-500/10 text-blue-500 transition-colors"
          title="انتقال"
        >
          <Move className="w-4 h-4" />
        </button>
        <button
          onClick={onExport}
          className="p-2 rounded-full hover:bg-green-500/10 text-green-500 transition-colors"
          title="خروجی"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-gray-200 dark:bg-[#1a1a1a]" />
        <button
          onClick={onClear}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
