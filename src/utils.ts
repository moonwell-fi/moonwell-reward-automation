import { moonbeam, base, optimism } from "viem/chains";
import { createPublicClient, http, formatUnits } from "viem";
import { marketConfigs } from "./config";

import {
  moonbeamComptroller,
  baseComptroller,
  optimismComptroller,
  moonbeamOracleContract,
  baseOracleContract,
  optimismOracleContract,
  excludedMarkets
} from "./config";

import { mTokenv1ABI, mTokenv2ABI } from "./constants";

const moonbeamClient = createPublicClient({
  chain: moonbeam,
  transport: http(),
});

const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

const optimismClient = createPublicClient({
  chain: optimism,
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
    ...moonbeamComptroller,
    functionName: "getAllMarkets",
  });
  return await filterExcludedMarkets(markets as string[], 1284);
}

async function getBaseMarkets() {
  const markets = await baseClient.readContract({
    ...baseComptroller,
    functionName: "getAllMarkets",
  });
  return await filterExcludedMarkets(markets as string[], 8453);
}

async function getOptimismMarkets() {
  const markets = await optimismClient.readContract({
    ...optimismComptroller,
    functionName: "getAllMarkets",
  });
  return await filterExcludedMarkets(markets as string[], 10);
}

export async function getMarketData() {
  const moonbeamMarkets = await getMoonbeamMarkets();
  const baseMarkets = await getBaseMarkets();
  const optimismMarkets = await getOptimismMarkets();

  if (!moonbeamMarkets.length || !baseMarkets.length || !optimismMarkets.length) {
    throw new Error("No markets found");
  }

  const moonbeamNames = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.nameOverride : null;
  });

  const baseNames = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.nameOverride : null;
  });

  const optimismNames = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.nameOverride : null;
  });

  const moonbeamDigits = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.digits : null;
  });

  const baseDigits = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.digits : null;
  });

  const optimismDigits = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.digits : null;
  });

  const moonbeamBoosts = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.boost : null;
  });

  const baseBoosts = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.boost : null;
  });

  const optimismBoosts = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.boost : null;
  });

  const moonbeamDeboosts = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.deboost : null;
  });

  const baseDeboosts = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.deboost : null;
  });

  const optimismDeboosts = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.deboost : null;
  });

  const moonbeamEnabled = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.enabled : null;
  });

  const baseEnabled = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.enabled : null;
  });

  const optimismEnabled = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.enabled : null;
  });

  const moonbeamPrices = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      ...moonbeamOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    })),
  })).map((price) => BigInt(price.result ?? 0));

  const basePrices = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      ...baseOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    })),
  })).map((price) => BigInt(price.result ?? 0));

  const optimismPrices = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      ...optimismOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    })),
  })).map((price) => BigInt(price.result ?? 0));

  const moonbeamSupplies = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "totalSupply",
    })),
  })).map((supply) => supply.result as bigint);

  const baseSupplies = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
    })),
  })).map((supply) => supply.result as bigint);

  const optimismSupplies = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
    })),
  })).map((supply) => supply.result as bigint);

  const moonbeamBorrows = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "totalBorrows",
    })),
  })).map((borrow) => BigInt(borrow.result ?? 0));

  const baseBorrows = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    })),
  })).map((borrow) => BigInt(borrow.result ?? 0));

  const optimismBorrows = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    })),
  })).map((borrow) => BigInt(borrow.result ?? 0));

  const moonbeamExchangeRates = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "exchangeRateStored",
    })),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const baseExchangeRates = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    })),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const optimismExchangeRates = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    })),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const formatResults = (
    markets: any,
    names: any,
    digits: number[],
    boosts: any,
    deboosts: any,
    enabled: any,
    prices: bigint[],
    supplies: bigint[],
    borrows: bigint[],
    exchangeRates: any
  ) => markets.map((market: any, index: any) => ({
      market,
      name: names[index],
      digits: digits[index],
      boost: boosts[index],
      deboost: deboosts[index],
      enabled: enabled[index],
      underlyingPrice: formatUnits(prices[index] as bigint, 36 - digits[index] as number),
      totalSupply: formatUnits(supplies[index] as bigint, 8),
      exchangeRate:
        formatUnits(
          exchangeRates[index] as bigint,
          18 + digits[index] as number - 8
        ), // 18 + market digits - mToken digits (8)
      totalSupplyUnderlying:
        Number(formatUnits(supplies[index], 8)) *
        Number(formatUnits(exchangeRates[index] as bigint,
          18 + digits[index] as number - 8
        )),
      totalBorrowsUnderlying:
        Number(
          formatUnits(
            borrows[index] as bigint,
            digits[index] as number
        )),
      totalSupplyUSD:
        Number(formatUnits(supplies[index], 8)) *
        Number(formatUnits(exchangeRates[index] as bigint,
          18 + digits[index] as number - 8
        )) *
        Number(formatUnits(prices[index] as bigint, 36 - digits[index] as number)),
      totalBorrowsUSD:
        Number(
          formatUnits(
            borrows[index] as bigint,
            digits[index] as number
          )) *
        Number(formatUnits(prices[index] as bigint, 36 - digits[index] as number)),
  }));

  return {
    10: formatResults(
      optimismMarkets,
      optimismNames,
      optimismDigits.filter((digit): digit is number => digit !== null),
      optimismBoosts,
      optimismDeboosts,
      optimismEnabled,
      optimismPrices,
      optimismSupplies,
      optimismBorrows,
      optimismExchangeRates
    ),
    1284: formatResults(
      moonbeamMarkets,
      moonbeamNames,
      moonbeamDigits.filter((digit): digit is number => digit !== null),
      moonbeamBoosts,
      moonbeamDeboosts,
      moonbeamEnabled,
      moonbeamPrices,
      moonbeamSupplies,
      moonbeamBorrows,
      moonbeamExchangeRates
    ),
    8453: formatResults(
      baseMarkets,
      baseNames,
      baseDigits.filter((digit): digit is number => digit !== null),
      baseBoosts,
      baseDeboosts,
      baseEnabled,
      basePrices,
      baseSupplies,
      baseBorrows,
      baseExchangeRates
    ),
  };
}
