import { formatEther, formatGwei } from "viem";

export function formatWeiEth(wei: bigint): string {
  try {
    const s = formatEther(wei);
    const n = Number(s);
    if (!Number.isFinite(n)) return `${wei.toString()} wei`;
    if (n === 0) return "0 ETH";
    if (n < 0.000001) return `${s} ETH`;
    return `${Number(s).toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
  } catch {
    return `${wei.toString()} wei`;
  }
}

export function formatGweiSafe(wei: bigint): string {
  try {
    return `${formatGwei(wei)} gwei`;
  } catch {
    return wei.toString();
  }
}

export function formatBigIntPretty(value: bigint): string {
  return value.toLocaleString();
}
