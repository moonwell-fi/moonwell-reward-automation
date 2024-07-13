import { moonbeam, base } from "viem/chains";
import { createPublicClient, http } from "viem";

import {
  moonbeamComptroller,
  baseComptroller,
  moonbeamOracleContract,
  baseOracleContract,
  excludedMarkets
} from "./config";

import {
  comptrollerv1ABI,
  comptrollerv2ABI,
} from "./constants";

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

export async function getMarketsAndPrices() {
  const moonbeamMarkets = await getMoonbeamMarkets();
  const baseMarkets = await getBaseMarkets();

  if (!moonbeamMarkets.length || !baseMarkets.length) {
    throw new Error("No markets found");
  }

  const moonbeamPrices = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      ...moonbeamOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    })),
  })).map((price) => price.result);

  const basePrices = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      ...baseOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    })),
  })).map((price) => price.result);

  const formatResults = (markets: string[], prices: any) => 
    markets.map((market, index) => ({
      market,
      underlyingPrice: prices[index],
    }));

  return {
    1284: formatResults(moonbeamMarkets, moonbeamPrices),
    8453: formatResults(baseMarkets, basePrices),
  };
}
