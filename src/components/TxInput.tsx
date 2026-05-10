"use client";

import { Search, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TxInput({
  value,
  onChange,
  onInspect,
  loading,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onInspect: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.trim());
    } catch {
      /* clipboard permission denied */
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:flex-1">
          <Input
            placeholder="0x… transaction hash"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onInspect();
            }}
            disabled={disabled || loading}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="pr-10"
          />
          {!value && !loading && (
            <button
              type="button"
              onClick={paste}
              title="Paste from clipboard"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <ClipboardPaste className="size-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={onInspect}
          disabled={disabled || loading || !value.trim()}
          className={cn(
            "relative shrink-0 overflow-hidden sm:w-40",
            loading && "animate-glow-pulse",
          )}
        >
          {loading ? (
            <>
              {/* sweep streak */}
              <span
                className="animate-btn-sweep pointer-events-none absolute inset-0 w-1/3 bg-linear-to-r from-transparent via-white/25 to-transparent"
                aria-hidden
              />
              <Search className="size-4 animate-bounce" />
              <span>Inspecting…</span>
            </>
          ) : (
            <>
              <Search className="size-4" />
              Inspect
            </>
          )}
        </Button>
      </div>

      {!loading && (
        <p className="text-[11px] text-zinc-600">
          Paste a hash and press{" "}
          <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
            ↵
          </kbd>{" "}
          or click Inspect
        </p>
      )}
    </div>
  );
}
