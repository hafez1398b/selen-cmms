"use client";

import { useState } from "react";
import { ArrowRight, Edit2, QrCode, Printer, Share2, Sparkles, ChevronDown } from "lucide-react";
import type { AssetNode } from "@/lib/assets-data";
import { assetTypes, getAssetPath } from "@/lib/assets-data";
import { IdentityTab } from "./tabs/IdentityTab";
import { KpiTab } from "./tabs/KpiTab";
import { PartsTab } from "./tabs/PartsTab";
import { SubSystemsTab } from "./tabs/SubSystemsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { PMTab } from "./tabs/PMTab";
import { AIAdvisorTab } from "./tabs/AIAdvisorTab";
import { AssetQRCode } from "./AssetQRCode";
import { AssetBreadcrumb } from "./AssetBreadcrumb";

interface Props {
  asset: AssetNode;
  onBack: () => void;
  onNavigate: (id: number) => void;
  onEdit: () => void;
}

type TabId = "identity" | "kpi" | "parts" | "subsystems" | "history" | "documents" | "pm" | "ai";

const tabs: { id: TabId; label: string; badge?: string }[] = [
  { id: "identity", label: "شناسنامه" },
  { id: "kpi", label: "شاخص‌ها (KPI)" },
  { id: "pm", label: "برنامه PM" },
  { id: "parts", label: "قطعات" },
  { id: "subsystems", label: "زیرسیستم" },
  { id: "history", label: "سوابق" },
  { id: "documents", label: "مدارک" },
  { id: "ai", label: "مشاور AI", badge: "AI" },
];

export function AssetWorkspace({ asset, onBack, onNavigate, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  const [qrOpen, setQrOpen] = useState(false);
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const typeInfo = assetTypes[asset.typeKey];

  const statusColor =
    asset.status === "active" ? "#22c55e" :
    asset.status === "maintenance" ? "#f59e0b" :
    asset.status === "failed" ? "#ef4444" : "#6b7280";

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="chart-card !p-4 md:!p-5 !rounded-none md:!rounded-2xl sticky top-0 z-20 md:relative">
        {/* Top: Back button + Actions */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-500 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به لیست</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"
              title="ویرایش"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
              title="کد QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-500 transition-colors"
              title="چاپ"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-3 overflow-x-auto scrollbar-hide">
          <AssetBreadcrumb assetId={asset.id} onNavigate={id => id && onNavigate(id)} />
        </div>

        {/* Main Info */}
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl flex-shrink-0"
            style={{ backgroundColor: typeInfo.color + '20' }}
          >
            {typeInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ color: typeInfo.color, backgroundColor: typeInfo.color + '20' }}
              >
                {typeInfo.label}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ color: statusColor, backgroundColor: statusColor + '20' }}
              >
                {asset.status === "active" ? "فعال" : asset.status === "maintenance" ? "در تعمیر" : asset.status === "failed" ? "خراب" : "غیرفعال"}
              </span>
              {asset.criticality === "critical" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-bold">
                  بحرانی
                </span>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-black">{asset.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-500" dir="ltr">{asset.code}</span>
              {asset.manufacturer && (
                <span className="text-xs text-gray-500">• {asset.manufacturer}</span>
              )}
              {asset.model && (
                <span className="text-xs text-gray-500">• {asset.model}</span>
              )}
            </div>
          </div>
          {/* Health Score - Desktop */}
          <div className="hidden md:flex flex-col items-center flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                  className="dark:stroke-[#1a1a1a]"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${asset.healthScore}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black" style={{ color: asset.healthScore >= 85 ? '#22c55e' : asset.healthScore >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {asset.healthScore}
                </span>
                <span className="text-[8px] text-gray-500">سلامت</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Desktop */}
        <div className="hidden md:flex mt-4 border-b border-gray-200 dark:border-[#1a1a1a] overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600 dark:text-amber-500 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tabs - Mobile Dropdown */}
        <div className="md:hidden mt-3 relative">
          <button
            onClick={() => setMobileTabsOpen(!mobileTabsOpen)}
            className="w-full flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-500"
          >
            <span className="flex items-center gap-2">
              {activeTabInfo?.label}
              {activeTabInfo?.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 text-white font-bold">
                  {activeTabInfo.badge}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileTabsOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileTabsOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-lg shadow-2xl z-30 max-h-80 overflow-y-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileTabsOpen(false); }}
                  className={`w-full text-right px-4 py-2.5 text-sm flex items-center gap-2 border-b border-gray-100 dark:border-[#0a0a0a] last:border-0 ${
                    activeTab === tab.id ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold' : ''
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-3 md:p-5 lg:p-6">
        {activeTab === "identity" && <IdentityTab asset={asset} />}
        {activeTab === "kpi" && <KpiTab asset={asset} />}
        {activeTab === "parts" && <PartsTab assetId={asset.id} />}
        {activeTab === "subsystems" && <SubSystemsTab asset={asset} onNavigate={onNavigate} />}
        {activeTab === "history" && <HistoryTab assetId={asset.id} />}
        {activeTab === "documents" && <DocumentsTab assetId={asset.id} />}
        {activeTab === "pm" && <PMTab assetId={asset.id} />}
        {activeTab === "ai" && <AIAdvisorTab asset={asset} />}
      </div>

      {/* Floating AI Advisor Button (except on AI tab) */}
      {activeTab !== "ai" && (
        <button
          onClick={() => setActiveTab("ai")}
          className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-pulse-glow"
          title="مشاور هوشمند نت‌سلن"
        >
          <Sparkles className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
            AI
          </span>
        </button>
      )}

      {/* QR Modal */}
      <AssetQRCode asset={asset} isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
