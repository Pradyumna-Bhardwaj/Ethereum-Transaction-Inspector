import { erc20Abi } from "viem";
import {
  collectUniqueLogAddresses,
  safeDecodeEventLog,
} from "@/lib/decoder";
import { fetchContractAbi } from "@/lib/etherscan";
import type { SupportedChain } from "@/lib/constants";
import type { Abi, Hex, Log } from "viem";

export type DecodedLogEntry = {
  logIndex: number;
  address: `0x${string}`;
  /** Present when decoded successfully */
  eventName?: string;
  args?: Record<string, unknown>;
  /** Raw fields always available */
  topics: Hex[];
  data: Hex;
  /** Partial decode via ERC-20 Transfer fragment */
  erc20Transfer?: {
    from: `0x${string}`;
    to: `0x${string}`;
    value: bigint;
  };
};

/** Try decoding logs using ABIs fetched per log contract address */
export async function decodeLogsForTransaction(
  chain: SupportedChain,
  logs: Log[],
): Promise<DecodedLogEntry[]> {
  const addresses = collectUniqueLogAddresses(logs);
  const abiByAddress = new Map<string, Abi>();

  await Promise.all(
    addresses.map(async (addr) => {
      const res = await fetchContractAbi(chain, addr);
      if (res.ok) {
        abiByAddress.set(addr.toLowerCase(), res.abi as Abi);
      }
    }),
  );

  const out: DecodedLogEntry[] = [];

  for (const log of logs) {
    const idx = log.logIndex ?? out.length;
    const addr = log.address as `0x${string}`;
    const topics = (log.topics ?? []) as Hex[];
    const data = (log.data ?? "0x") as Hex;

    const entry: DecodedLogEntry = {
      logIndex: typeof idx === "number" ? idx : Number(idx),
      address: addr,
      topics,
      data,
    };

    const topic0 = topics[0];
    const transferTopic =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    if (topic0?.toLowerCase() === transferTopic && topics.length >= 3) {
      try {
        const decoded = safeDecodeEventLog({
          abi: erc20Abi,
          data,
          topics: topics as [Hex, ...Hex[]],
        });
        if (decoded?.args) {
          const { from, to, value } = decoded.args as unknown as {
            from: `0x${string}`;
            to: `0x${string}`;
            value: bigint;
          };
          entry.erc20Transfer = { from, to, value };
        }
      } catch {
        /* ignore */
      }
    }

    const abi = abiByAddress.get(addr.toLowerCase());
    if (abi && topic0) {
      const decoded = safeDecodeEventLog({
        abi,
        data,
        topics: topics as [Hex, ...Hex[]],
      });
      if (decoded?.eventName) {
        entry.eventName = decoded.eventName;
        entry.args = decoded.args as unknown as Record<string, unknown>;
      }
    }

    out.push(entry);
  }

  return out;
}
