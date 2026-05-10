"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TokenTransferRow } from "@/lib/txParser";
import { shortenAddress } from "@/utils/shortenAddress";
import { CopyChip } from "@/components/CopyChip";
import { explorerAddressUrl } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

function formatAmount(value: bigint, decimals?: number, symbol?: string) {
  if (decimals === undefined || Number.isNaN(decimals)) {
    return `${value.toString()}${symbol ? ` ${symbol}` : " (raw units)"}`;
  }
  const base = BigInt(10) ** BigInt(decimals);
  const whole = value / base;
  const frac = value % base;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  const human =
    fracStr.length > 0 ? `${whole.toString()}.${fracStr}` : whole.toString();
  return `${human}${symbol ? ` ${symbol}` : ""}`;
}

export function TokenTransfers({
  transfers,
  chainId,
}: {
  transfers: TokenTransferRow[];
  chainId: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token transfers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transfers.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No ERC-20 Transfer events detected on this receipt.
          </p>
        ) : (
          transfers.map((t, idx) => (
            <div
              key={`${t.token}-${idx}`}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/15 text-xs font-semibold text-violet-200 ring-1 ring-violet-500/30">
                    {(t.symbol ?? "ERC").slice(0, 4)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">
                      {t.symbol ?? "ERC-20 token"}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
                      {t.token}
                      <CopyChip value={t.token} />
                      <a
                        href={explorerAddressUrl(chainId, t.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                    From
                  </div>
                  <div className="font-mono text-xs text-zinc-200">
                    {shortenAddress(t.from, 6)}
                  </div>
                  <CopyChip label="Copy" value={t.from} className="-ml-1 mt-1" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                    To
                  </div>
                  <div className="font-mono text-xs text-zinc-200">
                    {shortenAddress(t.to, 6)}
                  </div>
                  <CopyChip label="Copy" value={t.to} className="-ml-1 mt-1" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Amount
                  </div>
                  <div className="text-zinc-100">
                    {formatAmount(t.value, t.decimals, t.symbol)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
