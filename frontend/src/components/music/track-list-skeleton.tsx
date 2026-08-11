"use client"

import { Skeleton } from "@/components/design-system/skeleton"

export function TrackListSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="h-3.5 flex-1 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
