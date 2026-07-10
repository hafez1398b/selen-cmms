"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Trash2, Plus, Copy, Move, Eye, QrCode, Link as LinkIcon } from "lucide-react";
import type { AssetNode } from "@/lib/assets-data";

interface Props {
  asset: AssetNode;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onDuplicate: () => void;
  onMove: () => void;
  onView: () => void;
}

export function AssetActions({ asset, onEdit, onDelete, onAddChild, onDuplicate, onMove, onView }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { icon: Eye, label: "مشاهده جزئیات", action: onView, color: "text-blue-500" },
    { icon: Edit2, label: "ویرایش", action: onEdit, color: "text-amber-500" },
    { icon: Plus, label: "افزودن زیرمجموعه", action: onAddChild, color: "text-green-500" },
    { icon: Copy, label: "کپی", action: onDuplicate, color: "text-purple-500" },
    { icon: Move, label: "انتقال", action: onMove, color: "text-cyan-500" },
    { icon: QrCode, label: "چاپ QR", action: () => {}, color: "text-pink-500" },
    { icon: LinkIcon, label: "کپی لینک", action: () => navigator.clipboard.writeText(`${window.location.origin}?asset=${asset.id}`), color: "text-gray-500" },
    { icon: Trash2, label: "حذف", action: onDelete, color: "text-red-500", danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500 opacity-60 hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-xl shadow-2xl z-50 py-1 animate-fade-in-down">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); item.action(); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors ${item.danger ? 'text-red-500 border-t border-gray-200 dark:border-[#1a1a1a] mt-1' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.danger ? 'text-red-500' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
