import BigNumber from 'bignumber.js';
import { mainConfig } from './config';
import { MarketType } from './markets';

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
      newEndTime: -1, // Don't update the end timestamp for USDC until new incentives are allocated
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
    // Check if any market has reservesEnabled=true
    const hasReservesEnabled = marketData["1284"].some((market: MarketType) => market.reservesEnabled);

    const result: any = {
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
        ...(hasReservesEnabled ? {
          initSale: {
            ...mainConfig.initSale,
            reserveAutomationContracts: marketData["1284"]
              .filter((market: MarketType) => {
                if (!market.reservesEnabled) return false;
                const reserves = market.reserves;
                const minimumReserves = market.minimumReserves;
                const amount = new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toNumber();
                return amount > 0;
              })
              .map((market: MarketType) => `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`)
          }
        } : {}),
        setRewardSpeed: moonbeamSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.moonbeam.wellPerEpochSafetyModule))
          .div(marketData.totalSeconds)
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
        ].filter(transfer => transfer.amount > 0),
        ...(hasReservesEnabled ? {
          transferReserves: marketData["1284"]
            .filter((market: MarketType) => market.reservesEnabled)
            .map((market: MarketType) => {
              const reserves = market.reserves;
              const minimumReserves = market.minimumReserves;
              return {
                amount: new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toNumber(),
                market: market.alias,
                to: `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`
              };
            })
            .filter((item: { amount: number; market: string; to: string }) => item.amount > 0)
        } : {}),
        withdrawWell: [],
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };

    return result;
  } else if (network === "Base") {
    // Check if any market has reservesEnabled=true
    const hasReservesEnabled = marketData["8453"].some((market: MarketType) => market.reservesEnabled);

    const result: any = {
      1284: {
        bridgeToRecipient: [
          {
            // Send total well per epoch - the DEX incentives to Base Temporal Governor
            amount: new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
            nativeValue: new BigNumber(marketData.bridgeCost * 4).toNumber(), // pad bridgeCost by 4x in case of price fluctuations
            network: 8453,
            target: "TEMPORAL_GOVERNOR",
          },
          /* commented out until we exhaust the funds in F-AERO on Base
          { // Send Base DEX incentives to DEX Relayer
            amount: new BigNumber(marketData.base.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toNumber(),
              nativeValue: new BigNumber(marketData.bridgeCost * 4).toNumber(), // pad bridgeCost by 4x in case of price fluctuations
            network: 8453,
            target: "DEX_RELAYER"
          }, */
        ],
        transferFrom: [
          {
            // Transfer all Base incentives to the Multichain Governor for bridging
            amount: new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17)
              .toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
        ].filter((transfer) => transfer.amount > 0),
      },
      8453: {
        ...(hasReservesEnabled
          ? {
              initSale: {
                ...mainConfig.initSale,
                reserveAutomationContracts: marketData["8453"]
                  .filter((market: MarketType) => {
                    if (!market.reservesEnabled) return false;
                    const reserves = market.reserves;
                    const minimumReserves = market.minimumReserves;
                    const amount = new BigNumber(reserves)
                      .minus(new BigNumber(minimumReserves))
                      .shiftedBy(market.digits)
                      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                      .toNumber();
                    return amount > 0;
                  })
                  .map((market: MarketType) => `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`),
              },
            }
          : {}),
        multiRewarder: [],
        // No multi-rewarder on Base, so we don't need to add any rewards
        setMRDSpeeds: baseSetRewardSpeeds,
        transferFrom: [
          {
            // Transfer bridged market rewards to the Multi Reward Distributor
            amount: new BigNumber(marketData.base.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "MRD_PROXY",
            token: "xWELL_PROXY",
          },
          {
            // Extra transferFrom to DEX Relayer
            amount: new BigNumber(mainConfig.base.dexRelayerAmount)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
            from: "F-AERO_MULTISIG",
            to: "DEX_RELAYER",
            token: "xWELL_PROXY",
          },
        ].filter((transfer) => transfer.amount > 0),
        ...(hasReservesEnabled
          ? {
              transferReserves: marketData["8453"]
                .filter((market: MarketType) => market.reservesEnabled)
                .map((market: MarketType) => {
                  const reserves = market.reserves;
                  const minimumReserves = market.minimumReserves;
                  return {
                    amount: new BigNumber(reserves)
                      .minus(new BigNumber(minimumReserves))
                      .shiftedBy(market.digits)
                      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                      .toNumber(),
                    market: market.alias,
                    to: `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`,
                  };
                })
                .filter((item: { amount: number; market: string; to: string }) => item.amount > 0),
            }
          : {}),
        withdrawWell:
          marketData.base.wellHolderBalance === "0"
            ? []
            : [
                {
                  amount: new BigNumber(marketData.base.wellHolderBalance)
                    .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
                    .minus(1e15)
                    .toNumber(),
                  to: "TEMPORAL_GOVERNOR", // we now should transfer to temporal governor as the merkle createCampaign call will pull the funds from the temporal governor
                },
              ],
        merkleCampaigns: [{
          amount: new BigNumber(parseFloat(marketData.base.wellPerEpochSafetyModule) + parseFloat(marketData.base.wellHolderBalance) / 1e18)
            .shiftedBy(18)
            .plus(11669037203603279001600000) // Add missing rewards from last month
            .decimalPlaces(0, BigNumber.ROUND_CEIL)
            .toNumber(),
          // TEMPORARY FIX: Use 2 epochs duration to cover missing rewards from last month
          // TODO: Update next month to use single epoch (mainConfig.secondsPerEpoch)
          duration: mainConfig.secondsPerEpoch * 2,
          rewardToken: "xWELL_PROXY",
          // Use last month's timestamp instead of current epoch
          startTimestamp: marketData.epochStartTimestamp - mainConfig.secondsPerEpoch,
        }],
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };

    return result;
  } else if (network === "Optimism") {
    // Check if any market has reservesEnabled=true
    const hasReservesEnabled = marketData["10"].some((market: MarketType) => market.reservesEnabled);

    const result: any = {
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
              .plus(1e17)
              .toNumber(),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
        ].filter(transfer => transfer.amount > 0),
      },
      10: {
        ...(hasReservesEnabled ? {
          initSale: {
            ...mainConfig.initSale,
            reserveAutomationContracts: marketData["10"]
              .filter((market: MarketType) => {
                if (!market.reservesEnabled) return false;
                const reserves = market.reserves;
                const minimumReserves = market.minimumReserves;
                const amount = new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toNumber();
                return amount > 0;
              })
              .map((market: MarketType) => `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`)
          }
        } : {}),
        setMRDSpeeds: optimismSetRewardSpeeds,
        stkWellEmissionsPerSecond: BigNumber(parseFloat(marketData.optimism.wellPerEpochSafetyModule) + parseFloat(marketData.optimism.wellHolderBalance) / 1e18)
          .div(marketData.totalSeconds)
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
              .minus(marketData.optimism.wellHolderBalance)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toNumber(),
            from: "TEMPORAL_GOVERNOR",
            to: "ECOSYSTEM_RESERVE_PROXY",
            token: "xWELL_PROXY",
          },
        ].filter(transfer => transfer.amount > 0),
        ...(hasReservesEnabled ? {
          transferReserves: marketData["10"]
            .filter((market: MarketType) => market.reservesEnabled)
            .map((market: MarketType) => {
              const reserves = market.reserves;
              const minimumReserves = market.minimumReserves;
              return {
                amount: new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toNumber(),
                market: market.alias,
                to: `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`
              };
            })
            .filter((item: { amount: number; market: string; to: string }) => item.amount > 0)
        } : {}),
        withdrawWell: marketData.optimism.wellHolderBalance === "0" ? [] : [
          {
            amount: new BigNumber(marketData.optimism.wellHolderBalance)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e15)
              .toNumber(),
            to: "ECOSYSTEM_RESERVE_PROXY"
          }
        ],
        multiRewarder: [
          {
            distributor: "TEMPORAL_GOVERNOR",
            duration: mainConfig.secondsPerEpoch,
            reward: new BigNumber(marketData.optimism.optimismUSDCVaultWellRewardAmount)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e15)
              .toNumber(),
            rewardToken: "xWELL_PROXY",
            vault: mainConfig.optimism.rewarderNames[0]
          },
          {
            distributor: "TEMPORAL_GOVERNOR",
            duration: mainConfig.secondsPerEpoch,
            reward: new BigNumber(mainConfig.optimism.vaultNativePerEpoch)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .toNumber(),
            rewardToken: "OP",
            vault: mainConfig.optimism.rewarderNames[0]
          }
        ],
        merkleCampaigns: [],
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };

    return result;
  }
}
