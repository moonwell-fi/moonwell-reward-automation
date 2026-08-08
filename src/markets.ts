import { formatUnits } from "viem";
import { marketConfigs, applyConfigOverrides, type ConfigOverrides } from "./config";
import { ContractCall, createClients, baseClient as defaultBaseClient, optimismClient as defaultOptimismClient, ethereumClient as defaultEthereumClient } from "./utils";
import { getEpochWindow } from "./epochs";
import { CHAIN_NAMES, type ChainId } from "./types/config";

// These will be set in getMarketData
let baseClient = defaultBaseClient;
let optimismClient = defaultOptimismClient;
let ethereumClient = defaultEthereumClient;

import {
  aeroMarketContract,
  baseComptroller,
  baseMultiRewardDistributor,
  baseNativeToken,
  baseOracleContract,
  baseStkWELL,
  baseViewsContract,
  baseWellHolder,
  ethereumComptroller,
  ethereumMultiRewardDistributor,
  ethereumOracleContract,
  ethereumViewsContract,
  excludedMarkets,
  optimismComptroller,
  optimismMultiRewardDistributor,
  optimismNativeToken,
  optimismOracleContract,
  optimismStkWELL,
  optimismViewsContract,
  optimismWellHolder,
  xWellToken
} from "./config";

import { mTokenv2ABI } from "./constants";

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

