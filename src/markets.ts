import { formatUnits } from "viem";
import { ContractCall, moonbeamClient, baseClient, optimismClient } from "./utils";
import { mainConfig, marketConfigs } from "./config";
import { getSafetyModuleDataForAllChains } from "./safetyModule";

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
  optimismViewsContract,
  excludedMarkets
} from "./config";

import { mTokenv1ABI, mTokenv2ABI } from "./constants";
import { optimism } from "viem/chains";

export interface MarketType {
  market: string;
  name: string;
  alias: string;
  digits: number;
  boost: number;
  deboost: number;
  supplyRatio: number;
  borrowRatio: number;
  enabled: boolean;
  underlyingPrice: number;
  totalSupply: number;
  exchangeRate: number;
  totalSupplyUnderlying: number;
  totalBorrowsUnderlying: number;
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  supplyRate: number;
  borrowRate: number;
  currentWellSupplySpeed: number;
  currentWellBorrowSpeed: number;
  currentNativeSupplySpeed: number;
  currentNativeBorrowSpeed: number;
  wellSupplyPerDay: string;
  wellBorrowPerDay: string;
  nativeSupplyPerDay: string;
  nativeBorrowPerDay: string;
  wellSupplyPerDayUsd: number;
  wellBorrowPerDayUsd: number;
  nativeSupplyPerDayUsd: number;
  nativeBorrowPerDayUsd: number;
  supplyApy: number;
  borrowApy: number;
  wellSupplyApr: number;
  wellBorrowApr: number;
  nativeSupplyApr: number;
  nativeBorrowApr: number;
  percentage: number;
  wellPerEpochMarket: number;
  wellPerEpochMarketSupply: number;
  wellPerEpochMarketBorrow: number;
  newWellSupplySpeed: number;
  newWellBorrowSpeed: number;
  newNativeSupplySpeed: number;
  newNativeBorrowSpeed: number;
  newWellSupplyPerDay: number;
  newWellBorrowPerDay: number;
  newNativeSupplyPerDay: number;
  newNativeBorrowPerDay: number;
  newWellSupplyPerDayUsd: number;
  newWellBorrowPerDayUsd: number;
  newNativeSupplyPerDayUsd: number;
  newNativeBorrowPerDayUsd: number;
  wellChangeSupplySpeedPercentage: number;
  wellChangeBorrowSpeedPercentage: number;
  nativeChangeSupplySpeedPercentage: number;
  nativeChangeBorrowSpeedPercentage: number;
}

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

