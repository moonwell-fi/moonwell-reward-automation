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

  return {
    "1284": {
      "bridgeToRecipient": [
        { // Send total well per epoch - the DEX incentives to Base Temporal Governor
          "amount": BigNumber(marketData.base.wellPerEpoch - marketData.base.wellPerEpochDex),
          "network": 8453,
          "target": "TEMPORAL_GOVERNOR"
        },
        { // Send Base DEX incentives to DEX Relayer
          "amount": BigNumber(marketData.base.wellPerEpochDex),
          "network": 8453,
          "target": "DEX_RELAYER"
        },
        { // Send total well per epoch - the DEX incentives to Optimism Temporal Governor
          "amount": BigNumber(marketData.optimism.wellPerEpoch - marketData.optimism.wellPerEpochDex),
          "network": 10,
          "target": "TEMPORAL_GOVERNOR"
        },
        { // Send Optimism DEX incentives to DEX Relayer
          "amount": BigNumber(marketData.optimism.wellPerEpochDex),
          "network": 10,
          "target": "DEX_RELAYER"
        },
      ],
      "setRewardSpeed": moonbeamSetRewardSpeeds,
    }
  }
}