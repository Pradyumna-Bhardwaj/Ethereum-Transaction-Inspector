"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunctionDecodeResult } from "@/lib/txParser";
import { CopyChip } from "@/components/CopyChip";

function renderArgValue(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(
        value,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      );
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function FunctionDecoder({
  decode,
  input,
}: {
  decode: FunctionDecodeResult | null;
  input: `0x${string}`;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Function call</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {decode?.ok ? (
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 font-mono text-sm leading-relaxed text-zinc-100">
            <div className="mb-3 text-xs uppercase tracking-wide text-zinc-500">
              Decoded
            </div>
            <div>
              <span className="text-violet-300">{decode.name}</span>
              <span className="text-zinc-400">(</span>
            </div>
            <div className="mt-2 space-y-2 pl-2">
              {Object.entries(decode.args).map(([k, v]) => (
                <div key={k} className="grid gap-1 sm:grid-cols-[minmax(0,140px)_1fr]">
                  <span className="text-zinc-500">{k}</span>
                  <pre className="whitespace-pre-wrap break-all text-xs text-zinc-200">
                    {renderArgValue(v)}
                  </pre>
                </div>
              ))}
            </div>
            <div className="text-zinc-400">)</div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/90">
            <div className="mb-2 font-medium">Could not decode calldata</div>
            <p className="text-xs leading-relaxed text-amber-100/70">
              {decode?.ok === false
                ? decode.reason
                : input === "0x"
                  ? "No calldata — simple ETH movement or empty input."
                  : "Missing ABI or non-standard interaction."}
            </p>
            {decode?.ok === false && decode.selector ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-300">
                <span className="text-zinc-500">Selector</span>
                <span>{decode.selector}</span>
                <CopyChip label="Copy selector" value={decode.selector} />
              </div>
            ) : null}
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Raw input
            </span>
            <CopyChip label="Copy calldata" value={input} />
          </div>
          <pre className="max-h-48 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-zinc-300 sm:text-xs">
            {input}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
