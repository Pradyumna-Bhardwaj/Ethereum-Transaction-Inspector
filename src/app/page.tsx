"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TxInput } from "@/components/TxInput";
import { HumanSummary } from "@/components/HumanSummary";
import { TransactionOverview } from "@/components/TransactionOverview";
import { FunctionDecoder } from "@/components/FunctionDecoder";
import { EventLogs } from "@/components/EventLogs";
import { TokenTransfers } from "@/components/TokenTransfers";
import { RawJsonViewer } from "@/components/RawJsonViewer";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useTransactionInspect } from "@/hooks/useTransaction";
import { mainnet } from "viem/chains";

const FEATURES = [
  { icon: "⚡", label: "Calldata decoded" },
  { icon: "📋", label: "Event logs" },
  { icon: "💸", label: "Token transfers" },
  { icon: "⛽", label: "Gas analytics" },
  { icon: "🔍", label: "Raw JSON" },
];

export default function Home() {
  const [hash, setHash] = useState("");
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const { state, inspect } = useTransactionInspect();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar chainId={chainId} onChainChange={setChainId} />

      <main className="flex-1">
        {/* Hero — centered, no section-level background */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-300/90">
              EthScope
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl sm:leading-[1.05]">
              Inspect any Ethereum transaction
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Decode calldata, receipts, gas economics, and ERC-20 transfers in
              one clean dashboard.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-5">
              <TxInput
                value={hash}
                onChange={setHash}
                onInspect={() => void inspect(hash, chainId)}
                loading={state.status === "loading"}
                disabled={false}
              />
              {state.status === "error" ? (
                <p className="mt-3 text-sm text-red-300/90">{state.message}</p>
              ) : null}
            </div>

            {state.status === "idle" ? (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {FEATURES.map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-zinc-400"
                  >
                    <span aria-hidden>{f.icon}</span>
                    {f.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {state.status === "loading" ? (
          <LoadingSkeleton />
        ) : null}

        {state.status === "success" ? (
          <section className="animate-fade-up mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="space-y-6 lg:col-span-2">
                <HumanSummary text={state.data.summary} />
              </div>

              <div className="space-y-6 lg:col-span-2">
                <TransactionOverview row={state.data.row} />
              </div>

              <div className="space-y-6">
                <FunctionDecoder
                  decode={state.data.functionDecode}
                  input={state.data.row.input}
                />
                <TokenTransfers
                  transfers={state.data.tokenTransfers}
                  chainId={state.data.row.chainId}
                />
              </div>

              <div className="space-y-6">
                <EventLogs logs={state.data.logs} />
                <RawJsonViewer data={state.data} />
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-white/6 py-8 text-center text-xs text-zinc-600">
        Frontend-only inspector · No backend · Educational tooling
      </footer>
    </div>
  );
}
