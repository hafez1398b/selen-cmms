"use client";

import { ChevronLeft, Home } from "lucide-react";
import { getAssetPath, assetTypes } from "@/lib/assets-data";

interface Props {
  assetId: number | null;
  onNavigate: (id: number | null) => void;
}

export function AssetBreadcrumb({ assetId, onNavigate }: Props) {
  const path = assetId ? getAssetPath(assetId) : [];

  return (
    <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500 flex-shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">خانه</span>
      </button>
      {path.map((node, i) => (
        <div key={node.id} className="flex items-center gap-1 flex-shrink-0">
          <ChevronLeft className="w-3 h-3 text-gray-400" />
          <button
            onClick={() => onNavigate(node.id)}
            className={`px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors flex items-center gap-1 ${
              i === path.length - 1
                ? 'text-amber-600 dark:text-amber-500 font-bold'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span>{assetTypes[node.typeKey].icon}</span>
            <span className="truncate max-w-[120px] md:max-w-none">{node.name}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
