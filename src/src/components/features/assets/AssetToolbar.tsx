"use client";

import { useState } from "react";
import {
  Plus, Search, X, ChevronDown, ChevronsDown, ChevronsUp,
  Download, Upload, LayoutList, LayoutGrid, Network,
  ZoomIn, ZoomOut, RotateCcw, Filter as FilterIcon, Sparkles
} from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddRoot: () => void;
  viewMode: "tree" | "list" | "cards";
  onViewModeChange: (v: "tree" | "list" | "cards") => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  onSmartImport: () => void;
}

export function AssetToolbar({
  search, onSearchChange, onExpandAll, onCollapseAll, onAddRoot,
  viewMode, onViewModeChange, zoom, onZoomChange, onOpenFilters,
  activeFilterCount, onSmartImport,
}: Props) {
  const zoomLevels = [75, 90, 100, 115, 130];
  const currentZoomIdx = zoomLevels.indexOf(zoom);

  const zoomIn = () => {
    if (currentZoomIdx < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentZoomIdx + 1]);
    }
  };
  const zoomOut = () => {
    if (currentZoomIdx > 0) {
      onZoomChange(zoomLevels[currentZoomIdx - 1]);
    }
  };
  const zoomReset = () => onZoomChange(100);

  return (
    <div className="chart-card !p-3">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="جستجو در تجهیزات..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="input-field pr-10 pl-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={onOpenFilters}
          className="btn-secondary relative"
        >
          <FilterIcon className="w-3.5 h-3.5" />
          فیلترها
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-[#0a0a0a] text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Expand/Collapse */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={onExpandAll}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-[#222] transition-colors"
            title="باز کردن همه"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCollapseAll}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-[#222] transition-colors"
            title="بستن همه"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("tree")}
            className={`p-1.5 rounded transition-colors ${viewMode === "tree" ? 'bg-white dark:bg-[#222] text-amber-500' : 'text-gray-500'}`}
            title="نمای درختی"
          >
            <Network className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? 'bg-white dark:bg-[#222] text-amber-500' : 'text-gray-500'}`}
            title="نمای لیستی"
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("cards")}
            className={`p-1.5 rounded transition-colors ${viewMode === "cards" ? 'bg-white dark:bg-[#222] text-amber-500' : 'text-gray-500'}`}
            title="نمای کارتی"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom */}
        {viewMode === "tree" && (
          <div className="hidden md:flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1 items-center">
            <button onClick={zoomOut} className="p-1.5 rounded hover:bg-white dark:hover:bg-[#222]" title="کوچک">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={zoomReset} className="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-[#222] text-[10px] font-mono">
              {zoom}%
            </button>
            <button onClick={zoomIn} className="p-1.5 rounded hover:bg-white dark:hover:bg-[#222]" title="بزرگ">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mr-auto">
          <button onClick={onSmartImport} className="btn-secondary text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Import هوشمند</span>
            <span className="md:hidden">Import</span>
          </button>
          <button onClick={onAddRoot} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">افزودن تجهیز</span>
            <span className="md:hidden">افزودن</span>
          </button>
        </div>
      </div>
    </div>
  );
}
