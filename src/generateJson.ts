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
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? 0 : new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      rewardType: 0, // 0 = WELL
    };
    const nativeRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? 0 : new BigNumber(market.newNativeSupplySpeed)
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
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? 0 : new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
    };
    const nativeRewardSpeeds = {
      emissionToken: "USDC",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-6')) ? 1 : new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(6)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? 0 : new BigNumber(market.newNativeSupplySpeed)
        .shiftedBy(6)
        .integerValue().toNumber(),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const optimismSetRewardSpeeds = marketData["10"].flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isZero() ? 0 : new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
    };
    const nativeRewardSpeeds = {
      emissionToken: "OP",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toNumber(),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isZero() ? 0 : new BigNumber(market.newNativeSupplySpeed)
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
            .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
            .plus(1e16)
            .toNumber(),
          endTimestamp: marketData.epochEndTimestamp,
          pid: 15,
          rewardPerSec: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
            .div(BigNumber(marketData.totalSeconds))
            .shiftedBy(18)
            .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
            .toNumber(),
          target: "STELLASWAP_REWARDER",
        },
        setRewardSpeed: moonbeamSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochSafetyModule) / marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue().toNumber(),
        transferFrom: [
          { // Transfer StellaSwap DEX incentives from F-GLMR-LM multisig to the governor
            amount: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
          { // Transfer market rewards from F-GLMR-LM multisig to the Unitroller proxy
            amount: BigNumber(marketData.moonbeam.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "UNITROLLER",
            token: "GOVTOKEN",
          },
          { // Transfer Safety Module rewards from F-GLMR-LM multisig to the Ecosystem Reserve Proxy
            amount: BigNumber(marketData.moonbeam.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .toNumber(),
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
      1284: {
        bridgeToRecipient: [
          { // Send total well per epoch - the DEX incentives to Base Temporal Governor
            amount: BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
            nativeValue: BigNumber(marketData.bridgeCost * 4).toNumber(), // pad bridgeCost by 4x in case of price fluctuations
            network: 8453,
            target: "TEMPORAL_GOVERNOR"
          },
          { // Send Base DEX incentives to DEX Relayer
            amount: BigNumber(marketData.base.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
              nativeValue: BigNumber(marketData.bridgeCost * 4).toNumber(), // pad bridgeCost by 4x in case of price fluctuations
            network: 8453,
            target: "DEX_RELAYER"
          },
        ],
        transferFrom: [
          { // Transfer all Base incentives to the Multichain Governor for bridging
            amount: BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e15)
              .toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
        ],
      },
      8453: {
        setMRDSpeeds: baseSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.base.wellPerEpochSafetyModule) / marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue().toNumber(),
        transferFrom: [
          { // Transfer bridged market rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.base.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "MRD_PROXY",
            token: "xWELL_PROXY",
          },
          { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.base.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
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
      1284: {
        bridgeToRecipient: [
          { // Send total well per epoch - the DEX incentives to Optimism Temporal Governor
            amount: BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.optimism.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
              nativeValue: BigNumber(marketData.bridgeCost * 4).toNumber(), // pad bridgeCost by 4x in case of price fluctuations
            network: 10,
            target: "TEMPORAL_GOVERNOR"
          },
          { // Send Optimism DEX incentives to DEX Relayer
            amount: BigNumber(marketData.optimism.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
              nativeValue: BigNumber(marketData.bridgeCost * 4).toNumber(), // pad bridgeCost by 4x in case of price fluctuations
            network: 10,
            target: "DEX_RELAYER"
          },
        ],
        transferFrom: [
          { // Transfer all Optimism incentives to the Multichain Governor for bridging
            amount: BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e15)
              .toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
        ],
      },
      10: {
        setMRDSpeeds: optimismSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.optimism.wellPerEpochSafetyModule) / marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue()
          .toNumber(),
        transferFrom: [
          { // Transfer native OP rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.optimism.nativePerEpoch)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
            from: "FOUNDATION_OP_MULTISIG",
            to: "MRD_PROXY",
            token: "OP",
          },
          { // Transfer bridged market rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.optimism.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "MRD_PROXY",
            token: "xWELL_PROXY",
          },
          { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
            amount: BigNumber(marketData.optimism.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
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