import type { Chain } from "viem";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "viem/chains";

export type SupportedChain = Chain & {
  /** Human label for selectors */
  label: string;
};

/** Etherscan unified API v2 — requires `chainid` on each request ([migration](https://docs.etherscan.io/v2-migration)). */
export const ETHERSCAN_V2_API_BASE =
  process.env.NEXT_PUBLIC_ETHERSCAN_API_URL?.replace(/\/$/, "") ??
  "https://api.etherscan.io/v2/api";

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    ...mainnet,
    label: "Ethereum",
  },
  {
    ...sepolia,
    label: "Sepolia",
  },
  {
    ...arbitrum,
    label: "Arbitrum One",
  },
  {
    ...optimism,
    label: "Optimism",
  },
  {
    ...base,
    label: "Base",
  },
  {
    ...polygon,
    label: "Polygon",
  },
];

export function getChainById(chainId: number): SupportedChain | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

/** Best-effort explorer base URL for external links */
export function explorerTxUrl(chainId: number, txHash: string): string {
  const bases: Record<number, string> = {
    [mainnet.id]: "https://etherscan.io",
    [sepolia.id]: "https://sepolia.etherscan.io",
    [arbitrum.id]: "https://arbiscan.io",
    [optimism.id]: "https://optimistic.etherscan.io",
    [base.id]: "https://basescan.org",
    [polygon.id]: "https://polygonscan.com",
  };
  const baseUrl = bases[chainId] ?? "https://etherscan.io";
  return `${baseUrl}/tx/${txHash}`;
}

export function explorerAddressUrl(chainId: number, address: string): string {
  const bases: Record<number, string> = {
    [mainnet.id]: "https://etherscan.io",
    [sepolia.id]: "https://sepolia.etherscan.io",
    [arbitrum.id]: "https://arbiscan.io",
    [optimism.id]: "https://optimistic.etherscan.io",
    [base.id]: "https://basescan.org",
    [polygon.id]: "https://polygonscan.com",
  };
  const baseUrl = bases[chainId] ?? "https://etherscan.io";
  return `${baseUrl}/address/${address}`;
}
