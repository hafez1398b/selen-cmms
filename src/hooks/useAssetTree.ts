"use client";

import { useState, useMemo, useCallback } from "react";
import { assetsTreeData, type AssetNode, type AssetTypeKey } from "@/lib/assets-data";

export interface AssetTreeNode extends AssetNode {
  children: AssetTreeNode[];
  isExpanded: boolean;
  isVisible: boolean;
  matchesFilter: boolean;
  depth: number;
}

export interface AssetFilters {
  search: string;
  types: AssetTypeKey[];
  statuses: string[];
  criticalities: string[];
  minHealth: number;
  maxHealth: number;
}

export const defaultFilters: AssetFilters = {
  search: "",
  types: [],
  statuses: [],
  criticalities: [],
  minHealth: 0,
  maxHealth: 100,
};

export function useAssetTree() {
  const [assets, setAssets] = useState<AssetNode[]>(assetsTreeData);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    new Set([1, 2, 10, 30, 40, 50, 60, 70, 80]) // Root + all Bespars
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<AssetFilters>(defaultFilters);
  const [focusedId, setFocusedId] = useState<number | null>(null);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(assets.map(a => a.id)));
  }, [assets]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set([1])); // Keep root
  }, []);

  const expandToNode = useCallback((id: number) => {
    const toExpand = new Set(expandedIds);
    let current = assets.find(a => a.id === id);
    while (current?.parentId) {
      toExpand.add(current.parentId);
      current = assets.find(a => a.id === current!.parentId);
    }
    toExpand.add(id);
    setExpandedIds(toExpand);
    setFocusedId(id);
  }, [assets, expandedIds]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Check if a node or its descendants match filter
  const nodeMatchesFilter = useCallback((asset: AssetNode): boolean => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!asset.name.toLowerCase().includes(q) && !asset.code.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.types.length && !filters.types.includes(asset.typeKey)) return false;
    if (filters.statuses.length && !filters.statuses.includes(asset.status)) return false;
    if (filters.criticalities.length && !filters.criticalities.includes(asset.criticality)) return false;
    if (asset.healthScore < filters.minHealth || asset.healthScore > filters.maxHealth) return false;
    return true;
  }, [filters]);

  // Build tree with filter awareness
  const tree = useMemo<AssetTreeNode[]>(() => {
    const buildNode = (asset: AssetNode, depth: number): AssetTreeNode => {
      const children = assets
        .filter(a => a.parentId === asset.id)
        .map(c => buildNode(c, depth + 1));

      const matchesSelf = nodeMatchesFilter(asset);
      const anyChildMatches = children.some(c => c.matchesFilter || c.children.some(cc => cc.matchesFilter));
      const hasFilter = Boolean(filters.search) || filters.types.length > 0 || filters.statuses.length > 0 ||
                       filters.criticalities.length > 0 || filters.minHealth > 0 || filters.maxHealth < 100;

      return {
        ...asset,
        children,
        isExpanded: expandedIds.has(asset.id) || (hasFilter && anyChildMatches),
        isVisible: !hasFilter || matchesSelf || anyChildMatches,
        matchesFilter: matchesSelf,
        depth,
      };
    };

    return assets
      .filter(a => a.parentId === null)
      .map(root => buildNode(root, 0));
  }, [assets, expandedIds, filters, nodeMatchesFilter]);

  // Flatten tree respecting expanded state
  const flatTree = useMemo(() => {
    const result: AssetTreeNode[] = [];
    const walk = (nodes: AssetTreeNode[]) => {
      for (const node of nodes) {
        if (!node.isVisible) continue;
        result.push(node);
        if (node.isExpanded && node.children.length > 0) {
          walk(node.children);
        }
      }
    };
    walk(tree);
    return result;
  }, [tree]);

  // Move asset to new parent
  const moveAsset = useCallback((assetId: number, newParentId: number | null): boolean => {
    // Prevent moving a node into its own descendant
    const isDescendant = (candidateId: number, ancestorId: number): boolean => {
      if (candidateId === ancestorId) return true;
      const children = assets.filter(a => a.parentId === ancestorId);
      return children.some(c => isDescendant(candidateId, c.id));
    };

    if (newParentId !== null && isDescendant(newParentId, assetId)) {
      return false;
    }

    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, parentId: newParentId } : a
    ));
    return true;
  }, [assets]);

  const deleteAsset = useCallback((id: number) => {
    // Delete asset and all descendants
    const toDelete = new Set<number>([id]);
    const collectDescendants = (parentId: number) => {
      assets.filter(a => a.parentId === parentId).forEach(child => {
        toDelete.add(child.id);
        collectDescendants(child.id);
      });
    };
    collectDescendants(id);
    setAssets(prev => prev.filter(a => !toDelete.has(a.id)));
  }, [assets]);

  const bulkDelete = useCallback(() => {
    const toDelete = new Set<number>();
    selectedIds.forEach(id => {
      toDelete.add(id);
      const collectDesc = (parentId: number) => {
        assets.filter(a => a.parentId === parentId).forEach(child => {
          toDelete.add(child.id);
          collectDesc(child.id);
        });
      };
      collectDesc(id);
    });
    setAssets(prev => prev.filter(a => !toDelete.has(a.id)));
    setSelectedIds(new Set());
  }, [assets, selectedIds]);

  const addAsset = useCallback((newAsset: Omit<AssetNode, "id" | "path" | "level">) => {
    const id = Math.max(...assets.map(a => a.id)) + 1;
    const parent = newAsset.parentId ? assets.find(a => a.id === newAsset.parentId) : null;
    const level = parent ? parent.level + 1 : 0;
    const path = parent ? `${parent.path}.${id}` : `${id}`;
    setAssets(prev => [...prev, { ...newAsset, id, path, level }]);
    if (newAsset.parentId) {
      setExpandedIds(prev => new Set(prev).add(newAsset.parentId!));
    }
    return id;
  }, [assets]);

  const updateAsset = useCallback((id: number, updates: Partial<AssetNode>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const stats = useMemo(() => {
    return {
      total: assets.length,
      visible: flatTree.length,
      selected: selectedIds.size,
      active: assets.filter(a => a.status === "active").length,
      maintenance: assets.filter(a => a.status === "maintenance").length,
      failed: assets.filter(a => a.status === "failed").length,
      critical: assets.filter(a => a.criticality === "critical").length,
      matchingFilter: assets.filter(a => nodeMatchesFilter(a)).length,
    };
  }, [assets, flatTree, selectedIds, nodeMatchesFilter]);

  return {
    assets,
    tree,
    flatTree,
    filters,
    setFilters,
    expandedIds,
    toggleExpand,
    expandAll,
    collapseAll,
    expandToNode,
    selectedIds,
    toggleSelect,
    clearSelection,
    focusedId,
    setFocusedId,
    moveAsset,
    deleteAsset,
    bulkDelete,
    addAsset,
    updateAsset,
    stats,
  };
}
