import { moonbeam, base, optimism } from "viem/chains";
import { createPublicClient, http } from "viem";

export interface ContractCall {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  blockNumber?: bigint;
  args: readonly any[];
}

// For Cloudflare Workers, environment variables are accessed through the global env object
// We'll define these clients as functions that take the env object
export const createClients = (env: any) => {
  const moonbeamRpcUrl = env?.MOONBEAM_RPC_URL;
  const baseRpcUrl = env?.BASE_RPC_URL;
  const optimismRpcUrl = env?.OPTIMISM_RPC_URL;
  
  if (!moonbeamRpcUrl) {
    console.warn("⚠️ MOONBEAM_RPC_URL not set. Using public RPC endpoint for Moonbeam. Set MOONBEAM_RPC_URL for better reliability.");
  }
  
  if (!baseRpcUrl) {
    console.warn("⚠️ BASE_RPC_URL not set. Using public RPC endpoint for Base. Set BASE_RPC_URL for better reliability.");
  }
  
  if (!optimismRpcUrl) {
    console.warn("⚠️ OPTIMISM_RPC_URL not set. Using public RPC endpoint for Optimism. Set OPTIMISM_RPC_URL for better reliability.");
  }
  
  return {
    moonbeamClient: createPublicClient({
      chain: moonbeam,
      transport: http(moonbeamRpcUrl),
    }),
    
    baseClient: createPublicClient({
      chain: base,
      transport: http(baseRpcUrl),
    }),
    
    optimismClient: createPublicClient({
      chain: optimism,
      transport: http(optimismRpcUrl),
    })
  };
};

// Default clients for backward compatibility
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