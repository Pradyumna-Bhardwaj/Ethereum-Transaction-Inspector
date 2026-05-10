import { getCachedAbi, setCachedAbi } from "@/lib/cache";
import {
  ETHERSCAN_V2_API_BASE,
  type SupportedChain,
} from "@/lib/constants";

export type EtherscanAbiResult =
  | { ok: true; abi: unknown[] }
  | { ok: false; reason: string };

/**
 * Fetch verified contract ABI via Etherscan API v2 (unified base URL + chainid).
 * See https://docs.etherscan.io/v2-migration — API key is public for this demo app.
 */
export async function fetchContractAbi(
  chain: SupportedChain,
  address: `0x${string}`,
): Promise<EtherscanAbiResult> {
  const cached = getCachedAbi(chain.id, address);
  if (cached?.status === "hit") {
    if (cached.abi === null) {
      return { ok: false, reason: "Contract not verified (cached)" };
    }
    return { ok: true, abi: cached.abi };
  }

  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason:
        "Missing NEXT_PUBLIC_ETHERSCAN_API_KEY — add it to decode verified contracts.",
    };
  }

  const url = new URL(ETHERSCAN_V2_API_BASE);
  url.searchParams.set("chainid", String(chain.id));
  url.searchParams.set("module", "contract");
  url.searchParams.set("action", "getabi");
  url.searchParams.set("address", address);
  url.searchParams.set("apikey", apiKey);

  let json: {
    status?: string;
    message?: string;
    result?: string;
  };
  try {
    const res = await fetch(url.toString());
    json = (await res.json()) as typeof json;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, reason: `Etherscan request failed: ${msg}` };
  }

  if (json.status !== "1" || typeof json.result !== "string") {
    const hint =
      typeof json.result === "string" ? json.result : json.message ?? "Unknown";
    setCachedAbi(chain.id, address, null);
    return {
      ok: false,
      reason: hint.includes("not verified")
        ? "Contract source is not verified on the explorer."
        : hint,
    };
  }

  try {
    const abi = JSON.parse(json.result) as unknown[];
    if (!Array.isArray(abi)) {
      setCachedAbi(chain.id, address, null);
      return { ok: false, reason: "Unexpected ABI format from explorer." };
    }
    setCachedAbi(chain.id, address, abi);
    return { ok: true, abi };
  } catch {
    setCachedAbi(chain.id, address, null);
    return { ok: false, reason: "Failed to parse ABI JSON from explorer." };
  }
}
