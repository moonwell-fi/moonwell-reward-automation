import { moonbeam, base, optimism } from "viem/chains";
import { createPublicClient, http } from "viem";

export interface ContractCall {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  blockNumber?: bigint;
  args: readonly any[];
}

export const moonbeamClient = createPublicClient({
  chain: moonbeam,
  transport: http(),
});

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const optimismClient = createPublicClient({
  chain: optimism,
  transport: http(),
});