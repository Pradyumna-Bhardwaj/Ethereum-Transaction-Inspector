"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HumanSummary({ text }: { text: string }) {
  return (
    <Card className="border-violet-500/20 bg-linear-to-r from-violet-500/10 via-indigo-500/5 to-transparent">
      <CardContent className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="size-3.5 text-violet-400" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300/90">
            Summary
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-100 sm:text-base">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}
