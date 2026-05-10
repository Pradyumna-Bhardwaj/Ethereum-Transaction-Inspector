"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DecodedLogEntry } from "@/utils/decodeLogs";
import { shortenAddress } from "@/utils/shortenAddress";
import { CopyChip } from "@/components/CopyChip";

function ArgBlock({ args }: { args: Record<string, unknown> }) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs text-zinc-200">
      {Object.entries(args).map(([k, v]) => (
        <div key={k} className="grid gap-1 sm:grid-cols-[minmax(0,120px)_1fr]">
          <span className="text-zinc-500">{k}</span>
          <pre className="whitespace-pre-wrap break-all">
            {typeof v === "bigint"
              ? v.toString()
              : typeof v === "object"
                ? JSON.stringify(
                    v,
                    (_, x) => (typeof x === "bigint" ? x.toString() : x),
                    2,
                  )
                : String(v)}
          </pre>
        </div>
      ))}
    </div>
  );
}

export function EventLogs({ logs }: { logs: DecodedLogEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Event logs</CardTitle>
        <Badge variant="muted">{logs.length} logs</Badge>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-zinc-500">No logs on this receipt.</p>
        ) : (
          <Accordion type="multiple" className="w-full divide-y divide-white/10 rounded-xl border border-white/10">
            {logs.map((log, i) => (
              <AccordionItem value={`${log.logIndex}-${i}`} key={`${log.logIndex}-${i}`} className="border-0 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start gap-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">
                        #{log.logIndex}
                      </span>
                      {log.eventName ? (
                        <Badge variant="default">{log.eventName}</Badge>
                      ) : (
                        <Badge variant="muted">Undecoded</Badge>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500">
                      {shortenAddress(log.address, 6)} ·{" "}
                      {log.topics[0]?.slice(0, 10)}…
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-2">
                    <div className="flex flex-wrap gap-2">
                      <CopyChip label="Address" value={log.address} />
                      <CopyChip label="Data" value={log.data} />
                    </div>
                    {log.args && Object.keys(log.args).length > 0 ? (
                      <ArgBlock args={log.args} />
                    ) : (
                      <div className="space-y-2 text-xs text-zinc-500">
                        <div className="uppercase tracking-wide">Topics</div>
                        <pre className="overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] text-zinc-300">
                          {JSON.stringify(log.topics, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
