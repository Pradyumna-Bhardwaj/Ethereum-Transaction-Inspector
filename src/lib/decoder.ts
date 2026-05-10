import {
  decodeFunctionData,
  decodeEventLog,
  type Abi,
  type Hex,
  type Log,
} from "viem";

export function safeDecodeFunctionData(abi: Abi, data: Hex) {
  try {
    return decodeFunctionData({ abi, data });
  } catch {
    return null;
  }
}

export function safeDecodeEventLog(params: {
  abi: Abi;
  data: Hex;
  topics: [Hex, ...Hex[]];
}) {
  try {
    return decodeEventLog(params);
  } catch {
    return null;
  }
}

export function collectUniqueLogAddresses(logs: Log[]): `0x${string}`[] {
  const set = new Set<string>();
  for (const log of logs) {
    if (log.address) set.add(log.address.toLowerCase());
  }
  return [...set] as `0x${string}`[];
}
