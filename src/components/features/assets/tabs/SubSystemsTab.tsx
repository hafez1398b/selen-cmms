"use client";

import { getAssetChildren, getAssetDescendants, assetTypes, type AssetNode } from "@/lib/assets-data";
import { ChevronLeft, Layers, Plus } from "lucide-react";

interface Props {
  asset: AssetNode;
  onNavigate: (id: number) => void;
}

export function SubSystemsTab({ asset, onNavigate }: Props) {
  const children = getAssetChildren(asset.id);
  const descendants = getAssetDescendants(asset.id);

  const groupByType = children.reduce((acc, child) => {
    if (!acc[child.typeKey]) acc[child.typeKey] = [];
    acc[child.typeKey].push(child);
    return acc;
  }, {} as Record<string, AssetNode[]>);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">فرزندان مستقیم</p>
          <p className="text-xl font-black text-amber-500">{children.length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کل زیرمجموعه</p>
          <p className="text-xl font-black text-blue-500">{descendants.length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">فعال</p>
          <p className="text-xl font-black text-green-500">{descendants.filter(d => d.status === "active").length}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">در تعمیر</p>
          <p className="text-xl font-black text-amber-500">{descendants.filter(d => d.status === "maintenance").length}</p>
        </div>
      </div>

      {/* Add button */}
      <div className="chart-card !p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">زیرسیستم‌ها و قطعات</span>
        </div>
        <button className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          افزودن زیرمجموعه
        </button>
      </div>

      {/* Grouped by type */}
      {Object.entries(groupByType).length === 0 ? (
        <div className="chart-card text-center py-8">
          <p className="text-sm text-gray-500">این تجهیز زیرمجموعه‌ای ندارد</p>
        </div>
      ) : (
        Object.entries(groupByType).map(([typeKey, items]) => {
          const typeInfo = assetTypes[typeKey as keyof typeof assetTypes];
          return (
            <div key={typeKey} className="chart-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{typeInfo.icon}</span>
                <h3 className="font-bold text-sm">{typeInfo.label} ({items.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map(item => {
                  const itemChildren = getAssetChildren(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className="p-3 rounded-xl border border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500 hover:bg-amber-500/5 transition-all text-right group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-lg">{assetTypes[item.typeKey].icon}</span>
                        <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5" dir="ltr">{item.code}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="w-16 h-1 bg-gray-200 dark:bg-[#222] rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.healthScore}%`,
                              backgroundColor: item.healthScore >= 85 ? '#22c55e' : item.healthScore >= 70 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">{item.healthScore}%</span>
                        {itemChildren.length > 0 && (
                          <span className="text-[9px] bg-gray-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded-full">
                            {itemChildren.length}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
