"use client";

import { ChevronDown, ChevronLeft } from "lucide-react";
import { assetTypes, type AssetNode as AssetNodeType } from "@/lib/assets-data";
import type { AssetTreeNode } from "@/hooks/useAssetTree";
import { AssetActions } from "./AssetActions";

interface Props {
  node: AssetTreeNode;
  isSelected: boolean;
  isFocused: boolean;
  isDragOver: boolean;
  searchTerm: string;
  onToggleExpand: () => void;
  onSelect: () => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onDuplicate: () => void;
  onMove: () => void;
  onView: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-300 dark:bg-amber-500/50 text-black dark:text-white px-0.5 rounded">
        {p}
      </mark>
    ) : p
  );
}

function healthColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "فعال", color: "#22c55e", bg: "bg-green-500/10" },
    maintenance: { label: "تعمیر", color: "#f59e0b", bg: "bg-amber-500/10" },
    inactive: { label: "غیرفعال", color: "#6b7280", bg: "bg-gray-500/10" },
    failed: { label: "خراب", color: "#ef4444", bg: "bg-red-500/10" },
  };
  return map[status] || map.inactive;
}

export function AssetNode({
  node, isSelected, isFocused, isDragOver, searchTerm,
  onToggleExpand, onSelect, onClick, onEdit, onDelete, onAddChild,
  onDuplicate, onMove, onView,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
}: Props) {
  const typeInfo = assetTypes[node.typeKey];
  const hasChildren = node.children.length > 0;
  const status = statusBadge(node.status);
  const health = healthColor(node.healthScore);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-all
        ${isSelected ? 'bg-amber-500/10 border border-amber-500/40' : 'border border-transparent'}
        ${isFocused ? 'ring-2 ring-amber-500/50' : ''}
        ${isDragOver ? 'bg-green-500/10 border-green-500/50 border-dashed' : ''}
        ${node.matchesFilter && searchTerm ? 'bg-amber-500/5' : ''}
        hover:bg-gray-50 dark:hover:bg-[#111]
      `}
      style={{ paddingRight: `${node.depth * 24 + 8}px` }}
    >
      {/* Tree line indicator */}
      {node.depth > 0 && (
        <div
          className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-[#1a1a1a]"
          style={{ right: `${node.depth * 24 - 12}px` }}
        />
      )}

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => { e.stopPropagation(); onSelect(); }}
        onClick={(e) => e.stopPropagation()}
        className="w-3.5 h-3.5 accent-amber-500 flex-shrink-0 opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity"
      />

      {/* Expand button */}
      {hasChildren ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-[#222] flex-shrink-0 transition-transform"
        >
          {node.isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          )}
        </button>
      ) : (
        <div className="w-5 flex-shrink-0" />
      )}

      {/* Type badge with color */}
      <div
        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm"
        style={{ backgroundColor: typeInfo.color + '18' }}
      >
        {typeInfo.icon}
      </div>

      {/* Name & Code */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="min-w-0">
          <p className={`text-xs font-medium truncate ${node.matchesFilter && searchTerm ? 'text-amber-600 dark:text-amber-400' : ''}`}>
            {highlightText(node.name, searchTerm)}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-mono text-gray-500" dir="ltr">
              {highlightText(node.code, searchTerm)}
            </span>
            <span
              className="text-[9px] px-1 py-0 rounded"
              style={{ color: typeInfo.color, backgroundColor: typeInfo.color + '10' }}
            >
              {typeInfo.label}
            </span>
            {node.manufacturer && (
              <span className="text-[9px] text-gray-500 truncate hidden md:inline">
                • {node.manufacturer}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="hidden md:flex items-center gap-3 flex-shrink-0">
        {/* Health Bar */}
        <div className="flex items-center gap-1.5" title={`سلامت: ${node.healthScore}%`}>
          <div className="w-14 h-1.5 bg-gray-200 dark:bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${node.healthScore}%`, backgroundColor: health }}
            />
          </div>
          <span className="text-[10px] font-mono" style={{ color: health }}>
            {node.healthScore}
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${status.bg}`}
          style={{ color: status.color }}
        >
          {status.label}
        </span>

        {/* Children count */}
        {hasChildren && (
          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded-full">
            {node.children.length}
          </span>
        )}
      </div>

      {/* Mobile: Health color dot */}
      <div
        className="md:hidden w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: health }}
      />

      {/* Actions */}
      <div onClick={(e) => e.stopPropagation()}>
        <AssetActions
          asset={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onDuplicate={onDuplicate}
          onMove={onMove}
          onView={onView}
        />
      </div>
    </div>
  );
}
