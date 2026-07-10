"use client";

import { useState, useCallback } from "react";
import { AssetNode as AssetNodeComponent } from "./AssetNode";
import type { AssetTreeNode } from "@/hooks/useAssetTree";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageX, Search } from "lucide-react";

interface Props {
  flatTree: AssetTreeNode[];
  selectedIds: Set<number>;
  focusedId: number | null;
  searchTerm: string;
  zoom: number;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
  onNodeClick: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
  onDuplicate: (id: number) => void;
  onMove: (id: number, newParentId: number | null) => boolean;
  onView: (id: number) => void;
}

export function AssetTree({
  flatTree, selectedIds, focusedId, searchTerm, zoom,
  onToggleExpand, onSelect, onNodeClick, onEdit, onDelete,
  onAddChild, onDuplicate, onMove, onView,
}: Props) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleDragStart = useCallback((id: number, e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  }, []);

  const handleDragOver = useCallback((id: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedId !== null && draggedId !== id) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((targetId: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId !== null && draggedId !== targetId) {
      onMove(draggedId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, onMove]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  if (flatTree.length === 0) {
    return (
      <EmptyState
        icon={searchTerm ? Search : PackageX}
        title={searchTerm ? "نتیجه‌ای یافت نشد" : "هیچ تجهیزی ثبت نشده"}
        description={searchTerm ? `برای «${searchTerm}» نتیجه‌ای وجود ندارد` : "برای شروع، یک تجهیز اضافه کنید"}
      />
    );
  }

  return (
    <div
      className="space-y-0.5 origin-top-right transition-transform duration-300"
      style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top right" }}
    >
      {flatTree.map(node => (
        <AssetNodeComponent
          key={node.id}
          node={node}
          isSelected={selectedIds.has(node.id)}
          isFocused={focusedId === node.id}
          isDragOver={dragOverId === node.id}
          searchTerm={searchTerm}
          onToggleExpand={() => onToggleExpand(node.id)}
          onSelect={() => onSelect(node.id)}
          onClick={() => onNodeClick(node.id)}
          onEdit={() => onEdit(node.id)}
          onDelete={() => onDelete(node.id)}
          onAddChild={() => onAddChild(node.id)}
          onDuplicate={() => onDuplicate(node.id)}
          onMove={() => {}}
          onView={() => onView(node.id)}
          onDragStart={(e) => handleDragStart(node.id, e)}
          onDragOver={(e) => handleDragOver(node.id, e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(node.id, e)}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
