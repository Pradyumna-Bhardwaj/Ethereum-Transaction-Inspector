import { erc20Abi } from "viem";
import type { PublicClient } from "viem";
import type { TokenTransferRow } from "@/lib/txParser";
import type { DecodedLogEntry } from "@/utils/decodeLogs";

export async function collectTokenTransfers(
  client: PublicClient,
  logs: DecodedLogEntry[],
): Promise<TokenTransferRow[]> {
  const out: TokenTransferRow[] = [];

  for (const log of logs) {
    if (!log.erc20Transfer) continue;
    const { from, to, value } = log.erc20Transfer;
    const token = log.address;

    let symbol: string | undefined;
    let decimals: number | undefined;
    try {
      const sym = await client.readContract({
        address: token,
        abi: erc20Abi,
        functionName: "symbol",
      });
      symbol = typeof sym === "string" ? sym : String(sym as unknown);
      const dec = await client.readContract({
        address: token,
        abi: erc20Abi,
        functionName: "decimals",
      });
      decimals = Number(dec);
    } catch {
      /* metadata optional */
    }

    out.push({ token, from, to, value, symbol, decimals });
  }

  return out;
}
