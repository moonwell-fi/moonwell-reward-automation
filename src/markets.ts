import { formatUnits } from "viem";
import { ContractCall, moonbeamClient, baseClient, optimismClient } from "./utils";
import { mainConfig, marketConfigs } from "./config";

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
  moonbeamViewsContract,
  baseViewsContract,
  excludedMarkets
} from "./config";

import { mTokenv1ABI, mTokenv2ABI } from "./constants";
import { base, moonbeam, optimism } from "viem/chains";

/* function convertApy(apy: bigint) {
  const SECONDS_PER_DAY = 86400;
  const DAYS_PER_YEAR = 365;

  const apyBigNumber = new BigNumber(apy.toString());

  const finalApy = apyBigNumber
    .times(SECONDS_PER_DAY)
    .plus(1)
    .pow(DAYS_PER_YEAR)
    .minus(1)
    .times(100);

  return finalApy.toFixed(2);
} */

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

  const moonbeamSupplyRatios = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.supply : null;
  });

  const baseSupplyRatios = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.supply : null;
  });

  const optimismSupplyRatios = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.supply : null;
  });

  const moonbeamBorrowRatios = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.borrow : null;
  });

  const baseBorrowRatios = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.borrow : null;
  });

  const optimismBorrowRatios = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.borrow : null;
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

  const moonbeamNativePrice = formatUnits(
    moonbeamPrices[
      moonbeamMarkets.findIndex(
        (market) =>
          moonbeamNames[moonbeamMarkets.indexOf(market)] === "GLMR"
      ) 
    ], (36 - 18));

  const basePrices = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      ...baseOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  })).map((price) => price.result as bigint);

  const baseNativePrice = formatUnits(
    basePrices[
      baseMarkets.findIndex(
        (market) =>
          baseNames[baseMarkets.indexOf(market)] === "USDC"
      )
    ], (36 - 6));

  const optimismPrices = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      ...optimismOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  })).map((price) => price.result as bigint);

  const optimismNativePrice = formatUnits(
    optimismPrices[
      optimismMarkets.findIndex(
        (market) =>
          optimismNames[optimismMarkets.indexOf(market)] === "OP"
      )
    ], (36 - 18));

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

  const moonbeamWellSupplyPerDay = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "supplyRewardSpeeds",
      args: [0, market], // 0 = WELL
    } as ContractCall)),
  })).map((supplyRewardSpeed) => (supplyRewardSpeed.result as bigint) * BigInt(86400));

  const moonbeamWellBorrowPerDay = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "borrowRewardSpeeds",
      args: [0, market], // 0 = WELL
    } as ContractCall)),
  })).map((borrowRewardSpeed) => (borrowRewardSpeed.result as bigint) * BigInt(86400));

  const baseWellSupplyPerDay = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? result.supplyEmissionsPerSec * BigInt(86400) : BigInt(0);
  });

  const baseWellBorrowPerDay = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? result.borrowEmissionsPerSec * BigInt(86400) : BigInt(0);
  });

  const optimismWellSupplyPerDay = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? result.supplyEmissionsPerSec * BigInt(86400) : BigInt(0);
  });

  const optimismWellBorrowPerDay = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? result.borrowEmissionsPerSec * BigInt(86400) : BigInt(0);
  });

  const moonbeamNativeSupplyPerDay = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "supplyRewardSpeeds",
      args: [1, market], // 1 = GLMR (native token)
    } as ContractCall)),
  })).map((supplyRewardSpeed) => (supplyRewardSpeed.result as bigint) * BigInt(86400));

  const baseNativeSupplyPerDay = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, baseNativeToken],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? (result.supplyEmissionsPerSec * BigInt(86400)) : BigInt(0);
  });

  const optimismNativeSupplyPerDay = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, optimismNativeToken],
    } as ContractCall)),
  })).map((supplyRewardSpeed) => {
    const result = supplyRewardSpeed.result as { supplyEmissionsPerSec: bigint } | undefined;
    return result ? (result.supplyEmissionsPerSec * BigInt(86400)) : BigInt(0);
  });

  const moonbeamNativeBorrowPerDay = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "borrowRewardSpeeds",
      args: [1, market], // 1 = GLMR (native token)
    } as ContractCall)),
  })).map((borrowRewardSpeed) => (borrowRewardSpeed.result as bigint) * BigInt(86400));

  const baseNativeBorrowPerDay = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, baseNativeToken],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? (result.borrowEmissionsPerSec * BigInt(86400)) : BigInt(0);
  });

  const optimismNativeBorrowPerDay = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, optimismNativeToken],
    } as ContractCall)),
  })).map((borrowRewardSpeed) => {
    const result = borrowRewardSpeed.result as { borrowEmissionsPerSec: bigint } | undefined;
    return result ? (result.borrowEmissionsPerSec * BigInt(86400)) : BigInt(0);
  });

  const moonbeamWellSupplyPerDayUsd = moonbeamWellSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const moonbeamWellBorrowPerDayUsd = moonbeamWellBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const baseWellSupplyPerDayUsd = baseWellSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const baseWellBorrowPerDayUsd = baseWellBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const optimismWellSupplyPerDayUsd = optimismWellSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const optimismWellBorrowPerDayUsd = optimismWellBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const moonbeamNativeSupplyPerDayUsd = moonbeamNativeSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(moonbeamNativePrice)
  );

  const moonbeamNativeBorrowPerDayUsd = moonbeamNativeBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(moonbeamNativePrice)
  );

  const baseNativeSupplyPerDayUsd = baseNativeSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(baseNativePrice)
  );

  const baseNativeBorrowPerDayUsd = baseNativeBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(baseNativePrice)
  );

  const optimismNativeSupplyPerDayUsd = optimismNativeSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(optimismNativePrice)
  );

  const optimismNativeBorrowPerDayUsd = optimismNativeBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(optimismNativePrice)
  );

  const moonbeamTotalSupplyUsd = moonbeamMarkets.map((market, index) => {
    const supply = moonbeamSupplies[index];
    const exchangeRate = moonbeamExchangeRates[index];
    const price = moonbeamPrices[index];
    const digit = moonbeamDigits.filter((digit): digit is number => digit !== null)[index];
  
    return (
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit))
    );
  });
  
  const baseTotalSupplyUsd = baseMarkets.map((market, index) => {
    const supply = baseSupplies[index];
    const exchangeRate = baseExchangeRates[index];
    const price = basePrices[index];
    const digit = baseDigits.filter((digit): digit is number => digit !== null)[index];
  
    return (
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const optimismTotalSupplyUsd = optimismMarkets.map((market, index) => {
    const supply = optimismSupplies[index];
    const exchangeRate = optimismExchangeRates[index];
    const price = optimismPrices[index];
    const digit = optimismDigits.filter((digit): digit is number => digit !== null)[index];
  
    return (
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const moonbeamTotalBorrowsUsd = moonbeamMarkets.map((market, index) => {
    const borrow = moonbeamBorrows[index];
    const price = moonbeamPrices[index];
    const digit = moonbeamDigits.filter((digit): digit is number => digit !== null)[index];
  
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const baseTotalBorrowsUsd = baseMarkets.map((market, index) => {
    const borrow = baseBorrows[index];
    const price = basePrices[index];
    const digit = baseDigits.filter((digit): digit is number => digit !== null)[index];
  
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const optimismTotalBorrowsUsd = optimismMarkets.map((market, index) => {
    const borrow = optimismBorrows[index];
    const price = optimismPrices[index];
    const digit = optimismDigits.filter((digit): digit is number => digit !== null)[index];
  
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  // TODO: Fix Base APYs
  /* const moonbeamSupplyApys = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamViewsContract.address,
      abi: moonbeamViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  })).map((supplyApy) => formatUnits((supplyApy.result as { supplyRate: bigint }).supplyRate, 18))

  const baseSupplyApys = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseViewsContract.address,
      abi: baseViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  })).map((borrowApy) => formatUnits((borrowApy.result as { borrowRate: bigint }).borrowRate, 18))

  const moonbeamBorrowApys = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamViewsContract.address,
      abi: moonbeamViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  })).map((supplyApy) => formatUnits((supplyApy.result as { supplyRate: bigint }).supplyRate, 18))

  const baseBorrowApys = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseViewsContract.address,
      abi: baseViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  })).map((borrowApy) => formatUnits((borrowApy.result as { borrowRate: bigint }).borrowRate, 18))

  // TODO: Optimism APYs once views contract is deployed
  const optimismSupplyApys = Array.from({ length: optimismMarkets.length }, () => String(0));
  const optimismBorrowApys = Array.from({ length: optimismMarkets.length }, () => String(0)); */

  const formatResults = (
    markets: any,
    chainId: number,
    names: any,
    digits: number[],
    boosts: any,
    deboosts: any,
    supply: any,
    borrow: any,
    enabled: any,
    prices: bigint[],
    supplies: bigint[],
    borrows: bigint[],
    suppliesUsd: number[],
    borrowsUsd: number[],
    exchangeRates: any,
    // supplyApys: string[],
    // borrowApys: string[],
    wellSupplyPerDay: bigint[],
    wellBorrowPerDay: bigint[],
    nativeSupplyPerDay: bigint[],
    nativeBorrowPerDay: bigint[],
    wellSupplyPerDayUsd: number[],
    wellBorrowPerDayUsd: number[],
    nativeSupplyPerDayUsd: number[],
    nativeBorrowPerDayUsd: number[],
  ) => markets.map((market: any, index: any) => ({
      market,
      name: names[index],
      digits: digits[index],
      boost: boosts[index],
      deboost: deboosts[index],
      supplyRatio: supply[index],
      borrowRatio: borrow[index],
      enabled: enabled[index],
      underlyingPrice: Number(formatUnits(prices[index] as bigint, 36 - digits[index] as number)),
      totalSupply: Number(formatUnits(supplies[index] as bigint, 8)),
      exchangeRate: Number(
        formatUnits(
          exchangeRates[index] as bigint,
          18 + digits[index] as number - 8
        ), // 18 + market digits - mToken digits (8)
      ),
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
      totalSupplyUSD: Number(suppliesUsd[index].toFixed(2)),
      totalBorrowsUSD: Number(borrowsUsd[index].toFixed(2)),
      // supplyApy: supplyApys[index],
      // borrowApy: borrowApys[index],
      wellSupplyPerDay:
        Number(
          formatUnits(
            wellSupplyPerDay[index] as bigint,
            18 // WELL is 18 decimals
        )).toFixed(18),
      wellBorrowPerDay:
        Number(
          formatUnits(
            wellBorrowPerDay[index],
            18 // WELL is 18 decimals
        )).toFixed(18),
      nativeSupplyPerDay:
        chainId === 1284 // Moonbeam
        ? Number(
            formatUnits(
              nativeSupplyPerDay[index],
              18 // GLMR is 18 decimals
          )).toFixed(18)
        : Number(
            formatUnits(
              nativeSupplyPerDay[index],
              digits[index] as number
          )).toFixed(18),
      nativeBorrowPerDay:
        chainId === 1284 // Moonbeam
        ? Number(
            formatUnits(
              nativeBorrowPerDay[index],
              18 // GLMR is 18 decimals
          )).toFixed(18)
        : Number(
            formatUnits(
              nativeBorrowPerDay[index],
              digits[index] as number
          )).toFixed(18),
      wellSupplyPerDayUsd: Number(wellSupplyPerDayUsd[index].toFixed(2)),
      wellBorrowPerDayUsd: Number(wellBorrowPerDayUsd[index].toFixed(2)),
      nativeSupplyPerDayUsd: Number(nativeSupplyPerDayUsd[index].toFixed(2)),
      nativeBorrowPerDayUsd: Number(nativeBorrowPerDayUsd[index].toFixed(2)),
      wellSupplyApr: Number((
        wellSupplyPerDayUsd[index] 
        / suppliesUsd[index]
        * 365 * 100).toFixed(2)
      ),
      wellBorrowApr: Number((
        wellBorrowPerDayUsd[index]
        / borrowsUsd[index]
        * 365 * 100).toFixed(2),
      ),
      nativeSupplyApr: Number((
        nativeSupplyPerDayUsd[index]
        / suppliesUsd[index]
        * 365 * 100).toFixed(2),
      ),
      nativeBorrowApr: Number((
        nativeBorrowPerDayUsd[index]
        / borrowsUsd[index]
        * 365 * 100).toFixed(2),
      ),
  }));

  return {
    10: formatResults(
      optimismMarkets,
      10,
      optimismNames,
      optimismDigits.filter((digit): digit is number => digit !== null),
      optimismBoosts,
      optimismDeboosts,
      optimismSupplyRatios,
      optimismBorrowRatios,
      optimismEnabled,
      optimismPrices,
      optimismSupplies,
      optimismBorrows,
      optimismTotalSupplyUsd,
      optimismTotalBorrowsUsd,
      optimismExchangeRates,
      // optimismSupplyApys,
      // optimismBorrowApys,
      optimismWellSupplyPerDay,
      optimismWellBorrowPerDay,
      optimismNativeSupplyPerDay,
      optimismNativeBorrowPerDay,
      optimismWellSupplyPerDayUsd,
      optimismWellBorrowPerDayUsd,
      optimismNativeSupplyPerDayUsd,
      optimismNativeBorrowPerDayUsd,
    ),
    1284: formatResults(
      moonbeamMarkets,
      1284,
      moonbeamNames,
      moonbeamDigits.filter((digit): digit is number => digit !== null),
      moonbeamBoosts,
      moonbeamDeboosts,
      moonbeamSupplyRatios,
      moonbeamBorrowRatios,
      moonbeamEnabled,
      moonbeamPrices,
      moonbeamSupplies,
      moonbeamBorrows,
      moonbeamTotalSupplyUsd,
      moonbeamTotalBorrowsUsd,
      moonbeamExchangeRates,
      // moonbeamSupplyApys,
      // moonbeamBorrowApys,
      moonbeamWellSupplyPerDay,
      moonbeamWellBorrowPerDay,
      moonbeamNativeSupplyPerDay,
      moonbeamNativeBorrowPerDay,
      moonbeamWellSupplyPerDayUsd,
      moonbeamWellBorrowPerDayUsd,
      moonbeamNativeSupplyPerDayUsd,
      moonbeamNativeBorrowPerDayUsd,
    ),
    8453: formatResults(
      baseMarkets,
      8453,
      baseNames,
      baseDigits.filter((digit): digit is number => digit !== null),
      baseBoosts,
      baseDeboosts,
      baseSupplyRatios,
      baseBorrowRatios,
      baseEnabled,
      basePrices,
      baseSupplies,
      baseBorrows,
      baseTotalSupplyUsd,
      baseTotalBorrowsUsd,
      baseExchangeRates,
      // baseSupplyApys,
      // baseBorrowApys,
      baseWellSupplyPerDay,
      baseWellBorrowPerDay,
      baseNativeSupplyPerDay,
      baseNativeBorrowPerDay,
      baseWellSupplyPerDayUsd,
      baseWellBorrowPerDayUsd,
      baseNativeSupplyPerDayUsd,
      baseNativeBorrowPerDayUsd,
    ),
    wellPrice: formatUnits(wellPrice, 36),
    glmrPrice: moonbeamNativePrice,
    usdcPrice: baseNativePrice,
    opPrice: optimismNativePrice,
    wellPerEpoch: mainConfig.totalWellPerEpoch,
    moonbeam: mainConfig.moonbeam,
    base: mainConfig.base,
    optimism: mainConfig.optimism,
  };
}
