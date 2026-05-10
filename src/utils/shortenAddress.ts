import type { Hex } from "viem";

export function shortenAddress(addr: string, chars = 4): string {
  const a = addr.trim();
  if (!a.startsWith("0x") || a.length < 2 + chars * 2) return a;
  return `${a.slice(0, 2 + chars)}…${a.slice(-chars)}`;
}

export function shortenHash(hash: string, chars = 6): string {
  const h = hash.trim();
  if (!h.startsWith("0x") || h.length < 2 + chars * 2) return h;
  return `${h.slice(0, 2 + chars)}…${h.slice(-chars)}`;
}

export function isHexHash(value: string): value is Hex {
  const v = value.trim();
  return /^0x([0-9a-fA-F]{64})$/.test(v);
}
