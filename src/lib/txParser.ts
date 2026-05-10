import type { Transaction, TransactionReceipt } from "viem";
import type { DecodedLogEntry } from "@/utils/decodeLogs";
import { formatWeiEth } from "@/utils/format";

export type TokenTransferRow = {
  token: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  symbol?: string;
  decimals?: number;
};

export type FunctionDecodeResult =
  | {
      ok: true;
      name: string;
      args: Record<string, unknown>;
    }
  | {
      ok: false;
      selector?: string;
      reason: string;
    };

export type TransactionInspectRow = {
  hash: string;
  status: "success" | "failed" | "pending";
  blockNumber: bigint | null;
  timestamp: number | null;
  from: `0x${string}`;
  to: `0x${string}` | null;
  contractAddress: `0x${string}` | null;
  valueWei: bigint;
  gasLimit: bigint | null;
  gasUsed: bigint | null;
  gasPrice: bigint | null;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  nonce: number;
  input: `0x${string}`;
  chainId: number;
};

export type InspectSuccess = {
  row: TransactionInspectRow;
  functionDecode: FunctionDecodeResult | null;
  logs: DecodedLogEntry[];
  tokenTransfers: TokenTransferRow[];
  summary: string;
  raw: {
    tx: Transaction;
    receipt: TransactionReceipt | null;
  };
};

export function buildInspectRow(
  tx: {
    hash: `0x${string}`;
    blockNumber: bigint | null;
    from: `0x${string}`;
    to: `0x${string}` | null;
    value: bigint;
    gas?: bigint;
    gasPrice?: bigint | null;
    maxFeePerGas?: bigint | null;
    maxPriorityFeePerGas?: bigint | null;
    nonce: number;
    input: `0x${string}`;
    chainId?: number | null;
  },
  receipt: TransactionReceipt | null,
  blockTimestamp: number | null,
): TransactionInspectRow {
  const status: TransactionInspectRow["status"] = receipt
    ? receipt.status === "success"
      ? "success"
      : "failed"
    : "pending";

  return {
    hash: tx.hash,
    status,
    blockNumber: receipt?.blockNumber ?? tx.blockNumber ?? null,
    timestamp: blockTimestamp,
    from: tx.from,
    to: tx.to,
    contractAddress: receipt?.contractAddress ?? null,
    valueWei: tx.value,
    gasLimit: tx.gas ?? null,
    gasUsed: receipt?.gasUsed ?? null,
    gasPrice: tx.gasPrice ?? null,
    maxFeePerGas: tx.maxFeePerGas ?? null,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas ?? null,
    nonce: tx.nonce,
    input: tx.input,
    chainId: tx.chainId ?? 1,
  };
}

export function generateSummary(params: {
  row: TransactionInspectRow;
  fn: FunctionDecodeResult | null;
  logs: DecodedLogEntry[];
}): string {
  const { row, fn, logs } = params;
  const ethMoved = row.valueWei > BigInt(0);

  if (row.status === "failed") {
    return `This transaction failed on-chain after inclusion${
      row.blockNumber ? ` in block ${row.blockNumber.toString()}` : ""
    }. Calldata and receipt logs may still be inspected below.`;
  }

  if (!row.to && row.contractAddress) {
    return `This transaction deployed contract ${row.contractAddress}.`;
  }

  const transfers = logs.filter((l) => l.erc20Transfer);
  const hasApproval = logs.some((l) => l.eventName === "Approval");

  const name = fn?.ok ? fn.name.toLowerCase() : "";

  if (fn?.ok && (name.includes("swap") || name.includes("exact"))) {
    const via = row.to ? `via ${row.to}` : "";
    return `This transaction invoked ${fn.name}${
      ethMoved ? ` sending ${formatWeiEth(row.valueWei)}` : ""
    } ${via}. Review decoded parameters and swap-related logs for token movements.`.trim();
  }

  if (fn?.ok && name.includes("approve")) {
    return `This transaction submitted an approval call (${fn.name}). Check Event Logs for Approval details and spender allowances.`;
  }

  if (transfers.length === 1 && transfers[0]?.erc20Transfer) {
    const t = transfers[0].erc20Transfer;
    return `This transaction emitted an ERC-20 Transfer from ${t.from} to ${t.to} for amount ${t.value.toString()} (raw units — decimals shown when metadata resolves).`;
  }

  if (transfers.length > 1) {
    return `This transaction emitted ${transfers.length} ERC-20 Transfer events alongside ${fn?.ok ? `function ${fn.name}` : "contract execution"}.`;
  }

  if (ethMoved && !row.to) {
    return `This transaction sent ${formatWeiEth(row.valueWei)} native currency with empty calldata (simple transfer / funding pattern).`;
  }

  if (ethMoved && row.to) {
    return `This transaction sent ${formatWeiEth(row.valueWei)} to ${row.to}${
      fn?.ok ? ` and called ${fn.name}` : " with accompanying calldata"
    }.`;
  }

  if (fn?.ok) {
    return `This transaction called ${fn.name} on ${row.to ?? "unknown contract"}. Expand sections below for parameters and logs.`;
  }

  if (hasApproval) {
    return `This transaction interacted with contracts that emitted Approval events. Review decoded logs for spender and allowance values.`;
  }

  if (!fn && row.input && row.input !== "0x") {
    return `This transaction included calldata that could not be fully decoded (missing or unverified ABI). The selector and raw hex are shown below.`;
  }

  return `This transaction ${row.status === "success" ? "executed successfully" : "is pending or lacks receipt data"}. Explore decoded logs and raw JSON for details.`;
}
