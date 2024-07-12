import { moonbeam, base } from "viem/chains";
import { createPublicClient, http } from "viem";

import { moonbeamComptroller, baseComptroller, excludedMarkets } from "./config";
import { comptrollerv1ABI, comptrollerv2ABI } from "./constants";

const moonbeamClient = createPublicClient({
  chain: moonbeam,
  transport: http(),
});

const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

async function filterExcludedMarkets(markets: string[], chainId: number): Promise < string[] > {
  const excludedAddresses = excludedMarkets
    .filter(market => market.chainId === chainId)
    .map(market => market.address);
  return markets.filter(market => !excludedAddresses.includes(market));
}

async function getMoonbeamMarkets() {
  const markets = await moonbeamClient.readContract({
    address: moonbeamComptroller,
    abi: comptrollerv1ABI,
    functionName: "getAllMarkets",
  });
  return await filterExcludedMarkets(markets as string[], 1284);
}

async function getBaseMarkets() {
  const markets = await baseClient.readContract({
    address: baseComptroller,
    abi: comptrollerv2ABI,
    functionName: "getAllMarkets",
  });
  return await filterExcludedMarkets(markets as string[], 8453);
}

export async function getMarkets() {
  const moonbeamMarkets = await getMoonbeamMarkets();
  const baseMarkets = await getBaseMarkets();
  let response = {
    1284: moonbeamMarkets,
    8453: baseMarkets,
  };
  return response;
};
