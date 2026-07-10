"use client";

import { useState } from "react";
import { Map, ChevronDown } from "lucide-react";
import type { AssetTreeNode } from "@/hooks/useAssetTree";
import { assetTypes } from "@/lib/assets-data";

interface Props {
  tree: AssetTreeNode[];
  onNavigate: (id: number) => void;
  focusedId: number | null;
}

export function AssetMiniMap({ tree, onNavigate, focusedId }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const flattenTop = (nodes: AssetTreeNode[], maxDepth: number = 3): AssetTreeNode[] => {
    const result: AssetTreeNode[] = [];
    const walk = (arr: AssetTreeNode[]) => {
      for (const n of arr) {
        if (n.depth > maxDepth) continue;
        result.push(n);
        if (n.children.length) walk(n.children);
      }
    };
    walk(nodes);
    return result;
  };

  const topNodes = flattenTop(tree, 2); // Show up to bespar level

  return (
    <div className="chart-card !p-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold">نمای کلی</span>
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <div className="space-y-1 animate-fade-in max-h-[300px] overflow-y-auto scrollbar-hide">
          {topNodes.map(node => {
            const typeInfo = assetTypes[node.typeKey];
            const isFocused = focusedId === node.id;
            return (
              <button
                key={node.id}
                onClick={() => onNavigate(node.id)}
                className={`w-full text-right px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all ${
                  isFocused
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-500 font-bold'
                    : 'hover:bg-gray-50 dark:hover:bg-[#0a0a0a]'
                }`}
                style={{ paddingRight: `${node.depth * 12 + 8}px` }}
              >
                <span className="flex-shrink-0">{typeInfo.icon}</span>
                <span className="truncate flex-1 text-right">{node.name}</span>
                {node.healthScore < 75 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
