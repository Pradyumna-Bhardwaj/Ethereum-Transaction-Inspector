"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InspectSuccess } from "@/lib/txParser";
import { CopyChip } from "@/components/CopyChip";

function stringify(value: unknown) {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
}

export function RawJsonViewer({ data }: { data: InspectSuccess }) {
  const rawLogs = data.raw.receipt?.logs ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw data</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          <AccordionItem
            value="tx"
            className="rounded-xl border border-white/10 px-4"
          >
            <AccordionTrigger>Transaction JSON</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex justify-end">
                <CopyChip label="Copy JSON" value={stringify(data.raw.tx)} />
              </div>
              <pre className="max-h-[320px] overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                {stringify(data.raw.tx)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="receipt"
            className="rounded-xl border border-white/10 px-4"
          >
            <AccordionTrigger>Receipt JSON</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex justify-end">
                <CopyChip
                  label="Copy JSON"
                  value={stringify(data.raw.receipt)}
                />
              </div>
              <pre className="max-h-[320px] overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                {stringify(data.raw.receipt)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="logs"
            className="rounded-xl border border-white/10 px-4"
          >
            <AccordionTrigger>Logs array</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex justify-end">
                <CopyChip label="Copy JSON" value={stringify(rawLogs)} />
              </div>
              <pre className="max-h-[320px] overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                {stringify(rawLogs)}
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="calldata"
            className="rounded-xl border border-white/10 px-4"
          >
            <AccordionTrigger>Calldata</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex justify-end">
                <CopyChip label="Copy" value={data.row.input} />
              </div>
              <pre className="max-h-[240px] overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[11px] text-zinc-300">
                {data.row.input}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
