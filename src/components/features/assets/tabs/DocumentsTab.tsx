"use client";

import { useState } from "react";
import { getAssetDocuments } from "@/lib/asset-workspace-data";
import { FileText, Image as ImageIcon, Award, Wrench, FileCheck, ShieldCheck, Upload, Download, Eye, Trash2, Filter } from "lucide-react";

interface Props {
  assetId: number;
}

const typeConfig = {
  manual: { icon: FileText, label: "دفترچه", color: "#3b82f6" },
  drawing: { icon: Wrench, label: "نقشه", color: "#8b5cf6" },
  certificate: { icon: Award, label: "گواهی", color: "#22c55e" },
  photo: { icon: ImageIcon, label: "تصویر", color: "#ec4899" },
  report: { icon: FileCheck, label: "گزارش", color: "#f59e0b" },
  warranty: { icon: ShieldCheck, label: "گارانتی", color: "#06b6d4" },
};

export function DocumentsTab({ assetId }: Props) {
  const documents = getAssetDocuments(assetId);
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = filter === "all" ? documents : documents.filter(d => d.type === filter);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Upload Zone */}
      <div className="chart-card !p-4">
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl py-6 cursor-pointer hover:border-amber-500 transition-colors">
          <div className="text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold">افزودن مدرک جدید</p>
            <p className="text-[10px] text-gray-500 mt-1">PDF, JPG, PNG, DOC (حداکثر ۱۰ MB)</p>
          </div>
          <input type="file" className="hidden" multiple />
        </label>
      </div>

      {/* Filter */}
      <div className="chart-card !p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-amber-500" />
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1 rounded-full transition-all ${filter === "all" ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'}`}
          >
            همه ({documents.length})
          </button>
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const count = documents.filter(d => d.type === key).length;
            if (count === 0) return null;
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1 ${filter === key ? 'text-white font-bold' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500'}`}
                style={{ backgroundColor: filter === key ? cfg.color : undefined }}
              >
                <Icon className="w-3 h-3" />
                {cfg.label} ({count})
              </button>
            );
          })}
          <div className="mr-auto flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded text-[10px] ${viewMode === "grid" ? 'bg-white dark:bg-[#222] font-bold' : ''}`}
            >
              کارت
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded text-[10px] ${viewMode === "list" ? 'bg-white dark:bg-[#222] font-bold' : ''}`}
            >
              لیست
            </button>
          </div>
        </div>
      </div>

      {/* Documents */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(doc => {
            const cfg = typeConfig[doc.type];
            const Icon = cfg.icon;
            return (
              <div key={doc.id} className="chart-card !p-3 card-hover group">
                <div
                  className="w-full h-24 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden"
                  style={{ backgroundColor: cfg.color + '15' }}
                >
                  <Icon className="w-10 h-10" style={{ color: cfg.color }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center gap-2 transition-opacity">
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/40" title="مشاهده">
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/40" title="دانلود">
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold truncate">{doc.title}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
                  <span>{doc.fileSize}</span>
                  {doc.version && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-500 font-mono">
                      {doc.version}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-gray-500 mt-1">{doc.uploadedAt}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="chart-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-3 px-4 text-gray-500 font-medium">مدرک</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">نوع</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">اندازه</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">بارگذاری</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const cfg = typeConfig[doc.type];
                const Icon = cfg.icon;
                return (
                  <tr key={doc.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.color + '20' }}>
                          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{doc.title}</p>
                          <p className="text-[9px] text-gray-500">توسط {doc.uploadedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-500">{doc.fileSize}</td>
                    <td className="py-3 px-4 text-center text-xs text-gray-500">{doc.uploadedAt}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button className="p-1 rounded hover:bg-blue-500/10 text-blue-500"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1 rounded hover:bg-green-500/10 text-green-500"><Download className="w-3.5 h-3.5" /></button>
                        <button className="p-1 rounded hover:bg-red-500/10 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
