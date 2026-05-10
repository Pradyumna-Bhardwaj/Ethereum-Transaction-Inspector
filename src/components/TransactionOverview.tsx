"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TransactionInspectRow } from "@/lib/txParser";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/constants";
import { formatGweiSafe, formatWeiEth } from "@/utils/format";
import { shortenAddress } from "@/utils/shortenAddress";
import { CopyChip } from "@/components/CopyChip";

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[128px_1fr] gap-3 border-b border-white/6 py-3 text-sm last:border-0 sm:grid-cols-[160px_1fr]">
      <div className="text-zinc-500">{label}</div>
      <div className="min-w-0 break-all text-zinc-100">{children}</div>
    </div>
  );
}

function GasBar({ used, limit }: { used: bigint; limit: bigint }) {
  const pct = limit > BigInt(0) ? Number((used * BigInt(10000)) / limit) / 100 : 0;
  const color =
    pct > 90 ? "bg-red-500" : pct > 60 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 tabular-nums text-zinc-400">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

export function TransactionOverview({
  row,
}: {
  row: TransactionInspectRow;
}) {
  const ts =
    row.timestamp !== null
      ? new Date(row.timestamp).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const statusVariant =
    row.status === "success"
      ? "success"
      : row.status === "failed"
        ? "destructive"
        : "muted";

  const feePaid =
    row.gasUsed !== null && row.gasPrice !== null
      ? formatWeiEth(row.gasUsed * row.gasPrice)
      : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-white/6 bg-linear-to-r from-white/2 to-transparent">
        <CardTitle>Transaction overview</CardTitle>
        <CardDescription>
          Core execution metadata from RPC · Block{" "}
          {row.blockNumber?.toString() ?? "pending"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 pt-4">
        <Row label="Hash">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs sm:text-sm">{row.hash}</span>
            <CopyChip value={row.hash} />
            <a
              href={explorerTxUrl(row.chainId, row.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
            >
              Explorer <ExternalLink className="size-3" />
            </a>
          </div>
        </Row>
        <Row label="Status">
          <Badge variant={statusVariant} className="capitalize">
            {row.status}
          </Badge>
        </Row>
        <Row label="Timestamp">{ts}</Row>
        <Row label="From">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs sm:text-sm">{row.from}</span>
            <CopyChip value={row.from} />
            <a
              href={explorerAddressUrl(row.chainId, row.from)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              {shortenAddress(row.from)}
            </a>
          </div>
        </Row>
        <Row label="To">
          {row.to ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs sm:text-sm">{row.to}</span>
              <CopyChip value={row.to} />
              <a
                href={explorerAddressUrl(row.chainId, row.to)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                {shortenAddress(row.to)}
              </a>
            </div>
          ) : row.contractAddress ? (
            <span className="text-zinc-400">
              Contract creation →{" "}
              <span className="font-mono text-zinc-200">
                {row.contractAddress}
              </span>
            </span>
          ) : (
            <span className="text-zinc-500">—</span>
          )}
        </Row>
        <Row label="Value">{formatWeiEth(row.valueWei)}</Row>
        <Row label="Gas used">
          {row.gasUsed !== null ? (
            <div className="space-y-2">
              <span>{row.gasUsed.toLocaleString()}</span>
              {row.gasLimit !== null && row.gasLimit > BigInt(0) ? (
                <GasBar used={row.gasUsed} limit={row.gasLimit} />
              ) : null}
            </div>
          ) : (
            "—"
          )}
        </Row>
        {row.gasLimit !== null ? (
          <Row label="Gas limit">{row.gasLimit.toLocaleString()}</Row>
        ) : null}
        {feePaid !== null ? (
          <Row label="Fee paid">
            <span className="text-amber-200/90">{feePaid}</span>
          </Row>
        ) : null}
        <Row label="Gas price">
          {row.gasPrice !== null ? formatGweiSafe(row.gasPrice) : "—"}
        </Row>
        <Row label="Max fee">
          {row.maxFeePerGas !== null ? formatGweiSafe(row.maxFeePerGas) : "—"}
        </Row>
        <Row label="Nonce">{row.nonce}</Row>
      </CardContent>
    </Card>
  );
}
