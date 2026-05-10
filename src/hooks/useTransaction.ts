"use client";

import { useCallback, useState } from "react";
import type { Abi, Hex, TransactionReceipt } from "viem";
import { getPublicClient, hasRpcForChain } from "@/lib/alchemy";
import { getChainById } from "@/lib/constants";
import { fetchContractAbi } from "@/lib/etherscan";
import { safeDecodeFunctionData } from "@/lib/decoder";
import { decodeLogsForTransaction } from "@/utils/decodeLogs";
import {
  buildInspectRow,
  generateSummary,
  type FunctionDecodeResult,
  type InspectSuccess,
} from "@/lib/txParser";
import { getCachedTxBundle, setCachedTxBundle } from "@/lib/cache";
import { collectTokenTransfers } from "@/lib/tokenMeta";
import { isHexHash } from "@/utils/shortenAddress";

export type InspectState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: InspectSuccess };

async function decodeFunctionForTx(
  chainId: number,
  to: `0x${string}` | null,
  input: Hex,
): Promise<FunctionDecodeResult | null> {
  if (!to || input === "0x") return null;

  const chain = getChainById(chainId);
  if (!chain) {
    return {
      ok: false,
      selector: input.slice(0, 10),
      reason: "Unknown chain",
    };
  }

  const abiResult = await fetchContractAbi(chain, to);
  if (!abiResult.ok) {
    return {
      ok: false,
      selector: input.slice(0, 10),
      reason: abiResult.reason,
    };
  }

  const decoded = safeDecodeFunctionData(abiResult.abi as Abi, input);
  if (!decoded) {
    return {
      ok: false,
      selector: input.slice(0, 10),
      reason:
        "ABI present but calldata did not match any known function on the verified contract.",
    };
  }

  const args: Record<string, unknown> = {};
  if (decoded.args && typeof decoded.args === "object") {
    const rawArgs = decoded.args as unknown as Record<string, unknown>;
    for (const k of Object.keys(rawArgs)) {
      args[k] = rawArgs[k];
    }
  }

  return {
    ok: true,
    name: decoded.functionName ?? "unknown",
    args,
  };
}

export function useTransactionInspect() {
  const [state, setState] = useState<InspectState>({ status: "idle" });

  const inspect = useCallback(async (hashInput: string, chainId: number) => {
    const hash = hashInput.trim();
    if (!isHexHash(hash)) {
      setState({
        status: "error",
        message:
          "Enter a valid 32-byte transaction hash (0x followed by 64 hex characters).",
      });
      return;
    }

    const chain = getChainById(chainId);
    if (!chain) {
      setState({ status: "error", message: "Unsupported network selected." });
      return;
    }

    if (!hasRpcForChain(chainId)) {
      setState({
        status: "error",
        message: `No RPC URL configured for ${chain.name}. Add NEXT_PUBLIC_RPC_* in .env.local.`,
      });
      return;
    }

    const cached = getCachedTxBundle(chainId, hash);
    if (cached) {
      setState({ status: "success", data: cached as InspectSuccess });
      return;
    }

    setState({ status: "loading" });

    try {
      const client = getPublicClient(chain);
      const tx = await client.getTransaction({ hash: hash as `0x${string}` });
      let receipt: TransactionReceipt | null = null;
      try {
        receipt = await client.getTransactionReceipt({
          hash: hash as `0x${string}`,
        });
      } catch {
        receipt = null;
      }

      let blockTimestamp: number | null = null;
      const bn = receipt?.blockNumber ?? tx.blockNumber;
      if (bn !== null && bn !== undefined) {
        try {
          const block = await client.getBlock({ blockNumber: bn });
          blockTimestamp = Number(block.timestamp) * 1000;
        } catch {
          blockTimestamp = null;
        }
      }

      const row = buildInspectRow(tx, receipt, blockTimestamp);
      row.chainId = chainId;

      const fn = await decodeFunctionForTx(chainId, tx.to ?? null, tx.input);

      const logs = receipt?.logs ?? [];
      const decodedLogs = await decodeLogsForTransaction(chain, logs);
      const tokenTransfers = await collectTokenTransfers(client, decodedLogs);

      const summary = generateSummary({
        row,
        fn,
        logs: decodedLogs,
      });

      const data: InspectSuccess = {
        row,
        functionDecode: fn,
        logs: decodedLogs,
        tokenTransfers,
        summary,
        raw: {
          tx,
          receipt,
        },
      };

      setCachedTxBundle(chainId, hash, data);
      setState({ status: "success", data });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to fetch transaction data.";
      setState({ status: "error", message: msg });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, inspect, reset };
}
