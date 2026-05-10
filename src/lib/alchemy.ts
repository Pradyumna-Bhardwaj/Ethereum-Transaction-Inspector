import { createPublicClient, http, type Chain, type PublicClient } from "viem";

const clients = new Map<number, PublicClient>();

function rpcUrlForChain(chainId: number): string | undefined {
  const env = process.env as Record<string, string | undefined>;
  const specific: Record<number, string | undefined> = {
    1: env.NEXT_PUBLIC_RPC_MAINNET ?? env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
    11155111:
      env.NEXT_PUBLIC_RPC_SEPOLIA ??
      env.NEXT_PUBLIC_ALCHEMY_RPC_SEPOLIA ??
      env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
    42161: env.NEXT_PUBLIC_RPC_ARBITRUM,
    10: env.NEXT_PUBLIC_RPC_OPTIMISM,
    8453: env.NEXT_PUBLIC_RPC_BASE,
    137: env.NEXT_PUBLIC_RPC_POLYGON,
  };
  return specific[chainId];
}

export function getPublicClient(chain: Chain): PublicClient {
  const existing = clients.get(chain.id);
  if (existing) return existing;

  const url = rpcUrlForChain(chain.id);
  if (!url) {
    throw new Error(
      `No RPC URL configured for chain ${chain.id}. Set NEXT_PUBLIC_RPC_* or NEXT_PUBLIC_ALCHEMY_RPC_URL in .env.local.`,
    );
  }

  const client = createPublicClient({
    chain,
    transport: http(url),
  });
  clients.set(chain.id, client);
  return client;
}

export function hasRpcForChain(chainId: number): boolean {
  return Boolean(rpcUrlForChain(chainId));
}
