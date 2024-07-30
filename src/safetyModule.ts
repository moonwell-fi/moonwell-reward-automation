import { formatUnits } from "viem";
import { ContractCall, moonbeamClient, baseClient, optimismClient } from "./utils";

import {
  moonbeamViewsContract,
  baseViewsContract,
  optimismViewsContract,
} from "./config";

export async function getSafetyModuleData(
  chain: string,
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
        args: [],
      };
      break;
    case "base":
      client = baseClient;
      viewsContract = baseViewsContract;
      contractCall = {
        ...viewsContract,
        functionName: "getStakingInfo",
        args: [],
      };
      break;
    case "optimism":
      client = optimismClient;
      viewsContract = optimismViewsContract;
      contractCall = {
        ...viewsContract,
        functionName: "getStakingInfo",
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

export async function getSafetyModuleDataForAllChains() {
  const moonbeamSafetyModuleData = await getSafetyModuleData("moonbeam");
  const baseSafetyModuleData = await getSafetyModuleData("base");
  const optimismSafetyModuleData = await getSafetyModuleData("optimism");

  return {
    moonbeam: moonbeamSafetyModuleData,
    base: baseSafetyModuleData,
    optimism: optimismSafetyModuleData,
  };
};