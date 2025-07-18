import { formatUnits } from "viem";
import { ContractCall, moonbeamClient as defaultMoonbeamClient, baseClient as defaultBaseClient, optimismClient as defaultOptimismClient } from "./utils";

// These will be set in getSafetyModuleDataForAllChains
let moonbeamClient = defaultMoonbeamClient;
let baseClient = defaultBaseClient;
let optimismClient = defaultOptimismClient;

import {
  moonbeamViewsContract,
  baseViewsContract,
  optimismViewsContract,
} from "./config";

export async function getSafetyModuleData(
  chain: string,
  blockNumber: bigint
) {
  let client;
  let viewsContract;
  let contractCall: ContractCall;
  switch (chain) {
    case "moonbeam":
      client = moonbeamClient;
      viewsContract = moonbeamViewsContract;
      contractCall = {
        ...viewsContract,
        functionName: "getStakingInfo",
        blockNumber: blockNumber,
        args: [],
      };
      break;
    case "base":
      client = baseClient;
      viewsContract = baseViewsContract;
      contractCall = {
        ...viewsContract,
        functionName: "getStakingInfo",
        blockNumber: blockNumber,
        args: [],
      };
      break;
    case "optimism":
      client = optimismClient;
      viewsContract = optimismViewsContract;
      contractCall = {
        ...viewsContract,
        functionName: "getStakingInfo",
        blockNumber: blockNumber,
        args: [],
      };
      break;
    default:
      throw new Error("Invalid chain");
  };

  const result = await client.readContract(contractCall);
  const data = result as any;

  return {
    emissionPerSecond: data.emissionPerSecond,
    totalSupply: data.totalSupply,
    totalSupplyTokens: Number(formatUnits(data.totalSupply, 18)).toFixed(2),
    currentStakingApr: (data.totalSupply === 0n)
      ? 0
      : formatUnits(
        BigInt(data.emissionPerSecond)
          * BigInt(86400)
          * BigInt(365)
          * BigInt(10000)
          / (BigInt(data.totalSupply) - BigInt(data.emissionPerSecond)),
        4
      ),
  };
};

export async function getSafetyModuleDataForAllChains(
  moonbeamBlockNumber: bigint,
  baseBlockNumber: bigint,
  optimismBlockNumber: bigint,
  env?: any
) {
  // If environment variables are provided, create clients with them
  if (env) {
    const { createClients } = await import('./utils');
    const clients = createClients(env);
    moonbeamClient = clients.moonbeamClient;
    baseClient = clients.baseClient;
    optimismClient = clients.optimismClient;
  }
  const moonbeamSafetyModuleData = await getSafetyModuleData("moonbeam", moonbeamBlockNumber);
  const baseSafetyModuleData = await getSafetyModuleData("base", baseBlockNumber);
  const optimismSafetyModuleData = await getSafetyModuleData("optimism", optimismBlockNumber);

  return {
    moonbeam: moonbeamSafetyModuleData,
    base: baseSafetyModuleData,
    optimism: optimismSafetyModuleData,
  };
};