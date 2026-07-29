"use client";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Skeleton({ className = "", width, height, rounded = "md" }: SkeletonProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={`skeleton-shimmer ${roundedClass} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={36} height={36} rounded="xl" />
        <Skeleton width={30} height={12} />
      </div>
      <Skeleton width="60%" height={10} className="mb-2" />
      <Skeleton width="40%" height={24} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#111]">
          <Skeleton width={40} height={40} rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={12} />
            <Skeleton width="40%" height={10} />
          </div>
          <Skeleton width={60} height={20} rounded="full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="chart-card">
      <Skeleton width="40%" height={14} className="mb-4" />
      <Skeleton width="100%" height={200} rounded="lg" />
    </div>
  );
}