async function filterExcludedMarkets(markets: string[], chainId: number): Promise<string[]> {
  const excludedAddresses = excludedMarkets
    .filter(market => market.chainId === chainId)
    .map(market => market.address);
  return markets.filter(market => !excludedAddresses.includes(market));
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

async function getEthereumMarkets() {
  const markets = await ethereumClient.readContract({
    ...ethereumComptroller,
    functionName: "getAllMarkets",
    args: [],
  } as ContractCall);
  return await filterExcludedMarkets(markets as string[], 1);
}

export async function getMarketData(timestamp: number, env?: any, configOverrides?: ConfigOverrides) {
  // Apply config overrides to get effective config for this request
  const config = applyConfigOverrides(configOverrides);

  // Calendar-month epoch (15th→15th UTC). Variable duration drives all
  // per-second reward-speed math, so every `config.secondsPerEpoch` use below
  // automatically reflects the real month length.
  const epochWindow = getEpochWindow(timestamp);
  config.secondsPerEpoch = epochWindow.durationSeconds;

  // If environment variables are provided, create clients with them
  if (env) {
    const clients = createClients(env);
    baseClient = clients.baseClient;
    optimismClient = clients.optimismClient;
    ethereumClient = clients.ethereumClient;
  }
  // The three chains are independent; resolve their block numbers (each a
  // sequential binary search of RPC calls) and market lists concurrently.
  const [baseBlockNumber, optimismBlockNumber, ethereumBlockNumber] = await Promise.all([
    getClosestBlockNumber(baseClient, timestamp, 2), // Base block time is ~2 seconds
    getClosestBlockNumber(optimismClient, timestamp, 2), // Optimism block time is ~2 seconds
    getClosestBlockNumber(ethereumClient, timestamp, 12), // Ethereum block time is ~12 seconds
  ]);
  const [baseMarkets, optimismMarkets, ethereumMarkets] = await Promise.all([
    getBaseMarkets(),
    getOptimismMarkets(),
    getEthereumMarkets(),
  ]);

  if (!baseMarkets.length || !optimismMarkets.length || !ethereumMarkets.length) {
    throw new Error("No markets found");
  }

  // Per-chain market config lookups; markets missing from marketConfigs map to null.
  const mapConfigField = <C extends { address: string }, T>(
    configs: readonly C[],
    markets: string[],
    pick: (config: C) => T,
  ) => markets.map(market => {
    const config = configs.find(config => config.address === market);
    return config ? pick(config) : null;
  });

  const baseNames = mapConfigField(marketConfigs[8453], baseMarkets, config => config.nameOverride);
  const baseAliases = mapConfigField(marketConfigs[8453], baseMarkets, config => config.alias);
  const baseDigits = mapConfigField(marketConfigs[8453], baseMarkets, config => config.digits);
  const baseBoosts = mapConfigField(marketConfigs[8453], baseMarkets, config => config.boost);
  const baseDeboosts = mapConfigField(marketConfigs[8453], baseMarkets, config => config.deboost);
  const baseSupplyRatios = mapConfigField(marketConfigs[8453], baseMarkets, config => config.supply);
  const baseBorrowRatios = mapConfigField(marketConfigs[8453], baseMarkets, config => config.borrow);
  const baseEnabled = mapConfigField(marketConfigs[8453], baseMarkets, config => config.enabled);

  const optimismNames = mapConfigField(marketConfigs[10], optimismMarkets, config => config.nameOverride);
  const optimismAliases = mapConfigField(marketConfigs[10], optimismMarkets, config => config.alias);
  const optimismDigits = mapConfigField(marketConfigs[10], optimismMarkets, config => config.digits);
  const optimismBoosts = mapConfigField(marketConfigs[10], optimismMarkets, config => config.boost);
  const optimismDeboosts = mapConfigField(marketConfigs[10], optimismMarkets, config => config.deboost);
  const optimismSupplyRatios = mapConfigField(marketConfigs[10], optimismMarkets, config => config.supply);
  const optimismBorrowRatios = mapConfigField(marketConfigs[10], optimismMarkets, config => config.borrow);
  const optimismEnabled = mapConfigField(marketConfigs[10], optimismMarkets, config => config.enabled);

  const ethereumNames = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.nameOverride);
  const ethereumAliases = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.alias);
  const ethereumDigits = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.digits);
  const ethereumBoosts = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.boost);
  const ethereumDeboosts = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.deboost);
  const ethereumSupplyRatios = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.supply);
  const ethereumBorrowRatios = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.borrow);
  const ethereumEnabled = mapConfigField(marketConfigs[1], ethereumMarkets, config => config.enabled);

  // Fetch prices from oracle for Base
  const basePricesResponse = await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      ...baseOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  });
  
  // Check for zero prices and log them
  const basePrices = basePricesResponse.map((price, index) => {
    if (price.status === 'failure' || price.result === undefined) {
      const errorDetails = price.error ? JSON.stringify(price.error, null, 2) : 'RPC call failed';
      console.error(`⚠️ ERROR: Base market ${baseNames[index]} (${baseMarkets[index]}) price fetch failed:`);
      console.error(errorDetails);
      return undefined;
    }
    const priceValue = price.result as bigint;
    if (priceValue === BigInt(0)) {
      console.log(`⚠️ ZERO PRICE ALERT: Base market ${baseNames[index]} (${baseMarkets[index]}) has price = 0`);
    }
    return priceValue;
  });

  const usdcIndex = baseMarkets.findIndex(
    (market) => baseNames[baseMarkets.indexOf(market)] === "USDC"
  );

  if (usdcIndex === -1) {
    throw new Error("USDC market not found in Base markets");
  }

  const usdcPrice = basePrices[usdcIndex];
  if (usdcPrice === undefined) {
    throw new Error("USDC price fetch failed on Base");
  }

  const baseNativePrice = formatUnits(
    usdcPrice,
    (36 - 6)
  );

  // Fetch prices from oracle for Optimism
  const optimismPricesResponse = await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      ...optimismOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  });
  
  // Check for zero prices and log them
  const optimismPrices = optimismPricesResponse.map((price, index) => {
    if (price.status === 'failure' || price.result === undefined) {
      const errorDetails = price.error ? JSON.stringify(price.error, null, 2) : 'RPC call failed';
      console.error(`⚠️ ERROR: Optimism market ${optimismNames[index]} (${optimismMarkets[index]}) price fetch failed:`);
      console.error(errorDetails);
      return undefined;
    }
    const priceValue = price.result as bigint;
    if (priceValue === BigInt(0)) {
      console.log(`⚠️ ZERO PRICE ALERT: Optimism market ${optimismNames[index]} (${optimismMarkets[index]}) has price = 0`);
    }
    return priceValue;
  });

  const opIndex = optimismMarkets.findIndex(
    (market) => optimismNames[optimismMarkets.indexOf(market)] === "OP"
  );

  if (opIndex === -1) {
    throw new Error("OP market not found in Optimism markets");
  }

  const opPrice = optimismPrices[opIndex];
  if (opPrice === undefined) {
    throw new Error("OP price fetch failed on Optimism");
  }

  const optimismNativePrice = formatUnits(
    opPrice,
    (36 - 18)
  );

  // Fetch prices from oracle for Ethereum
  const ethereumPricesResponse = await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      ...ethereumOracleContract,
      functionName: "getUnderlyingPrice",
      args: [market],
    } as ContractCall)),
  });

  // Check for zero prices and log them
  const ethereumPrices = ethereumPricesResponse.map((price, index) => {
    if (price.status === 'failure' || price.result === undefined) {
      const errorDetails = price.error ? JSON.stringify(price.error, null, 2) : 'RPC call failed';
      console.error(`⚠️ ERROR: Ethereum market ${ethereumNames[index]} (${ethereumMarkets[index]}) price fetch failed:`);
      console.error(errorDetails);
      return undefined;
    }
    const priceValue = price.result as bigint;
    if (priceValue === BigInt(0)) {
      console.log(`⚠️ ZERO PRICE ALERT: Ethereum market ${ethereumNames[index]} (${ethereumMarkets[index]}) has price = 0`);
    }
    return priceValue;
  });

  const ethPrice = basePrices.find(
    (_price, index) => baseMarkets[index].toLowerCase() === marketConfigs[8453].find(config => config.nameOverride === 'ETH')?.address.toLowerCase()
  ) || BigInt(0);

  const cbBTCPrice = basePrices.find(
    (_price, index) => baseMarkets[index].toLowerCase() === marketConfigs[8453].find(config => config.nameOverride === 'cbBTC')?.address.toLowerCase()
  ) || BigInt(0);

  const eurcPrice = basePrices.find(
    (_price, index) => baseMarkets[index].toLowerCase() === marketConfigs[8453].find(config => config.nameOverride === 'EURC')?.address.toLowerCase()
  ) || BigInt(0);

  const wellPrice = (await baseClient.readContract({
    ...aeroMarketContract,
    functionName: "quote",
    blockNumber: BigInt(baseBlockNumber),
    args: [xWellToken.address, BigInt(1e18), BigInt(1)],
  })) * BigInt(ethPrice) as bigint;

  const baseSupplies = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const optimismSupplies = (await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const baseBorrows = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const optimismBorrows = (await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const baseReserves = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalReserves",
    })),
  })).map((reserves) => reserves.result as bigint);

  const optimismReserves = (await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalReserves",
    })),
  })).map((reserves) => reserves.result as bigint);

  const baseExchangeRates = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  const optimismExchangeRates = (await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  // Ethereum market state (grouped: supplies / borrows / reserves / exchange rates)
  const ethereumSupplies = (await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalSupply",
    } as ContractCall)),
  })).map((supply) => supply.result as bigint);

  const ethereumBorrows = (await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalBorrows",
    } as ContractCall)),
  })).map((borrow) => borrow.result as bigint);

  const ethereumReserves = (await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "totalReserves",
    })),
  })).map((reserves) => reserves.result as bigint);

  const ethereumExchangeRates = (await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      address: market as `0x${string}`,
      abi: mTokenv2ABI,
      functionName: "exchangeRateStored",
    } as ContractCall)),
  })).map((exchangeRate) => exchangeRate.result as bigint);

  // Functions to get emissions per second. Each getConfigForMarket result contains
  // both supplyEmissionsPerSec and borrowEmissionsPerSec, so fetch one multicall per
  // (chain, reward token) pair and split the fields.
  type EmissionsConfig = { supplyEmissionsPerSec: bigint; borrowEmissionsPerSec: bigint } | undefined;
  const supplySpeedsOf = (configs: EmissionsConfig[]) =>
    configs.map(result => result ? result.supplyEmissionsPerSec : BigInt(0));
  const borrowSpeedsOf = (configs: EmissionsConfig[]) =>
    configs.map(result => result ? result.borrowEmissionsPerSec : BigInt(0));

  const baseWellConfigs = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((speedConfig) => speedConfig.result as EmissionsConfig);
  const baseWellSupplySpeeds = supplySpeedsOf(baseWellConfigs);
  const baseWellBorrowSpeeds = borrowSpeedsOf(baseWellConfigs);

  const optimismWellConfigs = (await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((speedConfig) => speedConfig.result as EmissionsConfig);
  const optimismWellSupplySpeeds = supplySpeedsOf(optimismWellConfigs);
  const optimismWellBorrowSpeeds = borrowSpeedsOf(optimismWellConfigs);

  const ethereumWellConfigs = (await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      address: ethereumMultiRewardDistributor.address,
      abi: ethereumMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, xWellToken.address],
    } as ContractCall)),
  })).map((speedConfig) => speedConfig.result as EmissionsConfig);
  const ethereumWellSupplySpeeds = supplySpeedsOf(ethereumWellConfigs);
  const ethereumWellBorrowSpeeds = borrowSpeedsOf(ethereumWellConfigs);

  // No native reward token on Ethereum mainnet (nativePerEpoch is 0): zero arrays
  // keep the shared formatResults shape without querying a nonexistent rewarder.
  const ethereumNativeSupplySpeeds = ethereumMarkets.map(() => BigInt(0));
  const ethereumNativeBorrowSpeeds = ethereumMarkets.map(() => BigInt(0));

  const baseNativeConfigs = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: baseMultiRewardDistributor.address,
      abi: baseMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, baseNativeToken],
    } as ContractCall)),
  })).map((speedConfig) => speedConfig.result as EmissionsConfig);
  const baseNativeSupplySpeeds = supplySpeedsOf(baseNativeConfigs);
  const baseNativeBorrowSpeeds = borrowSpeedsOf(baseNativeConfigs);

  const optimismNativeConfigs = (await optimismClient.multicall({
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: optimismMultiRewardDistributor.address,
      abi: optimismMultiRewardDistributor.abi,
      functionName: "getConfigForMarket",
      args: [market, optimismNativeToken],
    } as ContractCall)),
  })).map((speedConfig) => speedConfig.result as EmissionsConfig);
  const optimismNativeSupplySpeeds = supplySpeedsOf(optimismNativeConfigs);
  const optimismNativeBorrowSpeeds = borrowSpeedsOf(optimismNativeConfigs);

  const baseMarketInfo = (await baseClient.multicall({
    blockNumber: BigInt(baseBlockNumber),
    contracts: baseMarkets.map(market => ({
      address: baseViewsContract.address,
      abi: baseViewsContract.abi,
      functionName: "getMarketInfo",
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
    blockNumber: BigInt(optimismBlockNumber),
    contracts: optimismMarkets.map(market => ({
      address: optimismViewsContract.address,
      abi: optimismViewsContract.abi,
      functionName: "getMarketInfo",
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

  const ethereumMarketInfo = (await ethereumClient.multicall({
    blockNumber: BigInt(ethereumBlockNumber),
    contracts: ethereumMarkets.map(market => ({
      address: ethereumViewsContract.address,
      abi: ethereumViewsContract.abi,
      functionName: "getMarketInfo",
      args: [market],
    } as ContractCall)),
  }));

  const ethereumSupplyRates = ethereumMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Ethereum market at index ${index} has undefined result`, ethereumMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { supplyRate: bigint }).supplyRate;
  });

  const ethereumBorrowRates = ethereumMarketInfo.map((market, index) => {
    if (!market || !market.result) {
      console.log(`⚠️ UNDEFINED RESULT: Ethereum market at index ${index} has undefined result`, ethereumMarkets[index]);
      return BigInt(0); // Provide a default value to prevent the error
    }
    return (market.result as { borrowRate: bigint }).borrowRate;
  });

  const baseWellSupplyPerDay = baseWellSupplySpeeds.map((speed) => speed * BigInt(86400));
  const baseWellBorrowPerDay = baseWellBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const optimismWellSupplyPerDay = optimismWellSupplySpeeds.map((speed) => speed * BigInt(86400));
  const optimismWellBorrowPerDay = optimismWellBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const baseNativeSupplyPerDay = baseNativeSupplySpeeds.map((speed) => speed * BigInt(86400));
  const baseNativeBorrowPerDay = baseNativeBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const optimismNativeSupplyPerDay = optimismNativeSupplySpeeds.map((speed) => speed * BigInt(86400));
  const optimismNativeBorrowPerDay = optimismNativeBorrowSpeeds.map((speed) => speed * BigInt(86400));

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

  // Ethereum per-day amounts (native entries are zeros: no native reward token)
  const ethereumWellSupplyPerDay = ethereumWellSupplySpeeds.map((speed) => speed * BigInt(86400));
  const ethereumWellBorrowPerDay = ethereumWellBorrowSpeeds.map((speed) => speed * BigInt(86400));
  const ethereumNativeSupplyPerDay = ethereumNativeSupplySpeeds.map((speed) => speed * BigInt(86400));
  const ethereumNativeBorrowPerDay = ethereumNativeBorrowSpeeds.map((speed) => speed * BigInt(86400));

  const ethereumWellSupplyPerDayUsd = ethereumWellSupplyPerDay.map(
    (supplyPerDay) =>
      Number(formatUnits(supplyPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const ethereumWellBorrowPerDayUsd = ethereumWellBorrowPerDay.map(
    (borrowPerDay) =>
      Number(formatUnits(borrowPerDay, 18)) * Number(formatUnits(wellPrice, 36))
  );

  const ethereumNativeSupplyPerDayUsd = ethereumNativeSupplyPerDay.map(() => 0);
  const ethereumNativeBorrowPerDayUsd = ethereumNativeBorrowPerDay.map(() => 0);

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

  const baseTotalSupplyUsd = baseMarkets.map((_market, index) => {
    if (!baseEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const supply = baseSupplies[index];
    const exchangeRate = baseExchangeRates[index];
    const price = basePrices[index];
    // Index directly (not filter-then-index, which misaligns on unconfigured markets).
    const digit = baseDigits[index];
    const boost = baseBoosts[index];
    const deboost = baseDeboosts[index];

    // Add null checks before using formatUnits
    if (supply === undefined || exchangeRate === undefined || price === undefined ||
        digit == null || boost == null || deboost == null) {
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

  const optimismTotalSupplyUsd = optimismMarkets.map((_market, index) => {
    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const supply = optimismSupplies[index];
    const exchangeRate = optimismExchangeRates[index];
    const price = optimismPrices[index];
    // Index directly (not filter-then-index, which misaligns on unconfigured markets).
    const digit = optimismDigits[index];
    const boost = optimismBoosts[index];
    const deboost = optimismDeboosts[index];

    // Add null checks before using formatUnits
    if (supply === undefined || exchangeRate === undefined || price === undefined ||
        digit == null || boost == null || deboost == null) {
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

  const ethereumTotalSupplyUsd = ethereumMarkets.map((_market, index) => {
    if (!ethereumEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const supply = ethereumSupplies[index];
    const exchangeRate = ethereumExchangeRates[index];
    const price = ethereumPrices[index];
    // Index directly (not filter-then-index, which misaligns every later market
    // when an on-chain market is missing from marketConfigs[1]); null means unconfigured.
    const digit = ethereumDigits[index];
    const boost = ethereumBoosts[index];
    const deboost = ethereumDeboosts[index];

    // Add null checks before using formatUnits
    if (supply === undefined || exchangeRate === undefined || price === undefined ||
        digit == null || boost == null || deboost == null) {
      console.log(`⚠️ MISSING DATA: Ethereum market ${index} missing data for totalSupplyUSD calculation`);
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
    // Guard against a fully-disabled network (total === 0) producing NaN percentages.
    return totalSupplyUsd.map(value => total === 0 ? 0 : value / total);
  }

  const basePercentages = calculatePercentages(baseTotalSupplyUsd);
  const optimismPercentages = calculatePercentages(optimismTotalSupplyUsd);
  const ethereumPercentages = calculatePercentages(ethereumTotalSupplyUsd);

  const baseTotalBorrowsUsd = baseMarkets.map((_market, index) => {
    if (!baseEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const borrow = baseBorrows[index];
    const price = basePrices[index];
    // Index directly (not filter-then-index, which misaligns on unconfigured markets).
    const digit = baseDigits[index];

    // Add null checks before using formatUnits
    if (borrow === undefined || price === undefined || digit == null) {
      console.log(`⚠️ MISSING DATA: Base market ${index} missing data for totalBorrowsUSD calculation`);
      return 0;
    }
    
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const optimismTotalBorrowsUsd = optimismMarkets.map((_market, index) => {
    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const borrow = optimismBorrows[index];
    const price = optimismPrices[index];
    // Index directly (not filter-then-index, which misaligns on unconfigured markets).
    const digit = optimismDigits[index];

    // Add null checks before using formatUnits
    if (borrow === undefined || price === undefined || digit == null) {
      console.log(`⚠️ MISSING DATA: Optimism market ${index} missing data for totalBorrowsUSD calculation`);
      return 0;
    }
    
    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  const ethereumTotalBorrowsUsd = ethereumMarkets.map((_market, index) => {
    if (!ethereumEnabled[index]) { // Only include markets that are enabled
      return 0;
    }
    const borrow = ethereumBorrows[index];
    const price = ethereumPrices[index];
    // Index directly (not filter-then-index, which misaligns on unconfigured markets).
    const digit = ethereumDigits[index];

    // Add null checks before using formatUnits
    if (borrow === undefined || price === undefined || digit == null) {
      console.log(`⚠️ MISSING DATA: Ethereum market ${index} missing data for totalBorrowsUSD calculation`);
      return 0;
    }

    return (
      Number(formatUnits(borrow, digit)) *
      Number(formatUnits(price, 36 - digit))
    );
  });

  // A network's total is the sum of its per-market supply USD (enabled-gated, boost/deboost
  // included) and borrow USD arrays computed above — reusing them keeps the network total
  // index-aligned with the per-market math (no separate, drift-prone re-derivation).
  const sumUsd = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

  // A network with rewardsEnabled: false contributes 0 TVL to the cross-network split,
  // so it receives no WELL and the remaining networks absorb its share proportionally.
  const baseNetworkTotalUsd = !config.base.rewardsEnabled ? 0 :
    sumUsd(baseTotalSupplyUsd) + sumUsd(baseTotalBorrowsUsd);

  const optimismNetworkTotalUsd = !config.optimism.rewardsEnabled ? 0 :
    sumUsd(optimismTotalSupplyUsd) + sumUsd(optimismTotalBorrowsUsd);

  const ethereumNetworkTotalUsd = !config.ethereum.rewardsEnabled ? 0 :
    sumUsd(ethereumTotalSupplyUsd) + sumUsd(ethereumTotalBorrowsUsd);

  const allNetworksTotalUsd = baseNetworkTotalUsd + optimismNetworkTotalUsd + ethereumNetworkTotalUsd;

  // Guard against every network being disabled (total === 0) producing NaN shares.
  const networkShare = (networkTotalUsd: number) =>
    allNetworksTotalUsd === 0 ? 0 : networkTotalUsd / allNetworksTotalUsd;

  const baseTotalMarketPercentage = networkShare(baseNetworkTotalUsd);

  const optimismTotalMarketPercentage = networkShare(optimismNetworkTotalUsd);

  const ethereumTotalMarketPercentage = networkShare(ethereumNetworkTotalUsd);

  const baseNewWellSupplySpeeds = baseMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(baseWellSupplySpeeds[index], 18));

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18 : 0;
    }
    const totalWellPerEpochMarkets =
      config.totalWellPerEpoch
      * baseTotalMarketPercentage
      * config.base.markets;
    const percentage = basePercentages[index];
    const supplyRatio = baseSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * supplyRatio) / config.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const baseNewWellBorrowSpeeds = baseMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(baseWellBorrowSpeeds[index], 18));

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18: 1e-18;
    }
    const totalWellPerEpochMarkets =
      config.totalWellPerEpoch
      * baseTotalMarketPercentage
      * config.base.markets;
    const percentage = basePercentages[index];
    const borrowRatio = baseBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / config.secondsPerEpoch);
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

  const optimismNewWellSupplySpeeds = optimismMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(optimismWellSupplySpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18: 0;
    }
    const totalWellPerEpochMarkets =
      config.totalWellPerEpoch
      * optimismTotalMarketPercentage
      * config.optimism.markets;
    const percentage = optimismPercentages[index];
    const supplyRatio = optimismSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * supplyRatio) / config.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const optimismNewWellBorrowSpeeds = optimismMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(optimismWellBorrowSpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18: 1e-18;
    }

    const totalWellPerEpochMarkets =
      config.totalWellPerEpoch
      * optimismTotalMarketPercentage
      * config.optimism.markets;
    const percentage = optimismPercentages[index];
    const borrowRatio = optimismBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / config.secondsPerEpoch);
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

  const ethereumNewWellSupplySpeeds = ethereumMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(ethereumWellSupplySpeeds[index], 18));

    if (!ethereumEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18 : 0;
    }
    const totalWellPerEpochMarkets =
      config.totalWellPerEpoch
      * ethereumTotalMarketPercentage
      * config.ethereum.markets;
    const percentage = ethereumPercentages[index];
    const supplyRatio = ethereumSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * supplyRatio) / config.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const ethereumNewWellBorrowSpeeds = ethereumMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(ethereumWellBorrowSpeeds[index], 18));

    if (!ethereumEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18 : 1e-18;
    }

    const totalWellPerEpochMarkets =
      config.totalWellPerEpoch
      * ethereumTotalMarketPercentage
      * config.ethereum.markets;
    const percentage = ethereumPercentages[index];
    const borrowRatio = ethereumBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalWellPerEpochMarkets * percentage * borrowRatio) / config.secondsPerEpoch);
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

  // No native rewards on Ethereum: "no change" sentinels keep the MRD untouched.
  const ethereumNewNativeSupplySpeeds = ethereumMarkets.map(() => -1e-18);
  const ethereumNewNativeBorrowSpeeds = ethereumMarkets.map(() => -1e-18);

  const baseNewNativeSupplySpeeds = baseMarkets.map((market, index) => {
    const currentSpeed = Number(formatUnits(baseNativeSupplySpeeds[index], 6));

    if (market === '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22') {
      // Gauntlet is USDC emissions admin - don't change
      return -1e-6;
    }

    if (!baseEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-6 : 0;
    }

    const totalNativePerEpochMarkets = config.base.nativePerEpoch;
    const percentage = basePercentages[index];
    const supplyRatio = baseSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * supplyRatio) / config.secondsPerEpoch);

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

    const totalNativePerEpochMarkets = config.base.nativePerEpoch;
    const percentage = basePercentages[index];
    const borrowRatio = baseBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / config.secondsPerEpoch);

    // Return -1 if the speeds are the same
    if ((calculatedSpeed === 0) && (currentSpeed === 0.000001)) {
      return -1e-6;
    }

    // Special case: if speed is 0, return 1e-6 instead (USDC is 6 digits)
    return calculatedSpeed === 0 ? 1e-6 : calculatedSpeed;
  });

  const optimismNewNativeSupplySpeeds = optimismMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(optimismNativeSupplySpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 0 ? -1e-18 : 0;
    }

    const totalNativePerEpochMarkets = config.optimism.nativePerEpoch;
    const percentage = optimismPercentages[index];
    const supplyRatio = optimismSupplyRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * supplyRatio) / config.secondsPerEpoch);

    // Return -1 if the speeds are the same, otherwise return the calculated speed
    return Math.abs(calculatedSpeed - currentSpeed) < 1e-18 ? -1e-18 : calculatedSpeed;
  });

  const optimismNewNativeBorrowSpeeds = optimismMarkets.map((_market, index) => {
    const currentSpeed = Number(formatUnits(optimismNativeBorrowSpeeds[index], 18));

    if (!optimismEnabled[index]) { // Only include markets that are enabled
      return currentSpeed === 1e-18 ? -1e-18 : 1e-18;
    }

    const totalNativePerEpochMarkets = config.optimism.nativePerEpoch;
    const percentage = optimismPercentages[index];
    const borrowRatio = optimismBorrowRatios[index] ?? 0;
    const calculatedSpeed = Number((totalNativePerEpochMarkets * percentage * borrowRatio) / config.secondsPerEpoch);

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
  ) => markets.map((market: any, index: any) => {
    // suppliesUsd includes the flat USD boost/deboost used to skew reward
    // allocation; APRs shown to suppliers must be computed on real TVL only.
    const realSupplyUsd = suppliesUsd[index] - boosts[index] + deboosts[index];
    return {
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
        console.log(`⚠️ ZERO SUPPLY USD ALERT: ${CHAIN_NAMES[String(chainId) as ChainId]} market ${names[index]} (${market}) has totalSupplyUSD = 0`);
      }
      return value;
    })(),
    totalBorrowsUSD: (() => {
      const value = Number(borrowsUsd[index].toFixed(2));
      if (value === 0 && enabled[index]) {
        console.log(`⚠️ ZERO BORROW USD ALERT: ${CHAIN_NAMES[String(chainId) as ChainId]} market ${names[index]} (${market}) has totalBorrowsUSD = 0`);
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
      Number(
        formatUnits(
          nativeSupplyPerDay[index],
          digits[index] as number
        )).toFixed(18),
    nativeBorrowPerDay:
      Number(
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
    wellSupplyApr: realSupplyUsd > 0 ? Number((
      wellSupplyPerDayUsd[index]
      / realSupplyUsd
      * 365 * 100).toFixed(2)
    ) : Number(0).toFixed(2),
    wellBorrowApr: borrowsUsd[index] > 0 ? Number((
      wellBorrowPerDayUsd[index]
      / borrowsUsd[index]
      * 365 * 100).toFixed(2)) : Number(0).toFixed(2)
    ,
    nativeSupplyApr: realSupplyUsd > 0 ? Number((
      nativeSupplyPerDayUsd[index]
      / realSupplyUsd
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
    newWellSupplyApr: realSupplyUsd > 0 ? Number((
      (newWellSupplySpeed[index] * 86400 * Number(wellPrice))
      / realSupplyUsd
      * 365 * 100).toFixed(2),
    ) : Number(0).toFixed(2),
    newWellBorrowApr: borrowsUsd[index] > 0 ? Number((
      (newWellBorrowSpeed[index] * 86400 * Number(wellPrice))
      / borrowsUsd[index]
      * 365 * 100).toFixed(2),
    ) : Number(0).toFixed(2),
    newNativeSupplyApr: realSupplyUsd > 0 ? Number((
      (newNativeSupplySpeed[index] * 86400 * Number(nativePrice))
      / realSupplyUsd
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
  };
  });

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

  // Get meUSDC MetaMorpho vault TVL (using latest block, not historical)
  // Fetch all MetaMorpho vault TVLs on Base
  const erc4626TotalAssetsAbi = [
    {
      "inputs": [],
      "name": "totalAssets",
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

  const [wethVaultTotalAssets, usdcVaultTotalAssets, eurcVaultTotalAssets, cbBTCVaultTotalAssets, meUSDCVaultTotalAssets] = await Promise.all([
    baseClient.readContract({
      address: config.base.vaultAddresses.WETH,
      abi: erc4626TotalAssetsAbi,
      functionName: "totalAssets",
      blockNumber: BigInt(baseBlockNumber),
    }) as Promise<bigint>,
    baseClient.readContract({
      address: config.base.vaultAddresses.USDC,
      abi: erc4626TotalAssetsAbi,
      functionName: "totalAssets",
      blockNumber: BigInt(baseBlockNumber),
    }) as Promise<bigint>,
    baseClient.readContract({
      address: config.base.vaultAddresses.EURC,
      abi: erc4626TotalAssetsAbi,
      functionName: "totalAssets",
      blockNumber: BigInt(baseBlockNumber),
    }) as Promise<bigint>,
    baseClient.readContract({
      address: config.base.vaultAddresses.cbBTC,
      abi: erc4626TotalAssetsAbi,
      functionName: "totalAssets",
      blockNumber: BigInt(baseBlockNumber),
    }) as Promise<bigint>,
    baseClient.readContract({
      address: config.base.vaultAddresses.meUSDC,
      abi: erc4626TotalAssetsAbi,
      functionName: "totalAssets",
      blockNumber: BigInt(baseBlockNumber),
    }) as Promise<bigint>,
  ]);

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

  return {
    1: formatResults(
      ethereumMarkets,
      1,
      ethereumNames,
      ethereumAliases,
      // Index-aligned with the markets array; null only occurs for unconfigured
      // markets, which are also enabled=null and skipped by every consumer.
      ethereumDigits as number[],
      ethereumBoosts,
      ethereumDeboosts,
      ethereumSupplyRatios,
      ethereumBorrowRatios,
      ethereumEnabled,
      ethereumPrices,
      ethereumSupplies,
      ethereumBorrows,
      ethereumReserves,
      ethereumTotalSupplyUsd,
      ethereumTotalBorrowsUsd,
      ethereumExchangeRates,
      ethereumSupplyRates,
      ethereumBorrowRates,
      ethereumWellSupplySpeeds,
      ethereumWellBorrowSpeeds,
      ethereumNativeSupplySpeeds,
      ethereumNativeBorrowSpeeds,
      ethereumWellSupplyPerDay,
      ethereumWellBorrowPerDay,
      ethereumNativeSupplyPerDay,
      ethereumNativeBorrowPerDay,
      ethereumWellSupplyPerDayUsd,
      ethereumWellBorrowPerDayUsd,
      ethereumNativeSupplyPerDayUsd,
      ethereumNativeBorrowPerDayUsd,
      ethereumPercentages,
      Number((config.totalWellPerEpoch * ethereumTotalMarketPercentage) * config.ethereum.markets),
      ethereumNewWellSupplySpeeds,
      ethereumNewWellBorrowSpeeds,
      ethereumNewNativeSupplySpeeds,
      ethereumNewNativeBorrowSpeeds,
      formatUnits(wellPrice, 36),
      "0", // no native reward token on Ethereum
      Number(config.ethereum.nativePerEpoch),
    ),
    10: formatResults(
      optimismMarkets,
      10,
      optimismNames,
      optimismAliases,
      optimismDigits as number[], // index-aligned; null = unconfigured (skipped)
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
      Number((config.totalWellPerEpoch * optimismTotalMarketPercentage) * config.optimism.markets),
      optimismNewWellSupplySpeeds,
      optimismNewWellBorrowSpeeds,
      optimismNewNativeSupplySpeeds,
      optimismNewNativeBorrowSpeeds,
      formatUnits(wellPrice, 36),
      optimismNativePrice,
      Number(config.optimism.nativePerEpoch),
    ),
    8453: formatResults(
      baseMarkets,
      8453,
      baseNames,
      baseAliases,
      baseDigits as number[], // index-aligned; null = unconfigured (skipped)
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
      Number((config.totalWellPerEpoch * baseTotalMarketPercentage) * config.base.markets),
      baseNewWellSupplySpeeds,
      baseNewWellBorrowSpeeds,
      baseNewNativeSupplySpeeds,
      baseNewNativeBorrowSpeeds,
      formatUnits(wellPrice, 36),
      baseNativePrice,
      Number(config.base.nativePerEpoch),
    ),
    wellPrice: formatUnits(wellPrice, 36),
    usdcPrice: baseNativePrice,
    opPrice: optimismNativePrice,
    epochStartTimestamp: epochWindow.start,
    epochEndTimestamp: epochWindow.end,
    totalSeconds: epochWindow.durationSeconds,
    wellPerEpoch: config.totalWellPerEpoch,
    timestamp: timestamp,
    baseBlockNumber: baseBlockNumber,
    optimismBlockNumber: optimismBlockNumber,
    ethereumBlockNumber: ethereumBlockNumber,
    ethereum: {
      ...config.ethereum,
      networkTotalUsd: ethereumNetworkTotalUsd,
      totalMarketPercentage: ethereumTotalMarketPercentage,
      wellPerEpoch: Number(config.totalWellPerEpoch * ethereumTotalMarketPercentage).toFixed(18),
      nativePerEpoch: config.ethereum.nativePerEpoch,
      wellPerEpochMarkets: Number((config.totalWellPerEpoch * ethereumTotalMarketPercentage) * config.ethereum.markets).toFixed(18),
      wellPerEpochSafetyModule: Number((config.totalWellPerEpoch * ethereumTotalMarketPercentage) * config.ethereum.safetyModule).toFixed(18),
      wellPerEpochDex: Number((config.totalWellPerEpoch * ethereumTotalMarketPercentage) * config.ethereum.dex).toFixed(18),
    },
    base: {
      ...config.base,
      networkTotalUsd: baseNetworkTotalUsd,
      totalMarketPercentage: baseTotalMarketPercentage,
      wellPerEpoch: Number(config.totalWellPerEpoch * baseTotalMarketPercentage).toFixed(18),
      nativePerEpoch: config.base.nativePerEpoch,
      wellPerEpochMarkets: Number((config.totalWellPerEpoch * baseTotalMarketPercentage) * config.base.markets).toFixed(18),
      wellPerEpochSafetyModule: Number(((config.totalWellPerEpoch) * baseTotalMarketPercentage) * config.base.safetyModule).toFixed(18),
      wellPerEpochDex: Number((config.totalWellPerEpoch * baseTotalMarketPercentage) * config.base.dex).toFixed(18),
      wellHolderBalance: baseWellHolderBalance.toString(),
      wellPerEpochVaults: Number((config.totalWellPerEpoch * baseTotalMarketPercentage) * config.base.vaults).toFixed(18),
      vaultAmounts: (() => {
        // Calculate total WELL allocation for vaults
        const totalVaultWELL = (config.totalWellPerEpoch * baseTotalMarketPercentage) * config.base.vaults;

        // Calculate USD TVL for each vault
        // Oracle returns prices in (36 - underlyingDecimals) format
        // ETH: 18 decimals, so price is in 36-18=18 decimals
        // cbBTC: 8 decimals, so price is in 36-8=28 decimals
        // EURC: 6 decimals, so price is in 36-6=30 decimals
        const ethPriceUSD = Number(formatUnits(ethPrice, 18));
        const cbBTCPriceUSD = Number(formatUnits(cbBTCPrice, 28));
        const eurcPriceUSD = Number(formatUnits(eurcPrice, 30));

        const wethTVL_USD = Number(formatUnits(wethVaultTotalAssets, 18)) * ethPriceUSD;
        const usdcTVL_USD = Number(formatUnits(usdcVaultTotalAssets, 6)); // USDC = $1
        const eurcTVL_USD = Number(formatUnits(eurcVaultTotalAssets, 6)) * eurcPriceUSD; // EURC in USD
        const cbBTCTVL_USD = Number(formatUnits(cbBTCVaultTotalAssets, 8)) * cbBTCPriceUSD;
        const meUSDCTVL_USD = Number(formatUnits(meUSDCVaultTotalAssets, 6)); // meUSDC = $1

        // Apply weight multipliers from config (mainConfig.base.vaultWeightMultipliers
        // is the source of truth for per-vault weights)
        const wethWeighted = wethTVL_USD * config.base.vaultWeightMultipliers.WETH;
        const usdcWeighted = usdcTVL_USD * config.base.vaultWeightMultipliers.USDC;
        const eurcWeighted = eurcTVL_USD * config.base.vaultWeightMultipliers.EURC;
        const cbBTCWeighted = cbBTCTVL_USD * config.base.vaultWeightMultipliers.cbBTC;
        const meUSDCWeighted = meUSDCTVL_USD * config.base.vaultWeightMultipliers.meUSDC;

        // Calculate total weighted TVL
        const totalWeighted = wethWeighted + usdcWeighted + eurcWeighted + cbBTCWeighted + meUSDCWeighted;

        // Distribute proportionally based on weighted TVL
        return {
          WETH: Number((wethWeighted / totalWeighted) * totalVaultWELL).toFixed(18),
          USDC: Number((usdcWeighted / totalWeighted) * totalVaultWELL).toFixed(18),
          EURC: Number((eurcWeighted / totalWeighted) * totalVaultWELL).toFixed(18),
          cbBTC: Number((cbBTCWeighted / totalWeighted) * totalVaultWELL).toFixed(18),
          meUSDC: Number((meUSDCWeighted / totalWeighted) * totalVaultWELL).toFixed(18),
        };
      })(),
    },
    optimism: {
      ...config.optimism,
      networkTotalUsd: optimismNetworkTotalUsd,
      totalMarketPercentage: optimismTotalMarketPercentage,
      wellPerEpoch: Number(config.totalWellPerEpoch * optimismTotalMarketPercentage).toFixed(18),
      nativePerEpoch: config.optimism.nativePerEpoch,
      wellPerEpochMarkets: Number((config.totalWellPerEpoch * optimismTotalMarketPercentage) * config.optimism.markets).toFixed(18),
      wellPerEpochSafetyModule: Number(((config.totalWellPerEpoch) * optimismTotalMarketPercentage) * config.optimism.safetyModule).toFixed(18),
      wellPerEpochDex: Number((config.totalWellPerEpoch * optimismTotalMarketPercentage) * config.optimism.dex).toFixed(18),
      wellHolderBalance: optimismWellHolderBalance.toString(),
      optimismUSDCVaultWellRewardAmount: Number((config.totalWellPerEpoch * optimismTotalMarketPercentage) * config.optimism.vaults),
    },
    baseStkWELLTotalSupply: baseStkWELLTotalSupply.toString(),
    optimismStkWELLTotalSupply: optimismStkWELLTotalSupply.toString(),
  };
}
