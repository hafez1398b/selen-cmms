"use client";

import { type LucideIcon, PackageOpen } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
