"use client";

import { getAssetSpareParts } from "@/lib/asset-workspace-data";
import { Package, AlertCircle, CheckCircle2, XCircle, Plus, ShoppingCart } from "lucide-react";

interface Props {
  assetId: number;
}

export function PartsTab({ assetId }: Props) {
  const parts = getAssetSpareParts(assetId);

  const stats = {
    total: parts.length,
    inStock: parts.filter(p => p.stockStatus === "in_stock").length,
    lowStock: parts.filter(p => p.stockStatus === "low_stock").length,
    outOfStock: parts.filter(p => p.stockStatus === "out_of_stock").length,
  };

  const statusConfig = {
    in_stock: { label: "موجود", color: "#22c55e", icon: CheckCircle2 },
    low_stock: { label: "کم موجود", color: "#f59e0b", icon: AlertCircle },
    out_of_stock: { label: "ناموجود", color: "#ef4444", icon: XCircle },
  };

  const criticalityColor = {
    critical: "#ef4444",
    high: "#f59e0b",
    medium: "#3b82f6",
    low: "#22c55e",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کل قطعات مرتبط</p>
          <p className="text-xl font-black text-amber-500">{stats.total}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">موجود</p>
          <p className="text-xl font-black text-green-500">{stats.inStock}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">کم موجود</p>
          <p className="text-xl font-black text-amber-500">{stats.lowStock}</p>
        </div>
        <div className="kpi-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">ناموجود</p>
          <p className="text-xl font-black text-red-500">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="chart-card !p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">قطعات یدکی این تجهیز</span>
        </div>
        <button className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          افزودن قطعه
        </button>
      </div>

      {/* Parts List - Desktop Table */}
      <div className="hidden md:block chart-card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
              <th className="text-right py-3 px-4 text-gray-500 font-medium">کد</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">نام قطعه</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">دسته</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">تعداد</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">بحرانیت</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">وضعیت</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">آخرین تعویض</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">تأمین‌کننده</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(part => {
              const statusCfg = statusConfig[part.stockStatus];
              const StatusIcon = statusCfg.icon;
              return (
                <tr key={part.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400" dir="ltr">{part.partCode}</td>
                  <td className="py-3 px-4 font-medium">{part.partName}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">{part.category}</td>
                  <td className="py-3 px-4 text-center font-bold">{part.quantity}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      color: criticalityColor[part.criticality],
                      backgroundColor: criticalityColor[part.criticality] + '20'
                    }}>
                      {part.criticality === 'critical' ? 'بحرانی' : part.criticality === 'high' ? 'بالا' : part.criticality === 'medium' ? 'متوسط' : 'پایین'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: statusCfg.color + '18', color: statusCfg.color }}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">{part.lastReplaced || "-"}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">{part.supplier}</td>
                  <td className="py-3 px-4 text-center">
                    {part.stockStatus === "out_of_stock" && (
                      <button className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center gap-1 mx-auto">
                        <ShoppingCart className="w-3 h-3" />
                        سفارش
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Parts List - Mobile Cards */}
      <div className="md:hidden space-y-2">
        {parts.map(part => {
          const statusCfg = statusConfig[part.stockStatus];
          const StatusIcon = statusCfg.icon;
          return (
            <div key={part.id} className="chart-card !p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-mono text-gray-500" dir="ltr">{part.partCode}</span>
                    <span className="text-[9px] text-gray-500">• {part.category}</span>
                  </div>
                  <p className="text-sm font-bold">{part.partName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{part.supplier}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: statusCfg.color + '18', color: statusCfg.color }}>
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
                <span className="text-gray-500">تعداد: <strong className="text-white">{part.quantity}</strong></span>
                {part.lastReplaced && <span className="text-gray-500">آخرین تعویض: {part.lastReplaced}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
