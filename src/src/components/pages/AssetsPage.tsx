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
import { QuickEditModal } from "@/components/features/assets/QuickEditModal";
import { useToast } from "@/components/ui/Toast";
import { useAppState } from "@/context/AppStateContext";
import {
  assetTypes, countAssetsByType, countByCategory, getAssetsByCategory,
  assetCategories, type AssetNode, type CategoryKey, getAssetById,
  isStructural, countRealEquipment, getAllRealEquipment
} from "@/lib/assets-data";
import { List, Network, LayoutGrid, ChevronLeft, Filter, Package } from "lucide-react";

type ViewMode = "tree" | "list" | "categories";

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

  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [zoom, setZoom] = useState(100);
  const [filterOpen, setFilterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formParentId, setFormParentId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<Partial<AssetNode> | undefined>(undefined);
  const [workspaceAssetId, setWorkspaceAssetId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [quickEditAsset, setQuickEditAsset] = useState<AssetNode | null>(null);

  // Apply filter from dashboard navigation
  const { selectedItem: navFilter } = useAppState();
  useMemo(() => {
    if (navFilter?.filterCriticality) {
      setFilters({ ...filters, criticalities: [navFilter.filterCriticality] });
    }
  }, [navFilter]);

  const categoryCounts = useMemo(() => countByCategory(), []);

  // Workspace view - Only for real equipment (not structural nodes)
  if (workspaceAssetId !== null) {
    const asset = getAssetById(workspaceAssetId);
    if (asset && !isStructural(asset.typeKey)) {
      return (
        <AssetWorkspace
          asset={asset}
          onBack={() => setWorkspaceAssetId(null)}
          onNavigate={(id) => {
            const target = getAssetById(id);
            if (target && !isStructural(target.typeKey)) setWorkspaceAssetId(id);
            else setWorkspaceAssetId(null);
          }}
          onEdit={() => setQuickEditAsset(asset)}
        />
      );
    }
    // Structural node: just clear
    if (asset && isStructural(asset.typeKey)) {
      setTimeout(() => setWorkspaceAssetId(null), 0);
    }
  }

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
    // Use QuickEditModal for inline editing (works for ALL node types including structural)
    const asset = flatTree.find(a => a.id === id);
    if (asset) setQuickEditAsset(asset);
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
    addAsset({ ...asset, name: asset.name + " (کپی)", code: asset.code + "-COPY" });
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

  const handleExport = () => toast.info("خروجی", `${selectedIds.size} تجهیز در حال آماده‌سازی...`);
  const handleBulkMove = () => toast.info("انتقال گروهی", "این قابلیت در فاز بعدی فعال می‌شود");

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">

      {/* Stats - Only Real Equipment (not structural nodes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کل تجهیزات</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{countRealEquipment()}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">فعال</p>
          <p className="text-xl md:text-2xl font-black text-green-500">{getAllRealEquipment().filter(a => a.status === "active").length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">در تعمیر</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{getAllRealEquipment().filter(a => a.status === "maintenance").length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">بحرانی</p>
          <p className="text-xl md:text-2xl font-black text-red-500">{getAllRealEquipment().filter(a => a.criticality === "critical").length}</p>
        </div>
        <div className="kpi-card !p-3 text-center hidden lg:block">
          <p className="text-[10px] text-gray-500 mb-1">دسته‌بندی</p>
          <p className="text-xl md:text-2xl font-black text-blue-500">۹</p>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="chart-card !p-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {[
          { id: "categories" as const, label: "دسته‌بندی", icon: LayoutGrid },
          { id: "tree" as const, label: "نمای درختی", icon: Network },
          { id: "list" as const, label: "نمای لیستی", icon: List },
        ].map(v => {
          const Icon = v.icon;
          const isActive = viewMode === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                isActive ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <AssetToolbar
        search={filters.search}
        onSearchChange={(s) => setFilters({ ...filters, search: s })}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onAddRoot={() => handleAdd(null)}
        viewMode={viewMode === "categories" ? "cards" : viewMode}
        onViewModeChange={(v) => setViewMode(v === "cards" ? "categories" : v as ViewMode)}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenFilters={() => setFilterOpen(true)}
        activeFilterCount={activeFilterCount}
        onSmartImport={() => setImportOpen(true)}
      />

      {/* ═══════════════════════════════════════════════════════════════
          نمای دسته‌بندی (Categories View)
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "categories" && !selectedCategory && (
        <div className="space-y-3">
          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {(Object.entries(assetCategories) as [CategoryKey, typeof assetCategories[CategoryKey]][]).map(([key, cat]) => {
              const count = categoryCounts[key] || 0;
              const assets = getAssetsByCategory(key);
              const activeCount = assets.filter(a => a.status === "active").length;
              const criticalCount = assets.filter(a => a.criticality === "critical").length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className="chart-card !p-4 card-hover text-right group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      {cat.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-black" style={{ color: cat.color }}>{count}</p>
                      <p className="text-[9px] text-gray-500">تجهیز</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: cat.color }}>{cat.label}</h3>
                  <p className="text-[10px] text-gray-500 mb-3 min-h-[28px]">{cat.description}</p>
                  <div className="flex items-center gap-2 text-[10px] pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{activeCount} فعال</span>
                    {criticalCount > 0 && (
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{criticalCount} بحرانی</span>
                    )}
                    <ChevronLeft className="w-3 h-3 text-gray-400 mr-auto group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Detail View */}
      {viewMode === "categories" && selectedCategory && (
        <div className="space-y-3">
          {/* Back header */}
          <div className="chart-card !p-3 flex items-center justify-between">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-amber-500"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              بازگشت به دسته‌بندی‌ها
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{assetCategories[selectedCategory].icon}</span>
              <div>
                <h3 className="font-bold text-sm" style={{ color: assetCategories[selectedCategory].color }}>
                  {assetCategories[selectedCategory].label}
                </h3>
                <p className="text-[10px] text-gray-500">{categoryCounts[selectedCategory] || 0} تجهیز</p>
              </div>
            </div>
          </div>

          {/* Assets in category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getAssetsByCategory(selectedCategory).filter(a => a.typeKey === "equipment").map(asset => (
              <button
                key={asset.id}
                onClick={() => setWorkspaceAssetId(asset.id)}
                className="chart-card !p-4 card-hover text-right"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{assetTypes[asset.typeKey].icon}</span>
                  <span className={`badge ${asset.status === 'active' ? 'badge-active' : asset.status === 'maintenance' ? 'badge-maintenance' : 'badge-failed'}`}>
                    {asset.status === 'active' ? 'فعال' : asset.status === 'maintenance' ? 'در تعمیر' : 'خراب'}
                  </span>
                </div>
                <p className="font-bold text-sm truncate">{asset.name}</p>
                <p className="text-[10px] font-mono text-gray-500 mt-0.5" dir="ltr">{asset.code}</p>
                {asset.manufacturer && (
                  <p className="text-[10px] text-gray-500 mt-1">{asset.manufacturer} {asset.model && `• ${asset.model}`}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: `${asset.healthScore}%`, backgroundColor: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }}>
                    {asset.healthScore}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          نمای درختی (Tree View)
          ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "tree" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="hidden lg:block lg:col-span-1 space-y-3">
            <AssetMiniMap tree={tree} onNavigate={expandToNode} focusedId={focusedId} />
          </div>
          <div className="lg:col-span-3">
            <div className="chart-card !p-2 md:!p-3 overflow-x-auto">
              <AssetTree
                flatTree={flatTree}
                selectedIds={selectedIds}
                focusedId={focusedId}
                searchTerm={filters.search}
                zoom={zoom}
                onToggleExpand={toggleExpand}
                onSelect={toggleSelect}
                onNodeClick={(id) => {
                  const node = getAssetById(id);
                  setFocusedId(id);
                  if (node && !isStructural(node.typeKey)) {
                    // Real equipment/subsystem/part - open Workspace
                    setWorkspaceAssetId(id);
                  } else if (node) {
                    // Structural node - just toggle expand
                    toggleExpand(id);
                  }
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={(pid) => handleAdd(pid)}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
                onView={(id) => {
                  const node = getAssetById(id);
                  if (node && !isStructural(node.typeKey)) setWorkspaceAssetId(id);
                  else if (node) setQuickEditAsset(node);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          نمای لیستی (List View)
          ═══════════════════════════════════════════════════════════════ */}
            {viewMode === "list" && (
              <div className="chart-card !p-0 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#0a0a0a]">
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">کد</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">نام تجهیز</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">دسته</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">سازنده</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">مدل</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">سال</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">سلامت</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">وضعیت</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">بحرانیت</th>
                </tr>
              </thead>
              <tbody>
                {getAllRealEquipment().map(asset => (
                  <tr
                    key={asset.id}
                    onClick={() => setWorkspaceAssetId(asset.id)}
                    className="border-b border-gray-100 dark:border-[#0a0a0a] table-row-hover cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-xs text-amber-500" dir="ltr">{asset.code}</td>
                    <td className="py-3 px-3 font-bold">{asset.name}</td>
                    <td className="py-3 px-3">
                      {asset.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit" style={{
                          backgroundColor: assetCategories[asset.category].color + '20',
                          color: assetCategories[asset.category].color
                        }}>
                          <span>{assetCategories[asset.category].icon}</span>
                          {assetCategories[asset.category].label}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600 dark:text-gray-400">{asset.manufacturer || "-"}</td>
                    <td className="py-3 px-3 text-xs font-mono text-gray-600 dark:text-gray-400" dir="ltr">{asset.model || "-"}</td>
                    <td className="py-3 px-3 text-center text-xs text-gray-500">{asset.yearManufactured || "-"}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="progress-bar w-16">
                          <div className="progress-fill" style={{ width: `${asset.healthScore}%`, backgroundColor: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="text-xs w-8 text-left" style={{ color: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }}>{asset.healthScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge ${asset.status === 'active' ? 'badge-active' : asset.status === 'maintenance' ? 'badge-maintenance' : 'badge-failed'}`}>
                        {asset.status === 'active' ? 'فعال' : asset.status === 'maintenance' ? 'در تعمیر' : asset.status === 'failed' ? 'خراب' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge ${asset.criticality === 'critical' ? 'badge-critical' : asset.criticality === 'high' ? 'badge-high' : asset.criticality === 'medium' ? 'badge-medium' : 'badge-low'}`}>
                        {asset.criticality === 'critical' ? 'بحرانی' : asset.criticality === 'high' ? 'بالا' : asset.criticality === 'medium' ? 'متوسط' : 'پایین'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Only Equipment */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-[#0a0a0a]">
            {getAllRealEquipment().map(asset => (
              <button
                key={asset.id}
                onClick={() => setWorkspaceAssetId(asset.id)}
                className="w-full text-right p-3 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-amber-500" dir="ltr">{asset.code}</p>
                    <p className="font-bold text-sm truncate">{asset.name}</p>
                  </div>
                  <span className={`badge ${asset.status === 'active' ? 'badge-active' : asset.status === 'maintenance' ? 'badge-maintenance' : 'badge-failed'} flex-shrink-0`}>
                    {asset.status === 'active' ? 'فعال' : asset.status === 'maintenance' ? 'در تعمیر' : 'خراب'}
                  </span>
                </div>
                {asset.category && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{
                    backgroundColor: assetCategories[asset.category].color + '20',
                    color: assetCategories[asset.category].color
                  }}>
                    <span>{assetCategories[asset.category].icon}</span>
                    {assetCategories[asset.category].label}
                  </span>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: `${asset.healthScore}%`, backgroundColor: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="text-xs" style={{ color: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }}>{asset.healthScore}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <AssetBulkBar selectedCount={selectedIds.size} onClear={clearSelection} onDelete={handleBulkDelete} onMove={handleBulkMove} onExport={handleExport} />
      <AssetFilterPanel isOpen={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onChange={setFilters} />
      <AssetImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
      <AssetFormAdvanced isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initialData={formInitial} parentId={formParentId} mode={formMode} />

      {/* Quick Inline Edit Modal - works for ALL node types */}
      <QuickEditModal
        isOpen={!!quickEditAsset}
        onClose={() => setQuickEditAsset(null)}
        asset={quickEditAsset}
        onSave={(id, updates) => updateAsset(id, updates)}
        onDelete={(id) => deleteAsset(id)}
      />
    </div>
  );
}
