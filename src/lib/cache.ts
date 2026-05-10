/**
 * Simple in-memory caches to reduce duplicate RPC / Etherscan traffic.
 * Scoped to the browser session (tab lifetime).
 */

const abiCache = new Map<string, ABIcacheEntry>();
const txBundleCache = new Map<string, TxBundleEntry>();

type ABIcacheEntry =
  | { status: "hit"; abi: unknown[] | null; fetchedAt: number }
  | { status: "miss"; fetchedAt: number };

type TxBundleEntry = {
  key: string;
  payload: unknown;
  fetchedAt: number;
};

const TX_TTL_MS = 60_000;

export function abiCacheKey(chainId: number, address: string) {
  return `${chainId}:${address.toLowerCase()}`;
}

export function getCachedAbi(chainId: number, address: string) {
  return abiCache.get(abiCacheKey(chainId, address));
}

export function setCachedAbi(
  chainId: number,
  address: string,
  abi: unknown[] | null,
) {
  abiCache.set(abiCacheKey(chainId, address), {
    status: "hit",
    abi,
    fetchedAt: Date.now(),
  });
}

export function cacheTxBundleKey(chainId: number, hash: string) {
  return `${chainId}:${hash.toLowerCase()}`;
}

export function getCachedTxBundle(chainId: number, hash: string) {
  const entry = txBundleCache.get(cacheTxBundleKey(chainId, hash)) as
    | TxBundleEntry
    | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > TX_TTL_MS) {
    txBundleCache.delete(cacheTxBundleKey(chainId, hash));
    return undefined;
  }
  return entry.payload;
}

export function setCachedTxBundle(chainId: number, hash: string, payload: unknown) {
  txBundleCache.set(cacheTxBundleKey(chainId, hash), {
    key: cacheTxBundleKey(chainId, hash),
    payload,
    fetchedAt: Date.now(),
  });
}
