import BigNumber from 'bignumber.js';
import { mainConfig, merkleCampaignDatas } from './config';
import { MarketType } from './markets';

BigNumber.config({
  EXPONENTIAL_AT: 40
})

const TOKEN_HOLDING_CAMPAIGN = 18;
const MORPHO_VAULT_CAMPAIGN = 56;
const TARGET_STKWELL_APY = 0.10; // 10% APY cap for stkWELL
const EPOCHS_PER_YEAR = 365 / 28;

// Calculate capped wellHolderBalance to achieve target APY for stkWELL
function calculateCappedWellHolderBalance(
  safetyModuleRewards: number,
  wellHolderBalance: number,
  stkWellTotalSupply: number
): { cappedBalance: number; remainingBalance: number } {
  const maxRewardsPerEpoch = (TARGET_STKWELL_APY * stkWellTotalSupply) / EPOCHS_PER_YEAR;
  const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - safetyModuleRewards);
  const cappedBalance = Math.min(wellHolderBalance, maxWellHolderContribution);
  const remainingBalance = wellHolderBalance - cappedBalance;
  return { cappedBalance, remainingBalance };
}

export async function returnJson(marketData: any, network: string) {
  const moonbeamSetRewardSpeeds = marketData["1284"]
    .filter((market: MarketType) => market.alias !== null)
    .flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isLessThanOrEqualTo(0) ? 1 :
        new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : Number(new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isLessThanOrEqualTo(0) ? 0 :
        new BigNumber(market.newWellSupplySpeed).isZero() ? 0 : Number(new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
      rewardType: 0, // 0 = WELL
    };
    const nativeRewardSpeeds = {
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isLessThanOrEqualTo(0) ? 1 :
        new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : Number(new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isLessThanOrEqualTo(0) ? 0 :
        new BigNumber(market.newNativeSupplySpeed).isZero() ? 0 : Number(new BigNumber(market.newNativeSupplySpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
      rewardType: 1, // 1 = GLMR
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const baseSetRewardSpeeds = marketData["8453"]
    .filter((market: MarketType) => market.alias !== null)
    .flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isLessThanOrEqualTo(0) ? -1 :
        new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : Number(new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isLessThanOrEqualTo(0) ? -1 :
        new BigNumber(market.newWellSupplySpeed).isZero() ? 0 : Number(new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
    };
    const nativeRewardSpeeds = {
      emissionToken: "USDC",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newNativeBorrowSpeed).isLessThanOrEqualTo(0) ? -1 :
        new BigNumber(market.newNativeBorrowSpeed).isEqualTo(new BigNumber('1e-6')) ? 1 : Number(new BigNumber(market.newNativeBorrowSpeed)
        .shiftedBy(6)
        .integerValue().toFixed(0)),
      newEndTime: -1, // Don't update the end timestamp for USDC until new incentives are allocated
      newSupplySpeed: new BigNumber(market.newNativeSupplySpeed).isLessThanOrEqualTo(0) ? -1 :
        new BigNumber(market.newNativeSupplySpeed).isZero() ? 0 : Number(new BigNumber(market.newNativeSupplySpeed)
        .shiftedBy(6)
        .integerValue().toFixed(0)),
    };
    return [wellRewardSpeeds, nativeRewardSpeeds];
  });

  const optimismSetRewardSpeeds = marketData["10"]
    .filter((market: MarketType) => market.alias !== null)
    .flatMap((market: MarketType) => {
    const wellRewardSpeeds = {
      emissionToken: "xWELL_PROXY",
      market: market.alias,
      newBorrowSpeed: new BigNumber(market.newWellBorrowSpeed).isLessThanOrEqualTo(0) ? -1 :
        new BigNumber(market.newWellBorrowSpeed).isEqualTo(new BigNumber('1e-18')) ? 1 : Number(new BigNumber(market.newWellBorrowSpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
      newEndTime: marketData.epochEndTimestamp,
      newSupplySpeed: new BigNumber(market.newWellSupplySpeed).isLessThanOrEqualTo(0) ? -1 :
        new BigNumber(market.newWellSupplySpeed).isZero() ? 0 : Number(new BigNumber(market.newWellSupplySpeed)
        .shiftedBy(18)
        .integerValue().toFixed(0)),
    };
    return [wellRewardSpeeds];
  });

  if (network === "Moonbeam") {
    // Check if any market has reservesEnabled=true
    const hasReservesEnabled = marketData["1284"].some((market: MarketType) => market.reservesEnabled);

    const result: any = {
      1284: {
        addRewardInfo: {
          amount: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
            .shiftedBy(18)
            .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
            .plus(1e16)
            .toFixed(0)),
          endTimestamp: marketData.epochEndTimestamp,
          pid: 15,
          rewardPerSec: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
            .div(BigNumber(marketData.totalSeconds))
            .shiftedBy(18)
            .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
            .toFixed(0)),
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
        stkWellEmissionsPerSecond: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochSafetyModule))
          .div(marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue().toFixed(0)),
        transferFrom: [
          { // Transfer StellaSwap DEX incentives from F-GLMR-LM multisig to the governor
            amount: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
          { // Transfer market rewards from F-GLMR-LM multisig to the Unitroller proxy
            amount: Number(BigNumber(marketData.moonbeam.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .toFixed(0)),
            from: "MGLIMMER_MULTISIG",
            to: "UNITROLLER",
            token: "GOVTOKEN",
          },
          { // Transfer Safety Module rewards from F-GLMR-LM multisig to the Ecosystem Reserve Proxy
            amount: Number(BigNumber(marketData.moonbeam.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .toFixed(0)),
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
                amount: Number(new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toFixed(0)),
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
            // Send all Base incentives (markets + safety module + vaults - dex) to Base Temporal Governor
            // Add extra padding (1e17) to cover rounding differences in 6 merkle campaigns + MRD transfer
            amount: Number(new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17) // increased padding for merkle campaign rounding
              .toFixed(0)),
            nativeValue: Number(new BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 8453,
            target: "TEMPORAL_GOVERNOR",
          },
          /* commented out until we exhaust the funds in F-AERO on Base
          { // Send Base DEX incentives to DEX Relayer
            amount: Number(new BigNumber(marketData.base.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
              nativeValue: Number(new BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 8453,
            target: "DEX_RELAYER"
          }, */
        ],
        transferFrom: [
          {
            // Transfer all Base incentives (markets + safety module + vaults) from F-GLMR-LM to Multichain Governor for bridging
            amount: Number(new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17)
              .toFixed(0)),
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
            amount: Number(new BigNumber(marketData.base.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toFixed(0)),
            from: "TEMPORAL_GOVERNOR",
            to: "MRD_PROXY",
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
                    amount: Number(new BigNumber(reserves)
                      .minus(new BigNumber(minimumReserves))
                      .shiftedBy(market.digits)
                      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                      .toFixed(0)),
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
            : (() => {
                const { cappedBalance } = calculateCappedWellHolderBalance(
                  parseFloat(marketData.base.wellPerEpochSafetyModule),
                  parseFloat(marketData.base.wellHolderBalance) / 1e18,
                  parseFloat(marketData.baseStkWELLTotalSupply) / 1e18
                );

                if (cappedBalance <= 0) return [];

                return [
                  {
                    amount: Number(new BigNumber(cappedBalance)
                      .shiftedBy(18)
                      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                      .minus(1e15)
                      .toFixed(0)),
                    to: "TEMPORAL_GOVERNOR",
                  },
                ];
              })(),
        merkleCampaigns: [
          {
            // Cap stkWELL APY at 10% by limiting wellHolderBalance contribution
            amount: (() => {
              const safetyModuleRewards = parseFloat(marketData.base.wellPerEpochSafetyModule);
              const { cappedBalance } = calculateCappedWellHolderBalance(
                safetyModuleRewards,
                parseFloat(marketData.base.wellHolderBalance) / 1e18,
                parseFloat(marketData.baseStkWELLTotalSupply) / 1e18
              );
              const totalRewards = safetyModuleRewards + cappedBalance;
              return Number(new BigNumber(totalRewards)
                .shiftedBy(18)
                .decimalPlaces(0, BigNumber.ROUND_CEIL)
                .toFixed(0));
            })(),
            campaignData: merkleCampaignDatas.stkWELL,
            campaignType: TOKEN_HOLDING_CAMPAIGN,
            duration: mainConfig.secondsPerEpoch,
            rewardToken: "xWELL_PROXY",
            startTimestamp: marketData.epochStartTimestamp,
          },
          {
            amount: Number(new BigNumber(marketData.base.vaultAmounts.USDC)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .toFixed(0)),
            campaignData: merkleCampaignDatas.USDC,
            campaignType: MORPHO_VAULT_CAMPAIGN,
            duration: mainConfig.secondsPerEpoch,
            rewardToken: "xWELL_PROXY",
            startTimestamp: marketData.epochStartTimestamp,
          },
          {
            amount: Number(new BigNumber(marketData.base.vaultAmounts.WETH)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .toFixed(0)),
            campaignData: merkleCampaignDatas.WETH,
            campaignType: MORPHO_VAULT_CAMPAIGN,
            duration: mainConfig.secondsPerEpoch,
            rewardToken: "xWELL_PROXY",
            startTimestamp: marketData.epochStartTimestamp,
          },
          {
            amount: Number(new BigNumber(marketData.base.vaultAmounts.EURC)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .toFixed(0)),
            campaignData: merkleCampaignDatas.EURC,
            campaignType: MORPHO_VAULT_CAMPAIGN,
            duration: mainConfig.secondsPerEpoch,
            rewardToken: "xWELL_PROXY",
            startTimestamp: marketData.epochStartTimestamp,
          },
          {
            amount: Number(new BigNumber(marketData.base.vaultAmounts.cbBTC)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .toFixed(0)),
            campaignData: merkleCampaignDatas.cbBTC,
            campaignType: MORPHO_VAULT_CAMPAIGN,
            duration: mainConfig.secondsPerEpoch,
            rewardToken: "xWELL_PROXY",
            startTimestamp: marketData.epochStartTimestamp,
          },
        ],
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
            amount: Number(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.optimism.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
              nativeValue: Number(BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 10,
            target: "TEMPORAL_GOVERNOR"
          },
          { // Send Optimism DEX incentives to DEX Relayer
            amount: Number(BigNumber(marketData.optimism.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
              nativeValue: Number(BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 10,
            target: "DEX_RELAYER"
          },
        ],
        transferFrom: [
          { // Transfer all Optimism incentives to the Multichain Governor for bridging
            amount: Number(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17)
              .toFixed(0)),
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
        stkWellEmissionsPerSecond: (() => {
          const safetyModuleRewards = parseFloat(marketData.optimism.wellPerEpochSafetyModule);
          const { cappedBalance } = calculateCappedWellHolderBalance(
            safetyModuleRewards,
            parseFloat(marketData.optimism.wellHolderBalance) / 1e18,
            parseFloat(marketData.optimismStkWELLTotalSupply) / 1e18
          );
          return Number(BigNumber(safetyModuleRewards + cappedBalance)
            .div(marketData.totalSeconds)
            .shiftedBy(18)
            .integerValue()
            .toFixed(0));
        })(),
        transferFrom: [
          { // Transfer bridged market rewards to the Multi Reward Distributor
            amount: Number(BigNumber(marketData.optimism.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e16)
              .toFixed(0)),
            from: "TEMPORAL_GOVERNOR",
            to: "MRD_PROXY",
            token: "xWELL_PROXY",
          },
          { // Transfer bridged Safety Module rewards to the Multi Reward Distributor
            amount: Number(BigNumber(marketData.optimism.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .toFixed(0)),
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
                amount: Number(new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toFixed(0)),
                market: market.alias,
                to: `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`
              };
            })
            .filter((item: { amount: number; market: string; to: string }) => item.amount > 0)
        } : {}),
        withdrawWell: marketData.optimism.wellHolderBalance === "0" ? [] : (() => {
          const { cappedBalance } = calculateCappedWellHolderBalance(
            parseFloat(marketData.optimism.wellPerEpochSafetyModule),
            parseFloat(marketData.optimism.wellHolderBalance) / 1e18,
            parseFloat(marketData.optimismStkWELLTotalSupply) / 1e18
          );
          if (cappedBalance <= 0) return [];
          return [
            {
              amount: Number(new BigNumber(cappedBalance)
                .shiftedBy(18)
                .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                .minus(1e15)
                .toFixed(0)),
              to: "ECOSYSTEM_RESERVE_PROXY"
            }
          ];
        })(),
        multiRewarder: [
          {
            distributor: "TEMPORAL_GOVERNOR",
            duration: mainConfig.secondsPerEpoch,
            reward: Number(new BigNumber(marketData.optimism.optimismUSDCVaultWellRewardAmount)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_FLOOR) // always round down
              .minus(1e15)
              .toFixed(0)),
            rewardToken: "xWELL_PROXY",
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
