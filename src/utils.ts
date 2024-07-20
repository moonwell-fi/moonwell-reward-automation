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
  baseMultiRewardDistributor,
  optimismMultiRewardDistributor,
  xWellToken,
  baseNativeToken,
  optimismNativeToken,
  aeroMarketContract,
  excludedMarkets
} from "./config";

import { mTokenv1ABI, mTokenv2ABI } from "./constants";

interface ContractCall {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  args: readonly any[];
}

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
    args: [],
  } as ContractCall);
  return await filterExcludedMarkets(markets as string[], 1284);
}

async function getBaseMarkets() {
  const markets = await baseClient.readContract({
    ...baseComptroller,
    functionName: "getAllMarkets",
    args: [],
  } as ContractCall);
  return await filterExcludedMarkets(markets as string[], 8453);
}

async function getOptimismMarkets() {
  const markets = await optimismClient.readContract({
    ...optimismComptroller,
    functionName: "getAllMarkets",
    args: [],
  } as ContractCall);
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
    } as ContractCall)),
  })).map((price) => price.result as bigint);

  const basePrices = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      ...baseOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  })).map((price) => price.result as bigint);

  const optimismPrices = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      ...optimismOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  })).map((price) =>price.result as bigint);

  const ethPrice = basePrices.find(
    (price, index) => baseMarkets[index] === marketConfigs[8453].find(config => config.nameOverride === 'ETH')?.address
  ) || 0;

  const wellPrice = (await baseClient.readContract({
    ...aeroMarketContract,
    functionName: "quote",
    args: [xWellToken.address, BigInt(1e18), BigInt(1)],
  })) * BigInt(ethPrice) as bigint;

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
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const optimismSupplies = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const moonbeamBorrows = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "totalBorrows",
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const baseBorrows = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const optimismBorrows = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const moonbeamExchangeRates = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "exchangeRateStored",
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const baseExchangeRates = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const optimismExchangeRates = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const moonbeamWellSupplySpeeds = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "supplyRewardSpeeds",
      args: [0, market], // 0 = WELL
    } as ContractCall)),
  })).map((supplyRewardSpeed) => supplyRewardSpeed.result as bigint);

  const moonbeamWellBorrowSpeeds = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "borrowRewardSpeeds",
      args: [0, market], // 0 = WELL
    } as ContractCall)),
  })).map((borrowRewardSpeed) => borrowRewardSpeed.result as bigint);

  const baseWellSupplySpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? result.supplyEmissionsPerSec : BigInt(0);
  });

  const baseWellBorrowSpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? result.borrowEmissionsPerSec : BigInt(0);
  });

  const optimismWellSupplySpeeds = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? result.supplyEmissionsPerSec : BigInt(0);
  });

  const optimismWellBorrowSpeeds = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? result.borrowEmissionsPerSec : BigInt(0);
  });

  const moonbeamNativeSupplySpeeds = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "supplyRewardSpeeds",
      args: [1, market], // 1 = GLMR (native token)
    } as ContractCall)),
  })).map((supplyRewardSpeed) => supplyRewardSpeed.result as bigint);

  const baseNativeSupplySpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, baseNativeToken],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? result.supplyEmissionsPerSec : BigInt(0);
  });

  const optimismNativeSupplySpeeds = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, optimismNativeToken],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? result.supplyEmissionsPerSec : BigInt(0);
  });

  const moonbeamNativeBorrowSpeeds = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "borrowRewardSpeeds",
      args: [1, market], // 1 = GLMR (native token)
    } as ContractCall)),
  })).map((borrowRewardSpeed) => borrowRewardSpeed.result as bigint);

  const baseNativeBorrowSpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, baseNativeToken],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? result.borrowEmissionsPerSec : BigInt(0);
  });

  const optimismNativeBorrowSpeeds = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, optimismNativeToken],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? result.borrowEmissionsPerSec : BigInt(0);
  });

  const formatResults = (
    markets: any,
    chainId: number,
    names: any,
    digits: number[],
    boosts: any,
    deboosts: any,
    enabled: any,
    prices: bigint[],
    supplies: bigint[],
    borrows: bigint[],
    exchangeRates: any,
    wellSupplySpeeds: bigint[],
    wellBorrowSpeeds: bigint[],
    nativeSupplySpeeds: bigint[],
    nativeBorrowSpeeds: bigint[],
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
        wellSupplySpeeds:
          Number(
            formatUnits(
              wellSupplySpeeds[index] as bigint,
              18 // WELL is 18 decimals
          )),
        wellBorrowSpeeds:
          Number(
            formatUnits(
              wellBorrowSpeeds[index],
              18 // WELL is 18 decimals
          )),
        nativeSupplySpeeds:
          chainId === 1284 // Moonbeam
          ? Number(
              formatUnits(
                nativeSupplySpeeds[index],
                18 // GLMR is 18 decimals
            ))
          : Number(
              formatUnits(
                nativeSupplySpeeds[index],
                digits[index] as number
            )),
          nativeBorrowSpeeds:
            chainId === 1284 // Moonbeam
            ? Number(
                formatUnits(
                  nativeBorrowSpeeds[index],
                  18 // GLMR is 18 decimals
              ))
            : Number(
                formatUnits(
                  nativeBorrowSpeeds[index],
                  digits[index] as number
              )),
  }));

  return {
    10: formatResults(
      optimismMarkets,
      10,
      optimismNames,
      optimismDigits.filter((digit): digit is number => digit !== null),
      optimismBoosts,
      optimismDeboosts,
      optimismEnabled,
      optimismPrices,
      optimismSupplies,
      optimismBorrows,
      optimismExchangeRates,
      optimismWellSupplySpeeds,
      optimismWellBorrowSpeeds,
      optimismNativeSupplySpeeds,
      optimismNativeBorrowSpeeds,
    ),
    1284: formatResults(
      moonbeamMarkets,
      1284,
      moonbeamNames,
      moonbeamDigits.filter((digit): digit is number => digit !== null),
      moonbeamBoosts,
      moonbeamDeboosts,
      moonbeamEnabled,
      moonbeamPrices,
      moonbeamSupplies,
      moonbeamBorrows,
      moonbeamExchangeRates,
      moonbeamWellSupplySpeeds,
      moonbeamWellBorrowSpeeds,
      moonbeamNativeSupplySpeeds,
      moonbeamNativeBorrowSpeeds,
    ),
    8453: formatResults(
      baseMarkets,
      8453,
      baseNames,
      baseDigits.filter((digit): digit is number => digit !== null),
      baseBoosts,
      baseDeboosts,
      baseEnabled,
      basePrices,
      baseSupplies,
      baseBorrows,
      baseExchangeRates,
      baseWellSupplySpeeds,
      baseWellBorrowSpeeds,
      baseNativeSupplySpeeds,
      baseNativeBorrowSpeeds,
    ),
    wellPrice: formatUnits(wellPrice, 36), 
  };
}
