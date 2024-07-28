import BigNumber from 'bignumber.js';
import { MarketType, getMarketData } from "./markets";

export async function returnJson() {
  let marketData;
  try {
      marketData = await getMarketData();
  } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
  }
  console.log(marketData);

  const moonbeamSetRewardSpeeds = marketData["1284"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      market: market.market,
      name: market.name,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed).toString().concat('e18'),
      newSupplySpeed: market.newWellSupplySpeed.toString().concat('e18'),
      rewardType: 0, // 0 = WELL
    };
    const nativeRewardSpeeds = {
      market: market.market,
      name: market.name,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed).toString().concat('e18'),
      newSupplySpeed: market.newNativeSupplySpeed.toString().concat('e18'),
      rewardType: 1, // 1 = GLMR
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const baseSetRewardSpeeds = marketData["8453"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.market,
      name: market.name,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: market.newWellSupplySpeed.toString().concat('e18'),
    };
    const nativeRewardSpeeds = {
      emissionToken: "USDC",
      market: market.market,
      name: market.name,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: market.newNativeSupplySpeed.toString().concat('e18'),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const optimismSetRewardSpeeds = marketData["10"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.market,
      name: market.name,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: market.newWellSupplySpeed.toString().concat('e18'),
    };
    const nativeRewardSpeeds = {
      emissionToken: "OP",
      market: market.market,
      name: market.name,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: market.newNativeSupplySpeed.toString().concat('e18'),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  return {
    1284: {
      bridgeToRecipient: [
        { // Send total well per epoch - the DEX incentives to Base Temporal Governor
          amount: BigNumber(marketData.base.wellPerEpoch - marketData.base.wellPerEpochDex).toString().concat('e18'),
          network: 8453,
          target: "TEMPORAL_GOVERNOR"
        },
        { // Send Base DEX incentives to DEX Relayer
          amount: BigNumber(marketData.base.wellPerEpochDex).toString().concat('e18'),
          network: 8453,
          target: "DEX_RELAYER"
        },
        { // Send total well per epoch - the DEX incentives to Optimism Temporal Governor
          amount: BigNumber(marketData.optimism.wellPerEpoch - marketData.optimism.wellPerEpochDex).toString().concat('e18'),
          network: 10,
          target: "TEMPORAL_GOVERNOR"
        },
        { // Send Optimism DEX incentives to DEX Relayer
          amount: BigNumber(marketData.optimism.wellPerEpochDex).toString().concat('e18'),
          network: 10,
          target: "DEX_RELAYER"
        },
      ],
      setRewardSpeed: moonbeamSetRewardSpeeds,
      transferFrom: [
        { // Transfer bridge amounts and StellaSwap DEX incentives from F-GLMR-LM multisig to the governor
          amount: BigNumber(
            marketData.base.wellPerEpoch
            + marketData.optimism.wellPerEpoch
            + marketData.moonbeam.wellPerEpochDex
          ).toString().concat('e18'),
          from: "MGLIMMER_MULTISIG",
          to: "MULTICHAIN_GOVERNOR_PROXY",
          token: "WELL",
        },
        { // Transfer market rewards from F-GLMR-LM multisig to the Unitroller proxy
          amount: BigNumber(marketData.moonbeam.wellPerEpochMarkets).toString().concat('e18'),
          from: "MGLIMMER_MULTISIG",
          to: "UNITROLLER",
          token: "WELL",
        },
        { // Transfer Safety Module rewards from F-GLMR-LM multisig to the Ecosystem Reserve Proxy
          amount: BigNumber(marketData.moonbeam.wellPerEpochSafetyModule).toString().concat('e18'),
          from: "MGLIMMER_MULTISIG",
          to: "ECOSYSTEM_RESERVE_PROXY",
          token: "WELL",
        }
      ]
    },
    8453: {
      setMRDSpeeds: baseSetRewardSpeeds,
      transferFrom: [
        { // Transfer bridged market rewards to the Multi Reward Distributor
          amount: BigNumber(marketData.base.wellPerEpochMarkets).toString().concat('e18'),
          from: "TEMPORAL_GOVERNOR",
          to: "MULTI_REWARD_DISTRIBUTOR",
          token: "xWELL_PROXY",
        },
        { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
          amount: BigNumber(marketData.base.wellPerEpochSafetyModule).toString().concat('e18'),
          from: "TEMPORAL_GOVERNOR",
          to: "ECOSYSTEM_RESERVE_PROXY",
          token: "xWELL_PROXY",
        },
      ]
    },
    10: {
      setMRDSpeeds: optimismSetRewardSpeeds,
      transferFrom: [
        { // Transfer bridged market rewards to the Multi Reward Distributor
          amount: BigNumber(marketData.optimism.wellPerEpochMarkets).toString().concat('e18'),
          from: "TEMPORAL_GOVERNOR",
          to: "MULTI_REWARD_DISTRIBUTOR",
          token: "WELL",
        },
        { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
          amount: BigNumber(marketData.optimism.wellPerEpochSafetyModule).toString().concat('e18'),
          from: "TEMPORAL_GOVERNOR",
          to: "ECOSYSTEM_RESERVE_PROXY",
          token: "WELL",
        },
      ]
    },
    startTimeStamp: marketData.epochStartTimestamp,
    endTimeSTamp: marketData.epochEndTimestamp,
  }
}