async function filterExcludedMarkets(markets: string[], chainId: number): Promise<string[]> {
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
  const safetyModuleData = await getSafetyModuleDataForAllChains();
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

  const moonbeamAliases = moonbeamMarkets.map(market => {
    const config = marketConfigs[1284].find(config => config.address === market);
    return config ? config.alias : null;
  });

  const baseAliases = baseMarkets.map(market => {
    const config = marketConfigs[8453].find(config => config.address === market);
    return config ? config.alias : null;
  });

  const optimismAliases = optimismMarkets.map(market => {
    const config = marketConfigs[10].find(config => config.address === market);
    return config ? config.alias : null;
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

  // Functions to get emissions per second
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

  const moonbeamMarketInfo = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamViewsContract.address,
      abi: moonbeamViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  }));

  const moonbeamSupplyRates = moonbeamMarketInfo.map((market) => (market.result as { supplyRate: bigint }).supplyRate);
  const moonbeamBorrowRates = moonbeamMarketInfo.map((market) => (market.result as { borrowRate: bigint }).borrowRate);

  const baseMarketInfo = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseViewsContract.address,
      abi: baseViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  }));

  const baseSupplyRates = baseMarketInfo.map((market) => (market.result as { supplyRate: bigint }).supplyRate);
  const baseBorrowRates = baseMarketInfo.map((market) => (market.result as { borrowRate: bigint }).borrowRate);

  const optimismMarketInfo = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismViewsContract.address,
      abi: optimismViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  }));

  const optimismSupplyRates = optimismMarketInfo.map((market) => (market.result as { supplyRate: bigint }).supplyRate);
  const optimismBorrowRates = optimismMarketInfo.map((market) => (market.result as { borrowRate: bigint }).borrowRate);

  const moonbeamWellSupplyPerDay = moonbeamWellSupplySpeeds.map((speed) => speed * BigInt(86400));
  const moonbeamWellBorrowPerDay = moonbeamWellBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const baseWellSupplyPerDay = baseWellSupplySpeeds.map((speed) => speed * BigInt(86400));
  const baseWellBorrowPerDay = baseWellBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const optimismWellSupplyPerDay = optimismWellSupplySpeeds.map((speed) => speed * BigInt(86400));
  const optimismWellBorrowPerDay = optimismWellBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const moonbeamNativeSupplyPerDay = moonbeamNativeSupplySpeeds.map((speed) => speed * BigInt(86400));
  const moonbeamNativeBorrowPerDay = moonbeamNativeBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const baseNativeSupplyPerDay = baseNativeSupplySpeeds.map((speed) => speed * BigInt(86400));
  const baseNativeBorrowPerDay = baseNativeBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const optimismNativeSupplyPerDay = optimismNativeSupplySpeeds.map((speed) => speed * BigInt(86400));
  const optimismNativeBorrowPerDay = optimismNativeBorrowSpeeds.map((speed) => speed * BigInt(86400));

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
    const boost = moonbeamBoosts.filter((boost): boost is number => boost !== null)[index];
    const deboost = moonbeamDeboosts.filter((deboost): deboost is number => deboost !== null)[index];

    return ((
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit)))
      + boost - deboost
    );
  });

  const baseTotalSupplyUsd = baseMarkets.map((market, index) => {
    const supply = baseSupplies[index];
    const exchangeRate = baseExchangeRates[index];
    const price = basePrices[index];
    const digit = baseDigits.filter((digit): digit is number => digit !== null)[index];
    const boost = baseBoosts.filter((boost): boost is number => boost !== null)[index];
    const deboost = baseDeboosts.filter((deboost): deboost is number => deboost !== null)[index];

    return ((
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit)))
      + boost - deboost
    );
  });

  const optimismTotalSupplyUsd = optimismMarkets.map((market, index) => {
    const supply = optimismSupplies[index];
    const exchangeRate = optimismExchangeRates[index];
    const price = optimismPrices[index];
    const digit = optimismDigits.filter((digit): digit is number => digit !== null)[index];
    const boost = optimismBoosts.filter((boost): boost is number => boost !== null)[index];
    const deboost = optimismDeboosts.filter((deboost): deboost is number => deboost !== null)[index];

    return ((
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit)))
      + boost - deboost
    );
  });

  function calculatePercentages(totalSupplyUsd: number[]) {
    const total = totalSupplyUsd.reduce((sum, value) => sum + value, 0);
    return totalSupplyUsd.map(value => value / total);
  }

  const moonbeamPercentages = calculatePercentages(moonbeamTotalSupplyUsd);
  const basePercentages = calculatePercentages(baseTotalSupplyUsd);
  const optimismPercentages = calculatePercentages(optimismTotalSupplyUsd);

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

  function calculateNetworkTotalUSD(
    markets: any[],
    supplies: bigint[],
    exchangeRates: bigint[],
    prices: bigint[],
    digits: number[],
    boosts: number[],
    deboosts: number[],
    borrows: bigint[]
  ) {
    let totalSupplyUSD = 0;
    let totalBorrowsUSD = 0;

    markets.forEach((market, index) => {
      const supply = supplies[index];
      const exchangeRate = exchangeRates[index];
      const price = prices[index];
      const digit = digits[index];
      const boost = boosts[index];
      const deboost = deboosts[index];
      const borrow = borrows[index];

      const supplyUSD =
        Number(formatUnits(supply, 8)) *
        Number(formatUnits(exchangeRate, 18 + digit - 8)) *
        Number(formatUnits(price, 36 - digit));

      const borrowUSD =
        Number(formatUnits(borrow, digit)) *
        Number(formatUnits(price, 36 - digit));

      totalSupplyUSD += supplyUSD + boost - deboost;
      totalBorrowsUSD += borrowUSD;
    });

    return totalSupplyUSD + totalBorrowsUSD;
  }

  const moonbeamNetworkTotalUsd = calculateNetworkTotalUSD(
    moonbeamMarkets,
    moonbeamSupplies,
    moonbeamExchangeRates,
    moonbeamPrices,
    moonbeamDigits.filter((digit): digit is number => digit !== null),
    moonbeamBoosts.filter((boost): boost is number => boost !== null),
    moonbeamDeboosts.filter((deboost): deboost is number => deboost !== null),
    moonbeamBorrows
  );

  const baseNetworkTotalUsd = calculateNetworkTotalUSD(
    baseMarkets,
    baseSupplies,
    baseExchangeRates,
    basePrices,
    baseDigits.filter((digit): digit is number => digit !== null),
    baseBoosts.filter((boost): boost is number => boost !== null),
    baseDeboosts.filter((deboost): deboost is number => deboost !== null),
    baseBorrows
  );

  const optimismNetworkTotalUsd = calculateNetworkTotalUSD(
    optimismMarkets,
    optimismSupplies,
    optimismExchangeRates,
    optimismPrices,
    optimismDigits.filter((digit): digit is number => digit !== null),
    optimismBoosts.filter((boost): boost is number => boost !== null),
    optimismDeboosts.filter((deboost): deboost is number => deboost !== null),
    optimismBorrows
  );

  const moonbeamTotalMarketPercentage = (
    moonbeamNetworkTotalUsd / (moonbeamNetworkTotalUsd + baseNetworkTotalUsd + optimismNetworkTotalUsd)
  );

  const baseTotalMarketPercentage = (
    baseNetworkTotalUsd / (moonbeamNetworkTotalUsd + baseNetworkTotalUsd + optimismNetworkTotalUsd)
  );

  const optimismTotalMarketPercentage = (
    optimismNetworkTotalUsd / (moonbeamNetworkTotalUsd + baseNetworkTotalUsd + optimismNetworkTotalUsd)
  );

  const calculateEpochStartTimestamp = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    let epochStartTimestamp = mainConfig.firstEpochTimestamp;

    while (currentTimestamp >= epochStartTimestamp) {
      epochStartTimestamp += mainConfig.secondsPerEpoch;
    }

    return epochStartTimestamp;
  };

  const moonbeamNewWellSupplySpeeds = moonbeamMarkets.map((market, index) => {
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * moonbeamTotalMarketPercentage
      * mainConfig.moonbeam.markets;
    const percentage = moonbeamPercentages[index];
    const supplyRatio = moonbeamSupplyRatios[index] ?? 0;
    return Number((totalWellPerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);
  });

  const moonbeamNewWellBorrowSpeeds = moonbeamMarkets.map((market, index) => {
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * moonbeamTotalMarketPercentage
      * mainConfig.moonbeam.markets;
    const percentage = moonbeamPercentages[index];
    const borrowRatio = moonbeamBorrowRatios[index] ?? 0;
    const speed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Special case: if speed is 0, return 1e-18 instead
    return speed === 0 ? 1e-18 : speed;
  });

  const baseNewWellSupplySpeeds = baseMarkets.map((market, index) => {
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * baseTotalMarketPercentage
      * mainConfig.base.markets;
    const percentage = basePercentages[index];
    const supplyRatio = baseSupplyRatios[index] ?? 0;
    return Number((totalWellPerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);
  });

  const baseNewWellBorrowSpeeds = baseMarkets.map((market, index) => {
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * baseTotalMarketPercentage
      * mainConfig.base.markets;
    const percentage = basePercentages[index];
    const borrowRatio = baseBorrowRatios[index] ?? 0;
    const speed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Special case: if speed is 0, return 1e-18 instead
    return speed === 0 ? 1e-18 : speed;
  });

  const optimismNewWellSupplySpeeds = optimismMarkets.map((market, index) => {
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * optimismTotalMarketPercentage
      * mainConfig.optimism.markets;
    const percentage = optimismPercentages[index];
    const supplyRatio = optimismSupplyRatios[index] ?? 0;
    return Number((totalWellPerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);
  });

  const optimismNewWellBorrowSpeeds = optimismMarkets.map((market, index) => {
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * optimismTotalMarketPercentage
      * mainConfig.optimism.markets;
    const percentage = optimismPercentages[index];
    const borrowRatio = optimismBorrowRatios[index] ?? 0;
    const speed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Special case: if speed is 0, return 1e-18 instead
    return speed === 0 ? 1e-18 : speed;
  });

  const moonbeamNewNativeSupplySpeeds = moonbeamMarkets.map((market, index) => {
    const totalNativePerEpochMarkets = mainConfig.moonbeam.nativePerEpoch;
    const percentage = moonbeamPercentages[index];
    const supplyRatio = moonbeamSupplyRatios[index] ?? 0;
    return Number((totalNativePerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);
  });

  const moonbeamNewNativeBorrowSpeeds = moonbeamMarkets.map((market, index) => {
    const totalNativePerEpochMarkets = mainConfig.moonbeam.nativePerEpoch;
    const percentage = moonbeamPercentages[index];
    const borrowRatio = moonbeamBorrowRatios[index] ?? 0;
    const speed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Special case: if speed is 0, return 1e-18 instead
    return speed === 0 ? 1e-18 : speed;
  });

  const baseNewNativeSupplySpeeds = baseMarkets.map((market, index) => {
    const totalNativePerEpochMarkets = mainConfig.base.nativePerEpoch;
    const percentage = basePercentages[index];
    const supplyRatio = baseSupplyRatios[index] ?? 0;
    return Number((totalNativePerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);
  });

  const baseNewNativeBorrowSpeeds = baseMarkets.map((market, index) => {
    const totalNativePerEpochMarkets = mainConfig.base.nativePerEpoch;
    const percentage = basePercentages[index];
    const borrowRatio = baseBorrowRatios[index] ?? 0;
    const speed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Special case: if speed is 0, return 1e-6 instead (USDC is 6 digits)
    return speed === 0 ? 1e-6 : speed;
  });

  const optimismNewNativeSupplySpeeds = optimismMarkets.map((market, index) => {
    const totalNativePerEpochMarkets = mainConfig.optimism.nativePerEpoch;
    const percentage = optimismPercentages[index];
    const supplyRatio = optimismSupplyRatios[index] ?? 0;
    return Number((totalNativePerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);
  });

  const optimismNewNativeBorrowSpeeds = optimismMarkets.map((market, index) => {
    const totalNativePerEpochMarkets = mainConfig.optimism.nativePerEpoch;
    const percentage = optimismPercentages[index];
    const borrowRatio = optimismBorrowRatios[index] ?? 0;
    const speed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Special case: if speed is 0, return 1e1-8 instead
    return speed === 0 ? 1e-18 : speed;
  });

  const formatResults = (
    markets: any,
    chainId: number,
    names: any,
    aliases: any,
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
    supplyRates: bigint[],
    borrowRates: bigint[],
    currentWellSupplySpeed: bigint[],
    currentWellBorrowSpeed: bigint[],
    currentNativeSupplySpeed: bigint[],
    currentNativeBorrowSpeed: bigint[],
    wellSupplyPerDay: bigint[],
    wellBorrowPerDay: bigint[],
    nativeSupplyPerDay: bigint[],
    nativeBorrowPerDay: bigint[],
    wellSupplyPerDayUsd: number[],
    wellBorrowPerDayUsd: number[],
    nativeSupplyPerDayUsd: number[],
    nativeBorrowPerDayUsd: number[],
    percentages: number[],
    totalWellPerEpochMarkets: number,
    newWellSupplySpeed: number[],
    newWellBorrowSpeed: number[],
    newNativeSupplySpeed: number[],
    newNativeBorrowSpeed: number[],
    wellPrice: string,
    nativePrice: string,
  ) => markets.map((market: any, index: any) => ({
    market,
    name: names[index],
    alias: aliases[index],
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
    currentWellSupplySpeed: Number(formatUnits(currentWellSupplySpeed[index], 18)),
    currentWellBorrowSpeed: Number(formatUnits(currentWellBorrowSpeed[index], 18)),
    currentNativeSupplySpeed: Number(formatUnits(currentNativeSupplySpeed[index], 18)),
    currentNativeBorrowSpeed: Number(formatUnits(currentNativeBorrowSpeed[index], 18)),
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
    supplyApy: Number(parseFloat(formatUnits(supplyRates[index], 18)) * 60 * 60 * 24 * 365.25).toFixed(2),
    borrowApy: Number(parseFloat(formatUnits(borrowRates[index], 18)) * 60 * 60 * 24 * 365.25).toFixed(2),
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
    percentage: percentages[index],
    wellPerEpochMarket: Number(totalWellPerEpochMarkets * percentages[index]),
    wellPerEpochMarketSupply: Number(totalWellPerEpochMarkets * percentages[index] * supply[index]),
    wellPerEpochMarketBorrow: Number(totalWellPerEpochMarkets * percentages[index] * borrow[index]),
    newWellSupplySpeed: newWellSupplySpeed[index],
    newWellBorrowSpeed: newWellBorrowSpeed[index],
    newNativeSupplySpeed: newNativeSupplySpeed[index],
    newNativeBorrowSpeed: newNativeBorrowSpeed[index],
    newWellSupplyApr: Number((
      (newWellSupplySpeed[index] * 86400 * Number(wellPrice))
      / suppliesUsd[index]
      * 365 * 100).toFixed(2),
    ),
    newWellBorrowApr: Number((
      (newWellBorrowSpeed[index] * 86400 * Number(wellPrice))
      / borrowsUsd[index]
      * 365 * 100).toFixed(2),
    ),
    newNativeSupplyApr: Number((
      (newNativeSupplySpeed[index] * 86400 * Number(nativePrice))
      / suppliesUsd[index]
      * 365 * 100).toFixed(2),
    ),
    newNativeBorrowApr: Number((
      (newNativeBorrowSpeed[index] * 86400 * Number(nativePrice))
      / borrowsUsd[index]
      * 365 * 100).toFixed(2),
    ),
    newWellSupplyPerDay: Number(newWellSupplySpeed[index] * 86400),
    newWellBorrowPerDay: Number(newWellBorrowSpeed[index] * 86400),
    newNativeSupplyPerDay: Number(newNativeSupplySpeed[index] * 86400),
    newNativeBorrowPerDay: Number(newNativeBorrowSpeed[index] * 86400),
    newWellSupplyPerDayUsd: Number((newWellSupplySpeed[index] * 86400 * Number(wellPrice)).toFixed(2)),
    newWellBorrowPerDayUsd: Number((newWellBorrowSpeed[index] * 86400 * Number(wellPrice)).toFixed(2)),
    newNativeSupplyPerDayUsd: Number((newNativeSupplySpeed[index] * 86400 * Number(nativePrice)).toFixed(2)),
    newNativeBorrowPerDayUsd: Number((newNativeBorrowSpeed[index] * 86400 * Number(nativePrice)).toFixed(2)),
    wellChangeSupplySpeedPercentage: Number(
      formatUnits(currentWellSupplySpeed[index], 18) === "0"
        ? 0
        : ((newWellSupplySpeed[index]
          - Number(formatUnits(currentWellSupplySpeed[index], 18))
        ) / Number(formatUnits(currentWellSupplySpeed[index], 18))
          * 100).toFixed(2),
    ),
    wellChangeBorrowSpeedPercentage: Number(
      formatUnits(currentWellBorrowSpeed[index], 18) === "0"
        ? 0
        : ((newWellBorrowSpeed[index]
          - Number(formatUnits(currentWellBorrowSpeed[index], 18))
        ) / Number(formatUnits(currentWellBorrowSpeed[index], 18))
          * 100).toFixed(2),
    ),
    nativeChangeSupplySpeedPercentage: Number(
      formatUnits(currentNativeSupplySpeed[index], 18) === "0"
        ? 0
        : ((newNativeSupplySpeed[index]
          - Number(formatUnits(currentNativeSupplySpeed[index], 18))
        ) / Number(formatUnits(currentNativeSupplySpeed[index], 18))
          * 100).toFixed(2),
    ),
    nativeChangeBorrowSpeedPercentage: Number(
      formatUnits(currentNativeBorrowSpeed[index], 18) === "0"
        ? 0
        : ((newNativeBorrowSpeed[index]
          - Number(formatUnits(currentNativeBorrowSpeed[index], 18))
        ) / Number(formatUnits(currentNativeBorrowSpeed[index], 18))
          * 100).toFixed(2),
    ),
  }));

  return {
    10: formatResults(
      optimismMarkets,
      10,
      optimismNames,
      optimismAliases,
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
      optimismSupplyRates,
      optimismBorrowRates,
      optimismWellSupplySpeeds,
      optimismWellBorrowSpeeds,
      optimismNativeSupplySpeeds,
      optimismNativeBorrowSpeeds,
      optimismWellSupplyPerDay,
      optimismWellBorrowPerDay,
      optimismNativeSupplyPerDay,
      optimismNativeBorrowPerDay,
      optimismWellSupplyPerDayUsd,
      optimismWellBorrowPerDayUsd,
      optimismNativeSupplyPerDayUsd,
      optimismNativeBorrowPerDayUsd,
      optimismPercentages,
      Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.markets),
      optimismNewWellSupplySpeeds,
      optimismNewWellBorrowSpeeds,
      optimismNewNativeSupplySpeeds,
      optimismNewNativeBorrowSpeeds,
      formatUnits(wellPrice, 36),
      optimismNativePrice,
    ),
    1284: formatResults(
      moonbeamMarkets,
      1284,
      moonbeamNames,
      moonbeamAliases,
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
      moonbeamSupplyRates,
      moonbeamBorrowRates,
      moonbeamWellSupplySpeeds,
      moonbeamWellBorrowSpeeds,
      moonbeamNativeSupplySpeeds,
      moonbeamNativeBorrowSpeeds,
      moonbeamWellSupplyPerDay,
      moonbeamWellBorrowPerDay,
      moonbeamNativeSupplyPerDay,
      moonbeamNativeBorrowPerDay,
      moonbeamWellSupplyPerDayUsd,
      moonbeamWellBorrowPerDayUsd,
      moonbeamNativeSupplyPerDayUsd,
      moonbeamNativeBorrowPerDayUsd,
      moonbeamPercentages,
      Number((mainConfig.totalWellPerEpoch * moonbeamTotalMarketPercentage) * mainConfig.moonbeam.markets),
      moonbeamNewWellSupplySpeeds,
      moonbeamNewWellBorrowSpeeds,
      moonbeamNewNativeSupplySpeeds,
      moonbeamNewNativeBorrowSpeeds,
      formatUnits(wellPrice, 36),
      moonbeamNativePrice,
    ),
    8453: formatResults(
      baseMarkets,
      8453,
      baseNames,
      baseAliases,
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
      baseSupplyRates,
      baseBorrowRates,
      baseWellSupplySpeeds,
      baseWellBorrowSpeeds,
      baseNativeSupplySpeeds,
      baseNativeBorrowSpeeds,
      baseWellSupplyPerDay,
      baseWellBorrowPerDay,
      baseNativeSupplyPerDay,
      baseNativeBorrowPerDay,
      baseWellSupplyPerDayUsd,
      baseWellBorrowPerDayUsd,
      baseNativeSupplyPerDayUsd,
      baseNativeBorrowPerDayUsd,
      basePercentages,
      Number((mainConfig.totalWellPerEpoch * baseTotalMarketPercentage) * mainConfig.base.markets),
      baseNewWellSupplySpeeds,
      baseNewWellBorrowSpeeds,
      baseNewNativeSupplySpeeds,
      baseNewNativeBorrowSpeeds,
      formatUnits(wellPrice, 36),
      baseNativePrice,
    ),
    wellPrice: formatUnits(wellPrice, 36),
    glmrPrice: moonbeamNativePrice,
    usdcPrice: baseNativePrice,
    opPrice: optimismNativePrice,
    epochStartTimestamp: calculateEpochStartTimestamp(),
    epochEndTimestamp: calculateEpochStartTimestamp() + mainConfig.secondsPerEpoch,
    totalSeconds: mainConfig.secondsPerEpoch,
    wellPerEpoch: mainConfig.totalWellPerEpoch,
    moonbeam: {
      ...mainConfig.moonbeam,
      networkTotalUsd: moonbeamNetworkTotalUsd,
      totalMarketPercentage: moonbeamTotalMarketPercentage,
      wellPerEpoch: Number(mainConfig.totalWellPerEpoch * moonbeamTotalMarketPercentage).toFixed(18),
      nativePerEpoch: mainConfig.moonbeam.nativePerEpoch,
      wellPerEpochMarkets: Number((mainConfig.totalWellPerEpoch * moonbeamTotalMarketPercentage) * mainConfig.moonbeam.markets).toFixed(18),
      wellPerEpochSafetyModule: Number((mainConfig.totalWellPerEpoch * moonbeamTotalMarketPercentage) * mainConfig.moonbeam.safetyModule).toFixed(18),
      wellPerEpochDex: Number((mainConfig.totalWellPerEpoch * moonbeamTotalMarketPercentage) * mainConfig.moonbeam.dex).toFixed(18),
    },
    base: {
      ...mainConfig.base,
      networkTotalUsd: baseNetworkTotalUsd,
      totalMarketPercentage: baseTotalMarketPercentage,
      wellPerEpoch: Number(mainConfig.totalWellPerEpoch * baseTotalMarketPercentage).toFixed(18),
      nativePerEpoch: mainConfig.base.nativePerEpoch,
      wellPerEpochMarkets: Number((mainConfig.totalWellPerEpoch * baseTotalMarketPercentage) * mainConfig.base.markets).toFixed(18),
      wellPerEpochSafetyModule: Number((mainConfig.totalWellPerEpoch * baseTotalMarketPercentage) * mainConfig.base.safetyModule).toFixed(18),
      wellPerEpochDex: Number((mainConfig.totalWellPerEpoch * baseTotalMarketPercentage) * mainConfig.base.dex).toFixed(18),
    },
    optimism: {
      ...mainConfig.optimism,
      networkTotalUsd: optimismNetworkTotalUsd,
      totalMarketPercentage: optimismTotalMarketPercentage,
      wellPerEpoch: Number(mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage).toFixed(18),
      nativePerEpoch: mainConfig.optimism.nativePerEpoch,
      wellPerEpochMarkets: Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.markets).toFixed(18),
      wellPerEpochSafetyModule: Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.safetyModule).toFixed(18),
      wellPerEpochDex: Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.dex).toFixed(18),
    },
    safetyModule: safetyModuleData,
  };
}
