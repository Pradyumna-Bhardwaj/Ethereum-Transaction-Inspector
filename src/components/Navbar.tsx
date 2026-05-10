"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { hasRpcForChain } from "@/lib/alchemy";

export function Navbar({
  chainId,
  onChainChange,
}: {
  chainId: number;
  onChainChange: (id: number) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-black/55 backdrop-blur-xl">
      {/* Violet accent line across the very top */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(139,92,246,0.6) 40%, rgba(139,92,246,0.6) 60%, transparent)",
        }}
        aria-hidden
      />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg outline-none ring-violet-500/40 focus-visible:ring-2"
        >
          <span className="relative shrink-0 size-8 overflow-hidden rounded-lg">
            <Image
              src="/ethscope-logo.png"
              alt=""
              width={200}
              height={56}
              className="h-8 w-auto object-contain object-left"
              priority
            />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-50">
            EthScope
          </span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Chain selector — pill style */}
          <Select
            value={String(chainId)}
            onValueChange={(v) => onChainChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-auto min-w-37 rounded-full border-white/10 bg-white/5 px-3 text-xs hover:bg-white/10 transition-colors sm:min-w-41">
              {/* Live status dot */}
              <span className="mr-1.5 inline-block size-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" aria-hidden />
              <SelectValue placeholder="Network" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  <span className="flex items-center gap-2">
                    {c.label}
                    {!hasRpcForChain(c.id) ? (
                      <span className="text-[10px] uppercase text-amber-400/90">
                        no rpc
                      </span>
                    ) : null}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* GitHub */}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
            aria-label="GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4 fill-current"
              aria-hidden
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.55 0-.27-.01-1.13-.01-2.05-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.72 1.26 3.38.96.1-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.82 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.12 3.06.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.67.8.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
