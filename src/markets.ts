import { formatUnits } from "viem";
import { ContractCall, createClients, moonbeamClient as defaultMoonbeamClient, baseClient as defaultBaseClient, optimismClient as defaultOptimismClient } from "./utils";
import { mainConfig, marketConfigs } from "./config";
import { getSafetyModuleDataForAllChains } from "./safetyModule";

// These will be set in getMarketData
let moonbeamClient = defaultMoonbeamClient;
let baseClient = defaultBaseClient;
let optimismClient = defaultOptimismClient;

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
  xWellRouterContract,
  excludedMarkets,
  baseStkWELL,
  optimismStkWELL,
  moonbeamStkWELL,
  baseWellHolder,
  optimismWellHolder
} from "./config";

import { mTokenv1ABI, mTokenv2ABI } from "./constants";
import { moonbeam, optimism } from "viem/chains";

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
  minimumReserves: number;
  reservesEnabled: boolean;
  underlyingPrice: number;
  totalSupply: number;
  totalReserves: number;
  exchangeRate: number;
  totalSupplyUnderlying: number;
  totalBorrowsUnderlying: number;
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  reserves: number;
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

async function getClosestBlockNumber(
  client: any,
  timestamp: number,
  blockTime: number
): Promise<number> {
  const currentBlockNumber = await client.getBlockNumber();
  const currentBlockDetails = await client.getBlock({ blockNumber: BigInt(currentBlockNumber) });
  const currentTimestamp = Number(currentBlockDetails.timestamp);

  // Calculate the approximate block number based on the time difference
  const blockDiff = Math.floor((currentTimestamp - timestamp) / blockTime);
  let low = Math.max(0, Number(BigInt(currentBlockNumber) - BigInt(blockDiff)));
  let high = Number(BigInt(currentBlockNumber));

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const blockDetails = await client.getBlock({ blockNumber: BigInt(mid) });
    const blockTimestamp = Number(blockDetails.timestamp);

    if (blockTimestamp === timestamp) {
      return mid;
    } else if (blockTimestamp < timestamp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // If we didn't find an exact match, return the block with the closest timestamp <= target timestamp
  const lowBlockDetails = await client.getBlock({ blockNumber: BigInt(low) });
  const lowBlockTimestamp = Number(lowBlockDetails.timestamp);
  const highBlockDetails = await client.getBlock({ blockNumber: BigInt(high) });
  const highBlockTimestamp = Number(highBlockDetails.timestamp);

  if (lowBlockTimestamp <= timestamp) {
    return low;
  } else if (highBlockTimestamp <= timestamp) {
    return high;
  } else {
    // If both blocks have a timestamp higher than the target, return the block with the lower timestamp
    return lowBlockTimestamp < highBlockTimestamp ? high : low;
  }
}

async function getBridgeCost(): Promise<bigint> {
  const bridgeCost = await moonbeamClient.readContract({
    ...xWellRouterContract,
    functionName: "bridgeCost",
    args: [],
  });
  return bridgeCost as bigint;
}

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

export async function getMarketData(timestamp: number, env?: any) {
  // If environment variables are provided, create clients with them
  if (env) {
    const clients = createClients(env);
    moonbeamClient = clients.moonbeamClient;
    baseClient = clients.baseClient;
    optimismClient = clients.optimismClient;
  }
  const moonbeamBlockNumber = await getClosestBlockNumber(
    moonbeamClient,
    timestamp,
    6 // Moonbeam block time is ~6 seconds
  );
  const baseBlockNumber = await getClosestBlockNumber(
    baseClient,
    timestamp,
    2 // Base block time is ~2 seconds
  );
  const optimismBlockNumber = await getClosestBlockNumber(
    optimismClient,
    timestamp,
    2 // Optimism block time is ~2 seconds
  );
  const safetyModuleData = await getSafetyModuleDataForAllChains(
    BigInt(moonbeamBlockNumber),
    BigInt(baseBlockNumber),
    BigInt(optimismBlockNumber),
    env
  );
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

  // Fetch prices from oracle
  const moonbeamPricesResponse = await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      ...moonbeamOracleContract,
      functionName: "getUnderlyingPrice",
      blockNumber: BigInt(moonbeamBlockNumber),
      args: [market],
    } as ContractCall)),
  });
  
  // Check for zero prices and log them
  const moonbeamPrices = moonbeamPricesResponse.map((price, index) => {
    if (price.status === 'failure' || price.result === undefined) {
      throw new Error(`Failed to fetch price for Moonbeam market ${moonbeamNames[index]} (${moonbeamMarkets[index]}): ${price.error || 'RPC call failed'}`);
    }
    const priceValue = price.result as bigint;
    if (priceValue === BigInt(0)) {
      console.log(`⚠️ ZERO PRICE ALERT: Moonbeam market ${moonbeamNames[index]} (${moonbeamMarkets[index]}) has price = 0`);
    }
    return priceValue;
  });

  const glmrIndex = moonbeamMarkets.findIndex(
    (market) => moonbeamNames[moonbeamMarkets.indexOf(market)] === "GLMR"
  );

  if (glmrIndex === -1) {
    throw new Error("GLMR market not found in Moonbeam markets");
  }

  const moonbeamNativePrice = formatUnits(
    moonbeamPrices[glmrIndex],
    (36 - 18)
  );

  // Fetch prices from oracle for Base
  const basePricesResponse = await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      ...baseOracleContract,
      functionName: "getUnderlyingPrice",
      blockNumber: BigInt(baseBlockNumber),
      args: [market],
    } as ContractCall)),
  });
  
  // Check for zero prices and log them
  const basePrices = basePricesResponse.map((price, index) => {
    const priceValue = price.result as bigint;
    if (priceValue === BigInt(0)) {
      console.log(`⚠️ ZERO PRICE ALERT: Base market ${baseNames[index]} (${baseMarkets[index]}) has price = 0`);
    }
    return priceValue;
  });

  const usdcIndex = baseMarkets.findIndex(
    (market) => baseNames[baseMarkets.indexOf(market)] === "USDC"
  );
  
  const baseNativePrice = formatUnits(
    basePrices[usdcIndex], 
    (36 - 6)
  );

  // Fetch prices from oracle for Optimism
  const optimismPricesResponse = await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      ...optimismOracleContract,
      functionName: "getUnderlyingPrice",
      blockNumber: BigInt(optimismBlockNumber),
      args: [market],
    } as ContractCall)),
  });
  
  // Check for zero prices and log them
  const optimismPrices = optimismPricesResponse.map((price, index) => {
    const priceValue = price.result as bigint;
    if (priceValue === BigInt(0)) {
      console.log(`⚠️ ZERO PRICE ALERT: Optimism market ${optimismNames[index]} (${optimismMarkets[index]}) has price = 0`);
    }
    return priceValue;
  });

  const opIndex = optimismMarkets.findIndex(
    (market) => optimismNames[optimismMarkets.indexOf(market)] === "OP"
  );
  
  const optimismNativePrice = formatUnits(
    optimismPrices[opIndex], 
    (36 - 18)
  );

  const ethPrice = basePrices.find(
    (price, index) => baseMarkets[index] === marketConfigs[8453].find(config => config.nameOverride === 'ETH')?.address
  ) || BigInt(0);

  const wellPrice = (await baseClient.readContract({
    ...aeroMarketContract,
    functionName: "quote",
    blockNumber: BigInt(baseBlockNumber),
    args: [xWellToken.address, BigInt(1e18), BigInt(1)],
  })) * BigInt(ethPrice) as bigint;

  const moonbeamSupplies = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "totalSupply",
      blockNumber: BigInt(moonbeamBlockNumber),
    })),
  })).map((supply) => supply.result as bigint);

  const baseSupplies = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
      blockNumber: BigInt(baseBlockNumber),
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const optimismSupplies = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
      blockNumber: BigInt(optimismBlockNumber),
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const moonbeamBorrows = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "totalBorrows",
      blockNumber: BigInt(moonbeamBlockNumber),
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const baseBorrows = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
      blockNumber: BigInt(baseBlockNumber),
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const optimismBorrows = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
      blockNumber: BigInt(optimismBlockNumber),
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const baseReserves = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalReserves",
      blockNumber: BigInt(baseBlockNumber),
    })),
  })).map((reserves) => reserves.result as bigint);

  const optimismReserves = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalReserves",
      blockNumber: BigInt(optimismBlockNumber),
    })),
  })).map((reserves) => reserves.result as bigint);

  const moonbeamReserves = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "totalReserves",
      blockNumber: BigInt(moonbeamBlockNumber),
    })),
  })).map((reserves) => reserves.result as bigint);

  const moonbeamExchangeRates = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv1ABI,
      functionName: "exchangeRateStored",
      blockNumber: BigInt(moonbeamBlockNumber),
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const baseExchangeRates = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
      blockNumber: BigInt(baseBlockNumber),
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const optimismExchangeRates = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
      blockNumber: BigInt(optimismBlockNumber),
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  // Functions to get emissions per second
  const moonbeamWellSupplySpeeds = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "supplyRewardSpeeds",
      blockNumber: BigInt(moonbeamBlockNumber),
      args: [0, market], // 0 = WELL
    } as ContractCall)),
  })).map((supplyRewardSpeed) => supplyRewardSpeed.result as bigint);

  const moonbeamWellBorrowSpeeds = (await moonbeamClient.multicall({
    contracts: moonbeamMarkets.map(market => ({
      address: moonbeamComptroller.address,
      abi: moonbeamComptroller.abi,
      functionName: "borrowRewardSpeeds",
      blockNumber: BigInt(moonbeamBlockNumber),
      args: [0, market], // 0 = WELL
    } as ContractCall)),
  })).map((borrowRewardSpeed) => borrowRewardSpeed.result as bigint);

  const baseWellSupplySpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      blockNumber: BigInt(baseBlockNumber),
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
      blockNumber: BigInt(baseBlockNumber),
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
      blockNumber: BigInt(optimismBlockNumber),
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
      blockNumber: BigInt(optimismBlockNumber),
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
      blockNumber: BigInt(moonbeamBlockNumber),
      args: [1, market], // 1 = GLMR (native token)
    } as ContractCall)),
  })).map((supplyRewardSpeed) => supplyRewardSpeed.result as bigint);

  const baseNativeSupplySpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      blockNumber: BigInt(baseBlockNumber),
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
      blockNumber: BigInt(optimismBlockNumber),
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
      blockNumber: BigInt(moonbeamBlockNumber),
      args: [1, market], // 1 = GLMR (native token)
    } as ContractCall)),
  })).map((borrowRewardSpeed) => borrowRewardSpeed.result as bigint);

  const baseNativeBorrowSpeeds = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      blockNumber: BigInt(baseBlockNumber),
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
      blockNumber: BigInt(optimismBlockNumber),
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
      blockNumber: BigInt(moonbeamBlockNumber),
      args: [market],
    } as ContractCall)),
  }));

  const moonbeamSupplyRates = moonbeamMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Moonbeam market at index ${index} has undefined result`, moonbeamMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { supplyRate: bigint }).supplyRate;
  });
  
  const moonbeamBorrowRates = moonbeamMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Moonbeam market at index ${index} has undefined result`, moonbeamMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { borrowRate: bigint }).borrowRate;
  });

  const baseMarketInfo = (await baseClient.multicall({
    contracts: baseMarkets.map(market => ({
      address: baseViewsContract.address,
      abi: baseViewsContract.abi,
      functionName: "getMarketInfo",
      blockNumber: BigInt(baseBlockNumber),
      args: [market],
    } as ContractCall)),
  }));

  // Add logging to identify which market has undefined result
  const baseSupplyRates = baseMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Base market at index ${index} has undefined result`, baseMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { supplyRate: bigint }).supplyRate;
  });
  
  const baseBorrowRates = baseMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Base market at index ${index} has undefined result`, baseMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { borrowRate: bigint }).borrowRate;
  });

  const optimismMarketInfo = (await optimismClient.multicall({
    contracts: optimismMarkets.map(market => ({
      address: optimismViewsContract.address,
      abi: optimismViewsContract.abi,
      functionName: "getMarketInfo",
      blockNumber: BigInt(optimismBlockNumber),
      args: [market],
    } as ContractCall)),
  }));

  const optimismSupplyRates = optimismMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Optimism market at index ${index} has undefined result`, optimismMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { supplyRate: bigint }).supplyRate;
  });
  
  const optimismBorrowRates = optimismMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Optimism market at index ${index} has undefined result`, optimismMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { borrowRate: bigint }).borrowRate;
  });

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
    if (!moonbeamEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const supply = moonbeamSupplies[index];
    const exchangeRate = moonbeamExchangeRates[index];
    const price = moonbeamPrices[index];
    const digit = moonbeamDigits.filter((digit): digit is number => digit !== null)[index];
    const boost = moonbeamBoosts.filter((boost): boost is number => boost !== null)[index];
    const deboost = moonbeamDeboosts.filter((deboost): deboost is number => deboost !== null)[index];
    
    // Add null checks before using formatUnits
    if (supply === undefined || exchangeRate === undefined || price === undefined ||
        digit === undefined || boost === undefined || deboost === undefined) {
      console.log(`⚠️ MISSING DATA: Moonbeam market ${index} missing data for totalSupplyUSD calculation`);
      return 0;
    }
    
    return ((
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit)))
      + boost - deboost
    );
  });

  const baseTotalSupplyUsd = baseMarkets.map((market, index) => {
    if (!baseEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const supply = baseSupplies[index];
    const exchangeRate = baseExchangeRates[index];
    const price = basePrices[index];
    const digit = baseDigits.filter((digit): digit is number => digit !== null)[index];
    const boost = baseBoosts.filter((boost): boost is number => boost !== null)[index];
    const deboost = baseDeboosts.filter((deboost): deboost is number => deboost !== null)[index];
    
    // Add null checks before using formatUnits
    if (supply === undefined || exchangeRate === undefined || price === undefined ||
        digit === undefined || boost === undefined || deboost === undefined) {
      console.log(`⚠️ MISSING DATA: Base market ${index} missing data for totalSupplyUSD calculation`);
      return 0;
    }
    
    return ((
      Number(formatUnits(supply, 8)) *
      Number(formatUnits(exchangeRate, 18 + digit - 8)) *
      Number(formatUnits(price, 36 - digit)))
      + boost - deboost
    );
  });

  const optimismTotalSupplyUsd = optimismMarkets.map((market, index) => {
    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const supply = optimismSupplies[index];
    const exchangeRate = optimismExchangeRates[index];
    const price = optimismPrices[index];
    const digit = optimismDigits.filter((digit): digit is number => digit !== null)[index];
    const boost = optimismBoosts.filter((boost): boost is number => boost !== null)[index];
    const deboost = optimismDeboosts.filter((deboost): deboost is number => deboost !== null)[index];
    
    // Add null checks before using formatUnits
    if (supply === undefined || exchangeRate === undefined || price === undefined ||
        digit === undefined || boost === undefined || deboost === undefined) {
      console.log(`⚠️ MISSING DATA: Optimism market ${index} missing data for totalSupplyUSD calculation`);
      return 0;
    }
    
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
    if (!moonbeamEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const borrow = moonbeamBorrows[index];
    const price = moonbeamPrices[index];
    const digit = moonbeamDigits.filter((digit): digit is number => digit !== null)[index];
    
    // Add null checks before using formatUnits
    if (borrow === undefined || price === undefined || digit === undefined) {
      console.log(`⚠️ MISSING DATA: Moonbeam market ${index} missing data for totalBorrowsUSD calculation`);
      return 0;
    }
    
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const baseTotalBorrowsUsd = baseMarkets.map((market, index) => {
    if (!baseEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const borrow = baseBorrows[index];
    const price = basePrices[index];
    const digit = baseDigits.filter((digit): digit is number => digit !== null)[index];
    
    // Add null checks before using formatUnits
    if (borrow === undefined || price === undefined || digit === undefined) {
      console.log(`⚠️ MISSING DATA: Base market ${index} missing data for totalBorrowsUSD calculation`);
      return 0;
    }
    
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const optimismTotalBorrowsUsd = optimismMarkets.map((market, index) => {
    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const borrow = optimismBorrows[index];
    const price = optimismPrices[index];
    const digit = optimismDigits.filter((digit): digit is number => digit !== null)[index];
    
    // Add null checks before using formatUnits
    if (borrow === undefined || price === undefined || digit === undefined) {
      console.log(`⚠️ MISSING DATA: Optimism market ${index} missing data for totalBorrowsUSD calculation`);
      return 0;
    }
    
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
    borrows: bigint[],
    enabledMarkets: boolean[]
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
      const enabled = enabledMarkets[index];

      if (enabled) { // Only include markets that are enabled
        const supplyUSD =
          Number(formatUnits(supply, 8)) *
          Number(formatUnits(exchangeRate, 18 + digit - 8)) *
          Number(formatUnits(price, 36 - digit));

        const borrowUSD =
          Number(formatUnits(borrow, digit)) *
          Number(formatUnits(price, 36 - digit));

        totalSupplyUSD += supplyUSD + boost - deboost;
        totalBorrowsUSD += borrowUSD;
      }
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
    moonbeamBorrows,
    moonbeamEnabled.filter((enabled): enabled is boolean => enabled !== null),
  );

  const baseNetworkTotalUsd = calculateNetworkTotalUSD(
    baseMarkets,
    baseSupplies,
    baseExchangeRates,
    basePrices,
    baseDigits.filter((digit): digit is number => digit !== null),
    baseBoosts.filter((boost): boost is number => boost !== null),
    baseDeboosts.filter((deboost): deboost is number => deboost !== null),
    baseBorrows,
    baseEnabled.filter((enabled): enabled is boolean => enabled !== null),
  );

  const optimismNetworkTotalUsd = calculateNetworkTotalUSD(
    optimismMarkets,
    optimismSupplies,
    optimismExchangeRates,
    optimismPrices,
    optimismDigits.filter((digit): digit is number => digit !== null),
    optimismBoosts.filter((boost): boost is number => boost !== null),
    optimismDeboosts.filter((deboost): deboost is number => deboost !== null),
    optimismBorrows,
    optimismEnabled.filter((enabled): enabled is boolean => enabled !== null),
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
    const currentSpeed = Number(formatUnits(moonbeamWellSupplySpeeds[index], 18));

    if (!moonbeamEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? currentSpeed : 0;
    }
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * moonbeamTotalMarketPercentage
      * mainConfig.moonbeam.markets;
    const percentage = moonbeamPercentages[index];
    const supplyRatio = moonbeamSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);

    // Return currentSpeed if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? currentSpeed : calculatedSpeed;
  });

  const moonbeamNewWellBorrowSpeeds = moonbeamMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(moonbeamWellBorrowSpeeds[index], 18));

    if (!moonbeamEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? currentSpeed : 1e-18;
    }
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * moonbeamTotalMarketPercentage
      * mainConfig.moonbeam.markets;
    const percentage = moonbeamPercentages[index];
    const borrowRatio = moonbeamBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Return currentSpeed if the speeds are the same
    if (Math.abs(calculatedSpeed - currentSpeed) < 1e-18) {
      return currentSpeed;
    }

    // Return 1e-18 if the calculated speed is 0
    return calculatedSpeed === 0 ? 1e-18 : calculatedSpeed;
  });

  const baseNewWellSupplySpeeds = baseMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(baseWellSupplySpeeds[index], 18));

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18 : 0;
    }
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * baseTotalMarketPercentage
      * mainConfig.base.markets;
    const percentage = basePercentages[index];
    const supplyRatio = baseSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const baseNewWellBorrowSpeeds = baseMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(baseWellBorrowSpeeds[index], 18));

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18: 1e-18;
    }
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * baseTotalMarketPercentage
      * mainConfig.base.markets;
    const percentage = basePercentages[index];
    const borrowRatio = baseBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Return -1e-18 if the current speed is 1e-18 and the calculated speed is 0
    if (currentSpeed === 1e-18 && calculatedSpeed === 0) {
      return -1e-18;
    }

    // Return -1 if the speeds are the same
    if (Math.abs(calculatedSpeed - currentSpeed) < 1e-18) {
      return -1e-18;
    }

    // Return 1e-18 if the calculated speed is 0
    return calculatedSpeed === 0 ? 1e-18 : calculatedSpeed;
  });

  const optimismNewWellSupplySpeeds = optimismMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(optimismWellSupplySpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18: 0;
    }
    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * optimismTotalMarketPercentage
      * mainConfig.optimism.markets;
    const percentage = optimismPercentages[index];
    const supplyRatio = optimismSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const optimismNewWellBorrowSpeeds = optimismMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(optimismWellBorrowSpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18: 1e-18;
    }

    const totalWellPerEpochMarkets =
      mainConfig.totalWellPerEpoch
      * optimismTotalMarketPercentage
      * mainConfig.optimism.markets;
    const percentage = optimismPercentages[index];
    const borrowRatio = optimismBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);
    // Return -1e-18 if the current speed is 1e-18 and the calculated speed is 0
    if (currentSpeed === 1e-18 && calculatedSpeed === 0) {
      return -1e-18;
    }

    // Return -1 if the speeds are the same
    if (Math.abs(calculatedSpeed - currentSpeed) < 1e-18) {
      return -1e-18;
    }

    // Return 1e-18 if the calculated speed is 0
    return calculatedSpeed === 0 ? 1e-18 : calculatedSpeed;
  });

  const moonbeamNewNativeSupplySpeeds = moonbeamMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(moonbeamNativeSupplySpeeds[index], 18));
    if (!moonbeamEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? currentSpeed : 0;
    }
    const totalNativePerEpochMarkets = mainConfig.moonbeam.nativePerEpoch;
    const percentage = moonbeamPercentages[index];
    const supplyRatio = moonbeamSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);

    // Return currentSpeed if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? currentSpeed : calculatedSpeed;
  });

  const moonbeamNewNativeBorrowSpeeds = moonbeamMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(moonbeamNativeBorrowSpeeds[index], 18));

    if (!moonbeamEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? currentSpeed : 1e-18;
    }
    const totalNativePerEpochMarkets = mainConfig.moonbeam.nativePerEpoch;
    const percentage = moonbeamPercentages[index];
    const borrowRatio = moonbeamBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);

    // Return currentSpeed if the speeds are the same
    if (Math.abs(calculatedSpeed - currentSpeed) < 1e-18) {
      return currentSpeed;
    }

    // Special case: if speed is 0, return 1e-18 instead
    return calculatedSpeed === 0 ? 1e-18 : calculatedSpeed;
  });

  const baseNewNativeSupplySpeeds = baseMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(baseNativeSupplySpeeds[index], 6));

    if (market === '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22') {
      // Gauntlet is USDC emissions admin - don't change
      return -1e-6;
    }

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-6 : 0;
    }

    const totalNativePerEpochMarkets = mainConfig.base.nativePerEpoch;
    const percentage = basePercentages[index];
    const supplyRatio = baseSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-6 ? -1e-6 : calculatedSpeed;
  });

  const baseNewNativeBorrowSpeeds = baseMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(baseNativeBorrowSpeeds[index], 6));

    if (market === '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22') {
      // Gauntlet is USDC emissions admin - don't change
      return -1e-6;
    }

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-6 ? -1e-6 : 1e-6;
    }

    const totalNativePerEpochMarkets = mainConfig.base.nativePerEpoch;
    const percentage = basePercentages[index];
    const borrowRatio = baseBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);

    // Return -1 if the speeds are the same
    if ((calculatedSpeed === 0) && (currentSpeed === 0.000001)) {
      return -1e-6;
    }

    // Special case: if speed is 0, return 1e-6 instead (USDC is 6 digits)
    return calculatedSpeed === 0 ? 1e-6 : calculatedSpeed;
  });

  const optimismNewNativeSupplySpeeds = optimismMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(optimismNativeSupplySpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18 : 0;
    }

    const totalNativePerEpochMarkets = mainConfig.optimism.nativePerEpoch;
    const percentage = optimismPercentages[index];
    const supplyRatio = optimismSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * supplyRatio) / mainConfig.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const optimismNewNativeBorrowSpeeds = optimismMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(optimismNativeBorrowSpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18 : 1e-18;
    }

    const totalNativePerEpochMarkets = mainConfig.optimism.nativePerEpoch;
    const percentage = optimismPercentages[index];
    const borrowRatio = optimismBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / mainConfig.secondsPerEpoch);

    // Return -1e-18 if the current speed is 1e-18 and the calculated speed is 0
    if (currentSpeed === 1e-18 && calculatedSpeed === 0) {
      return -1e-18;
    }

    // Return -1 if the speeds are the same
    if (Math.abs(calculatedSpeed - currentSpeed) < 1e-18) {
      return -1e-18;
    }

    // Special case: if speed is 0, return 1e-18 instead
    return calculatedSpeed === 0 ? 1e-18 : calculatedSpeed;
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
    reserves: bigint[],
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
    totalNativePerEpochMarkets: number,
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
    totalSupplyUSD: (() => {
      const value = Number(suppliesUsd[index].toFixed(2));
      if (value === 0 && enabled[index]) {
        console.log(`⚠️ ZERO SUPPLY USD ALERT: ${chainId === 1284 ? 'Moonbeam' : chainId === 8453 ? 'Base' : 'Optimism'} market ${names[index]} (${market}) has totalSupplyUSD = 0`);
      }
      return value;
    })(),
    totalBorrowsUSD: (() => {
      const value = Number(borrowsUsd[index].toFixed(2));
      if (value === 0 && enabled[index]) {
        console.log(`⚠️ ZERO BORROW USD ALERT: ${chainId === 1284 ? 'Moonbeam' : chainId === 8453 ? 'Base' : 'Optimism'} market ${names[index]} (${market}) has totalBorrowsUSD = 0`);
      }
      return value;
    })(),
    reserves: Number(formatUnits(reserves[index], digits[index] as number)),
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
    supplyApy: Number(parseFloat(formatUnits(supplyRates[index], 18)) * 60 * 60 * 24 * 365).toFixed(4),
    borrowApy: Number(parseFloat(formatUnits(borrowRates[index], 18)) * 60 * 60 * 24 * 365).toFixed(4),
    wellSupplyApr: suppliesUsd[index] > 0 ? Number((
      wellSupplyPerDayUsd[index]
      / suppliesUsd[index]
      * 365 * 100).toFixed(2)
    ) : Number(0).toFixed(2),
    wellBorrowApr: borrowsUsd[index] > 0 ? Number((
      wellBorrowPerDayUsd[index]
      / borrowsUsd[index]
      * 365 * 100).toFixed(2)) : Number(0).toFixed(2)
    ,
    nativeSupplyApr: suppliesUsd[index] > 0 ? Number((
      nativeSupplyPerDayUsd[index]
      / suppliesUsd[index]
      * 365 * 100).toFixed(2)
    ) : Number(0).toFixed(2),
    nativeBorrowApr: borrowsUsd[index] > 0 ? Number((
      nativeBorrowPerDayUsd[index]
      / borrowsUsd[index]
      * 365 * 100).toFixed(2)) : Number(0).toFixed(2),
    percentage: percentages[index],
    minimumReserves: marketConfigs[chainId as keyof typeof marketConfigs]?.find(config => config.address === market)?.minimumReserves ?? 0,
    reservesEnabled: marketConfigs[chainId as keyof typeof marketConfigs]?.find(config => config.address === market)?.reservesEnabled ?? false,
    wellPerEpochMarket: Number(totalWellPerEpochMarkets * percentages[index]),
    wellPerEpochMarketSupply: Number(totalWellPerEpochMarkets * percentages[index] * supply[index]),
    wellPerEpochMarketBorrow: Number(totalWellPerEpochMarkets * percentages[index] * borrow[index]),
    newWellSupplySpeed: newWellSupplySpeed[index],
    newWellBorrowSpeed: newWellBorrowSpeed[index],
    newNativeSupplySpeed: newNativeSupplySpeed[index],
    newNativeBorrowSpeed: newNativeBorrowSpeed[index],
    newWellSupplyApr: suppliesUsd[index] > 0 ? Number((
      (newWellSupplySpeed[index] * 86400 * Number(wellPrice))
      / suppliesUsd[index]
      * 365 * 100).toFixed(2),
    ) : Number(0).toFixed(2),
    newWellBorrowApr: borrowsUsd[index] > 0 ? Number((
      (newWellBorrowSpeed[index] * 86400 * Number(wellPrice))
      / borrowsUsd[index]
      * 365 * 100).toFixed(2),
    ) : Number(0).toFixed(2),
    newNativeSupplyApr: suppliesUsd[index] > 0 ? Number((
      (newNativeSupplySpeed[index] * 86400 * Number(nativePrice))
      / suppliesUsd[index]
      * 365 * 100).toFixed(2),
    ) : Number(0).toFixed(2),
    newNativeBorrowApr: borrowsUsd[index] > 0 ? Number((
      (newNativeBorrowSpeed[index] * 86400 * Number(nativePrice))
      / borrowsUsd[index]
      * 365 * 100).toFixed(2),
    ) : Number(0).toFixed(2),
    newWellSupplyPerDay: Number(newWellSupplySpeed[index] * 86400),
    newWellBorrowPerDay: Number(newWellBorrowSpeed[index] * 86400),
    newNativeSupplyPerDay: Number(newNativeSupplySpeed[index] * 86400),
    newNativeBorrowPerDay: Number(newNativeBorrowSpeed[index] * 86400),
    newWellSupplyPerDayUsd: Number((newWellSupplySpeed[index] * 86400 * Number(wellPrice)).toFixed(2)),
    newWellBorrowPerDayUsd: Number((newWellBorrowSpeed[index] * 86400 * Number(wellPrice)).toFixed(2)),
    newNativeSupplyPerDayUsd: Number((newNativeSupplySpeed[index] * 86400 * Number(nativePrice)).toFixed(2)),
    newNativeBorrowPerDayUsd: Number((newNativeBorrowSpeed[index] * 86400 * Number(nativePrice)).toFixed(2)),
    wellChangeSupplySpeedPercentage: Number(
      (() => {
        const currentSpeed = Number(formatUnits(currentWellSupplySpeed[index], 18));
        const newSpeed = newWellSupplySpeed[index];
        
        if (currentSpeed === 0) {
          return newSpeed > 0 ? 100 : 0; // If current is 0 and new is positive, it's a 100% increase
        } else if (currentSpeed === 1e-18 && newSpeed === -1e-18) {
          return 0; // No change
        } else if (currentSpeed <= 1e-18) {
          return newSpeed > 1e-18 ? 100 : 0; // Treat very small current speeds as effectively zero
        } else if (newSpeed <= 1e-18) {
          return -100; // Treat very small new speeds as zero
        } else {
          return Number(((newSpeed - currentSpeed) / currentSpeed * 100).toFixed(2));
        }
      })()
    ),
    wellChangeBorrowSpeedPercentage: Number(
      (() => {
        const currentSpeed = Number(formatUnits(currentWellBorrowSpeed[index], 18));
        const newSpeed = newWellBorrowSpeed[index];
        
        if (currentSpeed === 1e-18 && newSpeed === -1e-18) {
          return 0; // No change
        } else if (currentSpeed <= 1e-18) {
          return newSpeed > 1e-18 ? 100 : 0; // Treat very small current speeds as effectively zero
        } else if (newSpeed <= 1e-18) {
          return -100; // Treat very small new speeds as zero
        } else {
          return Number(((newSpeed - currentSpeed) / currentSpeed * 100).toFixed(2));
        }
      })()
    ),
    nativeChangeSupplySpeedPercentage: Number(
      (() => {
        const currentSpeed = Number(formatUnits(currentNativeSupplySpeed[index], 18));
        const newSpeed = newNativeSupplySpeed[index];
        
        if (currentSpeed === 0) {
          return newSpeed > 0 ? 100 : 0; // If current is 0 and new is positive, it's a 100% increase
        } else if (currentSpeed === 1e-18 && newSpeed === -1e-18) {
          return 0; // No change
        } else if (currentSpeed <= 1e-18) {
          return newSpeed > 1e-18 ? 100 : 0; // Treat very small current speeds as effectively zero
        } else if (newSpeed <= 1e-18) {
          return -100; // Treat very small new speeds as zero
        } else {
          return Number(((newSpeed - currentSpeed) / currentSpeed * 100).toFixed(2));
        }
      })()
    ),
    nativeChangeBorrowSpeedPercentage: Number(
      (() => {
        const currentSpeed = Number(formatUnits(currentNativeBorrowSpeed[index], 18));
        const newSpeed = newNativeBorrowSpeed[index];
        
        if (currentSpeed === 1e-18 && newSpeed === -1e-18) {
          return 0; // No change
        } else if (currentSpeed <= 1e-18) {
          return newSpeed > 1e-18 ? 100 : 0; // Treat very small current speeds as effectively zero
        } else if (newSpeed <= 1e-18) {
          return -100; // Treat very small new speeds as zero
        } else {
          return Number(((newSpeed - currentSpeed) / currentSpeed * 100).toFixed(2));
        }
      })()
    ),
    nativePerEpochMarket: Number(totalNativePerEpochMarkets * percentages[index]),
    nativePerEpochMarketSupply: Number(totalNativePerEpochMarkets * percentages[index] * supply[index]),
    nativePerEpochMarketBorrow: Number(totalNativePerEpochMarkets * percentages[index] * borrow[index]),
  }));

  // Get xWellToken balance for optimismWellHolder
  const optimismWellHolderBalance = await optimismClient.readContract({
    address: xWellToken.address,
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: "balanceOf",
    args: [optimismWellHolder],
    blockNumber: BigInt(optimismBlockNumber),
  }) as bigint;

  // Get xWellToken balance for baseWellHolder
  const baseWellHolderBalance = await baseClient.readContract({
    address: xWellToken.address,
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: "balanceOf",
    args: [baseWellHolder],
    blockNumber: BigInt(baseBlockNumber),
  }) as bigint;

  // Get totalSupply from each stkWELL contract
  const erc20TotalSupplyAbi = [
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const baseStkWELLTotalSupply = await baseClient.readContract({
    address: baseStkWELL,
    abi: erc20TotalSupplyAbi,
    functionName: "totalSupply",
    blockNumber: BigInt(baseBlockNumber),
  }) as bigint;

  const optimismStkWELLTotalSupply = await optimismClient.readContract({
    address: optimismStkWELL,
    abi: erc20TotalSupplyAbi,
    functionName: "totalSupply",
    blockNumber: BigInt(optimismBlockNumber),
  }) as bigint;

  const moonbeamStkWELLTotalSupply = await moonbeamClient.readContract({
    address: moonbeamStkWELL,
    abi: erc20TotalSupplyAbi,
    functionName: "totalSupply",
    blockNumber: BigInt(moonbeamBlockNumber),
  }) as bigint;

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
      optimismReserves,
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
      Number(mainConfig.optimism.nativePerEpoch),
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
      moonbeamReserves,
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
      Number(mainConfig.moonbeam.nativePerEpoch),
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
      baseReserves,
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
      Number(mainConfig.base.nativePerEpoch),
    ),
    wellPrice: formatUnits(wellPrice, 36),
    glmrPrice: moonbeamNativePrice,
    usdcPrice: baseNativePrice,
    opPrice: optimismNativePrice,
    epochStartTimestamp: calculateEpochStartTimestamp(),
    epochEndTimestamp: calculateEpochStartTimestamp() + mainConfig.secondsPerEpoch,
    totalSeconds: mainConfig.secondsPerEpoch,
    wellPerEpoch: mainConfig.totalWellPerEpoch,
    bridgeCost: (await getBridgeCost()).toString(),
    timestamp: timestamp,
    moonbeamBlockNumber: moonbeamBlockNumber,
    baseBlockNumber: baseBlockNumber,
    optimismBlockNumber: optimismBlockNumber,
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
      wellPerEpochSafetyModule: Number(((mainConfig.totalWellPerEpoch) * baseTotalMarketPercentage) * mainConfig.base.safetyModule).toFixed(18),
      wellPerEpochDex: Number((mainConfig.totalWellPerEpoch * baseTotalMarketPercentage) * mainConfig.base.dex).toFixed(18),
      wellHolderBalance: baseWellHolderBalance.toString(),
    },
    optimism: {
      ...mainConfig.optimism,
      networkTotalUsd: optimismNetworkTotalUsd,
      totalMarketPercentage: optimismTotalMarketPercentage,
      wellPerEpoch: Number(mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage).toFixed(18),
      nativePerEpoch: mainConfig.optimism.nativePerEpoch,
      wellPerEpochMarkets: Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.markets).toFixed(18),
      wellPerEpochSafetyModule: Number(((mainConfig.totalWellPerEpoch) * optimismTotalMarketPercentage) * mainConfig.optimism.safetyModule).toFixed(18),
      wellPerEpochDex: Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.dex).toFixed(18),
      wellHolderBalance: optimismWellHolderBalance.toString(),
      optimismUSDCVaultWellRewardAmount: Number((mainConfig.totalWellPerEpoch * optimismTotalMarketPercentage) * mainConfig.optimism.vaults),
    },
    safetyModule: safetyModuleData,
    baseStkWELLTotalSupply: baseStkWELLTotalSupply.toString(),
    optimismStkWELLTotalSupply: optimismStkWELLTotalSupply.toString(),
    moonbeamStkWELLTotalSupply: moonbeamStkWELLTotalSupply.toString(),
  };
}
