import BigNumber from 'bignumber.js';
import { MarketType, getMarketData } from "./markets";
import { generateMarkdown } from "./generateMarkdown";

export async function returnJson(marketData: any) {
  const moonbeamSetRewardSpeeds = marketData["1284"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed).toString().concat('e18'),
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? '0' : new BigNumber(market.newWellSupplySpeed).toString().concat('e18'),
      rewardType: 0, // 0 = WELL
    };
    const nativeRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed).toString().concat('e18'),
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? '0' : market.newNativeSupplySpeed.toString().concat('e18'),
      rewardType: 1, // 1 = GLMR
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const baseSetRewardSpeeds = marketData["8453"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? '0' : new BigNumber(market.newWellSupplySpeed).toString().concat('e18'),
    };
    const nativeRewardSpeeds = {
      emissionToken: "USDC",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-6')) ? '1' : new BigNumber(market.newNativeBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? '0' : market.newNativeSupplySpeed.toString().concat('e18'),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const optimismSetRewardSpeeds = marketData["10"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? '0' : new BigNumber(market.newWellSupplySpeed).toString().concat('e18'),
    };
    const nativeRewardSpeeds = {
      emissionToken: "OP",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed).toString().concat('e18'),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? '0' : market.newNativeSupplySpeed.toString().concat('e18'),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  return {
    1284: {
      addRewardInfo: {
        amount: marketData.moonbeam.wellPerEpochDex.toString().concat('e18'),
        endTimestamp: marketData.epochEndTimestamp,
        pid: 15,
        rewardPerSec: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
          .div(BigNumber(marketData.totalSeconds))
          .toString().concat('e18'),
        target: "STELLASWAP_REWARDER",
      },
      bridgeToRecipient: [
        { // Send total well per epoch - the DEX incentives to Base Temporal Governor
          amount: BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
            .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
            .toString().concat('e18'),
          network: 8453,
          target: "TEMPORAL_GOVERNOR"
        },
        { // Send Base DEX incentives to DEX Relayer
          amount: BigNumber(marketData.base.wellPerEpochDex).toString().concat('e18'),
          network: 8453,
          target: "DEX_RELAYER"
        },
        { // Send total well per epoch - the DEX incentives to Optimism Temporal Governor
          amount: BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
            .minus(parseFloat(marketData.optimism.wellPerEpochDex).toFixed(18))
            .toString().concat('e18'),
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
      stkWellEmissionsPerSecond: Number(parseFloat(marketData.moonbeam.wellPerEpochSafetyModule) / marketData.totalSeconds).toString().concat('e18'),
      transferFrom: [
        { // Transfer bridge amounts and StellaSwap DEX incentives from F-GLMR-LM multisig to the governor
          amount: BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
            .plus(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18)))
            .plus(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18)))
            .toFixed(18, BigNumber.ROUND_DOWN)
            .concat('e18'),
          from: "MGLIMMER_MULTISIG",
          to: "MULTICHAIN_GOVERNOR_PROXY",
          token: "GOVTOKEN",
        },
        { // Transfer market rewards from F-GLMR-LM multisig to the Unitroller proxy
          amount: BigNumber(marketData.moonbeam.wellPerEpochMarkets).toString().concat('e18'),
          from: "MGLIMMER_MULTISIG",
          to: "UNITROLLER",
          token: "GOVTOKEN",
        },
        { // Transfer Safety Module rewards from F-GLMR-LM multisig to the Ecosystem Reserve Proxy
          amount: BigNumber(marketData.moonbeam.wellPerEpochSafetyModule).toString().concat('e18'),
          from: "MGLIMMER_MULTISIG",
          to: "ECOSYSTEM_RESERVE_PROXY",
          token: "GOVTOKEN",
        }
      ]
    },
    8453: {
      setMRDSpeeds: baseSetRewardSpeeds,
      stkWellEmissionsPerSecond: Number(parseFloat(marketData.base.wellPerEpochSafetyModule) / marketData.totalSeconds).toString().concat('e18'),
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
      stkWellEmissionsPerSecond: Number(parseFloat(marketData.optimism.wellPerEpochSafetyModule) / marketData.totalSeconds).toString().concat('e18'),
      transferFrom: [
        { // Transfer bridged market rewards to the Multi Reward Distributor
          amount: BigNumber(marketData.optimism.wellPerEpochMarkets).toString().concat('e18'),
          from: "TEMPORAL_GOVERNOR",
          to: "MULTI_REWARD_DISTRIBUTOR",
          token: "xWELL_PROXY",
        },
        { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
          amount: BigNumber(marketData.optimism.wellPerEpochSafetyModule).toString().concat('e18'),
          from: "TEMPORAL_GOVERNOR",
          to: "ECOSYSTEM_RESERVE_PROXY",
          token: "xWELL_PROXY",
        },
      ]
    },
    endTimeSTamp: marketData.epochEndTimestamp,
    startTimeStamp: marketData.epochStartTimestamp,
  }
}