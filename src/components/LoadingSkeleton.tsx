"use client";

import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

function CardSkeleton({ rows = 4, title = true }: { rows?: number; title?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      {title && <Bone className="mb-5 h-4 w-36" />}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-[128px_1fr] gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
            <Bone className="mb-3 h-3 w-16" />
            <Bone className="h-4 w-full" />
            <Bone className="mt-2 h-4 w-4/5" />
          </div>
        </div>

        {/* Overview */}
        <div className="lg:col-span-2">
          <CardSkeleton rows={9} />
        </div>

        {/* Function + Transfers */}
        <div className="space-y-6">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={2} />
        </div>

        {/* Logs + Raw */}
        <div className="space-y-6">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={2} />
        </div>
      </div>
    </section>
  );
}
