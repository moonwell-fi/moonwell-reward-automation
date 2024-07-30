import BigNumber from 'bignumber.js';
import { MarketType, getMarketData } from "./markets";
import { generateMarkdown } from "./generateMarkdown";

BigNumber.config({
  EXPONENTIAL_AT: 40
})

export async function returnJson(marketData: any, network: string) {
  const moonbeamSetRewardSpeeds = marketData["1284"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? '0' : new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      rewardType: 0, // 0 = WELL
    };
    const nativeRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? '0' : new BigNumber(market.newNativeSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      rewardType: 1, // 1 = GLMR
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const baseSetRewardSpeeds = marketData["8453"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? '0' : new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
    };
    const nativeRewardSpeeds = {
      emissionToken: "USDC",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-6')) ? '1' : new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(6)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? '0' : new BigNumber(market.newNativeSupplySpeed)
        .shiftedBy(6)
        .integerValue().toNumber(),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const optimismSetRewardSpeeds = marketData["10"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? '0' : new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
    };
    const nativeRewardSpeeds = {
      emissionToken: "OP",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? '1' : new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? '0' : new BigNumber(market.newNativeSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  if (network === "Moonbeam") {
    return {
      1284: {
        addRewardInfo: {
          amount: BigNumber(marketData.moonbeam.wellPerEpochDex)
            .shiftedBy(18)
            .integerValue().toNumber(),
          endTimestamp: marketData.epochEndTimestamp,
          pid: 15,
          rewardPerSec: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
            .div(BigNumber(marketData.totalSeconds))
            .shiftedBy(18)
            .integerValue().toNumber(),
          target: "STELLASWAP_REWARDER",
        },
        setRewardSpeed: moonbeamSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochSafetyModule) / marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue().toNumber(),
        transferFrom: [
          { // Transfer bridge amounts and StellaSwap DEX incentives from F-GLMR-LM multisig to the governor
            amount: BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .plus(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18)))
              .plus(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18)))
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
          { // Transfer market rewards from F-GLMR-LM multisig to the Unitroller proxy
            amount: BigNumber(marketData.moonbeam.wellPerEpochMarkets)
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "UNITROLLER",
            token: "GOVTOKEN",
          },
          { // Transfer Safety Module rewards from F-GLMR-LM multisig to the Ecosystem Reserve Proxy
            amount: BigNumber(marketData.moonbeam.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "ECOSYSTEM_RESERVE_PROXY",
            token: "GOVTOKEN",
          },
        ],
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };
  } else if (network === "Base") {
    return {
      8453: {
        bridgeToRecipient: [
          { // Send total well per epoch - the DEX incentives to Base Temporal Governor
            amount: BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .integerValue().toNumber(),
            network: 8453,
            target: "TEMPORAL_GOVERNOR"
          },
          { // Send Base DEX incentives to DEX Relayer
            amount: BigNumber(marketData.base.wellPerEpochDex)
              .shiftedBy(18)
              .integerValue().toNumber(),
            network: 8453,
            target: "DEX_RELAYER"
          },
        ],
        setMRDSpeeds: baseSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.base.wellPerEpochSafetyModule) / marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue().toNumber(),
        transferFrom: [
          { // Transfer bridged market rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.base.wellPerEpochMarkets)
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "MULTI_REWARD_DISTRIBUTOR",
            token: "xWELL_PROXY",
          },
          { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.base.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "ECOSYSTEM_RESERVE_PROXY",
            token: "xWELL_PROXY",
          },
        ]
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };
  } else if (network === "Optimism") {
    return {
      10: {
        bridgeToRecipient: [
          { // Send total well per epoch - the DEX incentives to Optimism Temporal Governor
            amount: BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.optimism.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .integerValue().toNumber(),
            network: 10,
            target: "TEMPORAL_GOVERNOR"
          },
          { // Send Optimism DEX incentives to DEX Relayer
            amount: BigNumber(marketData.optimism.wellPerEpochDex)
              .shiftedBy(18)
              .integerValue().toNumber(),
            network: 10,
            target: "DEX_RELAYER"
          },
        ],
        setMRDSpeeds: optimismSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.optimism.wellPerEpochSafetyModule) / marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue()
          .toNumber(),
        transferFrom: [
          { // Transfer bridged market rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.optimism.wellPerEpochMarkets)
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "MULTI_REWARD_DISTRIBUTOR",
            token: "xWELL_PROXY",
          },
          { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.optimism.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .integerValue().toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "ECOSYSTEM_RESERVE_PROXY",
            token: "xWELL_PROXY",
          },
        ]
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };
  }
}