"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Skeleton shimmer block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        "relative overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/** Skeleton for a single room row card in ReportStatusView */
export function RoomRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-3 w-24 rounded-lg" />
      </div>
      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
    </div>
  );
}

/** Skeleton for the summary stat cards */
export function StatCardSkeleton() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm px-3 py-4 min-h-[5.5rem]">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-10 rounded-lg" />
          <Skeleton className="h-3 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for image slots in folder view / detail view */
export function ImageSlotSkeleton() {
  return (
    <Skeleton className="h-36 sm:h-44 w-full rounded-xl" />
  );
}

/** Skeleton for the full ImageFolderView */
export function ImageFolderSkeleton() {
  return (
    <div className="space-y-4">
      {/* folder header */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3 w-48 rounded-lg" />
          <Skeleton className="h-3 w-40 rounded-lg" />
        </div>
      </div>
      {/* image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ImageSlotSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for ReportStatusView full loading state */
export function ReportStatusSkeleton() {
  return (
    <div className="space-y-3">
      {/* stat cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
      {/* room rows */}
      <Skeleton className="h-4 w-32 rounded-lg mt-2 ml-1" />
      {Array.from({ length: 5 }).map((_, i) => (
        <RoomRowSkeleton key={i} />
      ))}
    </div>
  );
}
