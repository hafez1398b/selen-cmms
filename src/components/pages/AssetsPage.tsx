"use client";

import { useState, useMemo } from "react";
import { useAssetTree } from "@/hooks/useAssetTree";
import { AssetTree } from "@/components/features/assets/AssetTree";
import { AssetToolbar } from "@/components/features/assets/AssetToolbar";
import { AssetFilterPanel } from "@/components/features/assets/AssetFilterPanel";
import { AssetBreadcrumb } from "@/components/features/assets/AssetBreadcrumb";
import { AssetMiniMap } from "@/components/features/assets/AssetMiniMap";
import { AssetBulkBar } from "@/components/features/assets/AssetBulkBar";
import { AssetFormAdvanced } from "@/components/features/assets/AssetFormAdvanced";
import { AssetImportModal } from "@/components/features/assets/AssetImportModal";
import { AssetWorkspace } from "@/components/features/assets/AssetWorkspace";
import { useToast } from "@/components/ui/Toast";
import { assetTypes, countAssetsByType, type AssetNode, getAssetById } from "@/lib/assets-data";

export function AssetsPage() {
  const toast = useToast();
  const {
    tree, flatTree, filters, setFilters,
    toggleExpand, expandAll, collapseAll, expandToNode,
    selectedIds, toggleSelect, clearSelection,
    focusedId, setFocusedId,
    moveAsset, deleteAsset, bulkDelete, addAsset, updateAsset,
    stats,
  } = useAssetTree();

  const [viewMode, setViewMode] = useState<"tree" | "list" | "cards">("tree");
  const [zoom, setZoom] = useState(100);
  const [filterOpen, setFilterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formParentId, setFormParentId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<Partial<AssetNode> | undefined>(undefined);
  const [workspaceAssetId, setWorkspaceAssetId] = useState<number | null>(null);

  // If workspace is open, render workspace
  if (workspaceAssetId !== null) {
    const asset = getAssetById(workspaceAssetId);
    if (asset) {
      return (
        <AssetWorkspace
          asset={asset}
          onBack={() => setWorkspaceAssetId(null)}
          onNavigate={(id) => setWorkspaceAssetId(id)}
          onEdit={() => {
            setFormMode("edit");
            setFormInitial(asset);
            setFormParentId(asset.parentId);
            setFormOpen(true);
          }}
        />
      );
    }
  }

  const typeCounts = useMemo(() => countAssetsByType(), []);

  const activeFilterCount =
    filters.types.length + filters.statuses.length + filters.criticalities.length +
    (filters.search ? 1 : 0) +
    (filters.minHealth > 0 ? 1 : 0) + (filters.maxHealth < 100 ? 1 : 0);

  const handleAdd = (parentId: number | null) => {
    setFormMode("add");
    setFormParentId(parentId);
    setFormInitial(undefined);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const asset = flatTree.find(a => a.id === id);
    setFormMode("edit");
    setFormInitial(asset);
    setFormParentId(asset?.parentId ?? null);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    const asset = flatTree.find(a => a.id === id);
    if (confirm(`آیا از حذف "${asset?.name}" و تمام زیرمجموعه‌ها اطمینان دارید؟`)) {
      deleteAsset(id);
      toast.success("حذف شد", `${asset?.name} و زیرمجموعه‌های آن حذف شد`);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`آیا از حذف ${selectedIds.size} تجهیز اطمینان دارید؟`)) {
      const count = selectedIds.size;
      bulkDelete();
      toast.success("حذف گروهی", `${count} تجهیز حذف شد`);
    }
  };

  const handleDuplicate = (id: number) => {
    const asset = flatTree.find(a => a.id === id);
    if (!asset) return;
    addAsset({
      ...asset,
      name: asset.name + " (کپی)",
      code: asset.code + "-COPY",
    });
    toast.success("کپی شد", `از ${asset.name} کپی تهیه شد`);
  };

  const handleSave = (data: Omit<AssetNode, "id" | "path" | "level">) => {
    if (formMode === "add") {
      addAsset(data);
      toast.success("افزوده شد", `${data.name} به سامانه اضافه شد`);
    } else if (formInitial?.id) {
      updateAsset(formInitial.id, data);
      toast.success("ویرایش شد", `${data.name} به‌روز شد`);
    }
  };

  const handleMove = (id: number, newParentId: number | null): boolean => {
    const success = moveAsset(id, newParentId);
    if (success) {
      const asset = flatTree.find(a => a.id === id);
      const parent = newParentId ? flatTree.find(a => a.id === newParentId) : null;
      toast.success("انتقال موفق", `${asset?.name} به ${parent?.name || 'ریشه'} منتقل شد`);
    } else {
      toast.error("خطا", "نمی‌توان به زیرشاخه خود منتقل کرد");
    }
    return success;
  };

  const handleView = (id: number) => {
    setWorkspaceAssetId(id);
  };

  const handleExport = () => {
    toast.info("خروجی", `${selectedIds.size} تجهیز در حال آماده‌سازی برای دانلود...`);
  };

  const handleBulkMove = () => {
    toast.info("انتقال گروهی", "این قابلیت در فاز بعدی فعال می‌شود");
  };

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کل تجهیزات</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{stats.total}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">فعال</p>
          <p className="text-xl md:text-2xl font-black text-green-500">{stats.active}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">در تعمیر</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{stats.maintenance}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">بحرانی</p>
          <p className="text-xl md:text-2xl font-black text-red-500">{stats.critical}</p>
        </div>
        <div className="kpi-card !p-3 text-center hidden md:block">
          <p className="text-[10px] text-gray-500 mb-1">خطوط بسپار</p>
          <p className="text-xl md:text-2xl font-black text-blue-500">{typeCounts.bespar || 0}</p>
        </div>
        <div className="kpi-card !p-3 text-center hidden md:block">
          <p className="text-[10px] text-gray-500 mb-1">قطعات</p>
          <p className="text-xl md:text-2xl font-black text-purple-500">{typeCounts.part || 0}</p>
        </div>
      </div>

      {/* Toolbar */}
      <AssetToolbar
        search={filters.search}
        onSearchChange={(s) => setFilters({ ...filters, search: s })}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onAddRoot={() => handleAdd(null)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenFilters={() => setFilterOpen(true)}
        activeFilterCount={activeFilterCount}
        onSmartImport={() => setImportOpen(true)}
      />

      {/* Breadcrumb */}
      {focusedId && (
        <div className="chart-card !p-2 !px-3">
          <AssetBreadcrumb
            assetId={focusedId}
            onNavigate={(id) => {
              if (id === null) setFocusedId(null);
              else expandToNode(id);
            }}
          />
        </div>
      )}

      {/* Filter Result Indicator */}
      {activeFilterCount > 0 && (
        <div className="chart-card !p-3 bg-amber-500/5 border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-600 dark:text-amber-500 font-bold">
              {stats.matchingFilter} نتیجه از {stats.total} تجهیز مطابق فیلتر
            </span>
          </div>
          <button
            onClick={() => setFilters({ search: "", types: [], statuses: [], criticalities: [], minHealth: 0, maxHealth: 100 })}
            className="text-red-500 hover:underline"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}

      {/* Main Content: Tree + MiniMap */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        {/* MiniMap */}
        <div className="hidden lg:block lg:col-span-1 space-y-3">
          <AssetMiniMap
            tree={tree}
            onNavigate={expandToNode}
            focusedId={focusedId}
          />
          {/* Legend */}
          <div className="chart-card !p-3">
            <p className="text-xs font-bold mb-2">راهنما</p>
            <div className="space-y-1.5">
              {(Object.entries(assetTypes) as [keyof typeof assetTypes, typeof assetTypes[keyof typeof assetTypes]][]).slice(0, 5).map(([key, info]) => (
                <div key={key} className="flex items-center gap-2 text-[10px]">
                  <span>{info.icon}</span>
                  <span className="text-gray-600 dark:text-gray-400 flex-1">{info.label}</span>
                  <span className="text-gray-500 font-mono">{typeCounts[key] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tree */}
        <div className="lg:col-span-3">
          <div className="chart-card !p-2 md:!p-3 overflow-x-auto">
            {viewMode === "tree" && (
              <AssetTree
                flatTree={flatTree}
                selectedIds={selectedIds}
                focusedId={focusedId}
                searchTerm={filters.search}
                zoom={zoom}
                onToggleExpand={toggleExpand}
                onSelect={toggleSelect}
                onNodeClick={(id) => { setFocusedId(id); setWorkspaceAssetId(id); }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={(pid) => handleAdd(pid)}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
                onView={handleView}
              />
            )}

            {viewMode === "list" && (
              <div className="space-y-2">
                {flatTree.filter(n => n.typeKey === "equipment").map(node => (
                  <button
                    key={node.id}
                    onClick={() => setWorkspaceAssetId(node.id)}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#1a1a1a] flex items-center gap-3 hover:border-amber-500 transition-all text-right"
                  >
                    <span className="text-lg">{assetTypes[node.typeKey].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{node.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono" dir="ltr">{node.code}</p>
                    </div>
                    <div className="w-14 h-1.5 bg-gray-200 dark:bg-[#222] rounded-full flex-shrink-0">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${node.healthScore}%` }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-left">{node.healthScore}%</span>
                  </button>
                ))}
              </div>
            )}

            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {flatTree.filter(n => n.typeKey === "equipment").map(node => (
                  <button
                    key={node.id}
                    onClick={() => setWorkspaceAssetId(node.id)}
                    className="p-4 rounded-xl border border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500 transition-all text-right"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{assetTypes[node.typeKey].icon}</span>
                      <span className="text-[10px] font-mono text-gray-500" dir="ltr">{node.code}</span>
                    </div>
                    <p className="font-bold text-sm mb-1">{node.name}</p>
                    <p className="text-[10px] text-gray-500 mb-3">{node.manufacturer} • {node.model}</p>
                    <div className="flex items-center justify-between">
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-[#222] rounded-full">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${node.healthScore}%` }} />
                      </div>
                      <span className="text-xs font-bold text-amber-500">{node.healthScore}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AssetBulkBar
        selectedCount={selectedIds.size}
        onClear={clearSelection}
        onDelete={handleBulkDelete}
        onMove={handleBulkMove}
        onExport={handleExport}
      />

      {/* Filter Panel */}
      <AssetFilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
      />

      {/* Import Modal */}
      <AssetImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {/* Add/Edit Form */}
      <AssetFormAdvanced
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={formInitial}
        parentId={formParentId}
        mode={formMode}
      />

    </div>
  );
}
