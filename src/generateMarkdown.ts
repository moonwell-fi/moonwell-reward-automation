import { mainConfig } from "./config";
import { DexPoolInfo } from "./dex";

interface MarketData {
  [key: string]: any;
  epochStartTimestamp: number;
  epochEndTimestamp: number;
  wellPrice: string;
  glmrPrice: string;
  usdcPrice: string;
  opPrice: string;
  10: {
    [key: string]: any;
  };
  1284: {
    [key: string]: any;
  };
  8453: {
    [key: string]: any;
  };
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} at ${hours}:${minutes}:${seconds} UTC`;
}

function formatUSD(value: number): string {
  const nonNegativeValue = Math.max(0, value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(nonNegativeValue);
}

export function generateMarkdown(marketData: MarketData, proposal: string, network: string, dexData: DexPoolInfo[]): string {
  const startDate = formatDate(marketData.epochStartTimestamp);
  const endDate = formatDate(marketData.epochEndTimestamp);

  let markdown =  '';

  const networkId = network === 'Optimism' ? '10' : network === 'Moonbeam' ? '1284' : network === 'Base' ? '8453' : null;

  if (networkId && marketData[networkId]) {
    const networkName = networkId === '1284' ? 'Moonbeam' : networkId === '10' ? 'Optimism' : 'Base';
    const nativeToken = networkId === '1284' ? 'GLMR' : networkId === '10' ? 'OP' : 'USDC';

    markdown += `## ${networkName} Network\n\n`;
    markdown += `If successful, the proposal would automatically distribute and adjust liquidity incentives for the period beginning ${startDate} and ending on ${endDate}.

`;

    //Breakdown
    const networkMarketData = marketData[network.toLowerCase()];
    const networkDexInfo = dexData.find(r => r.network.toString() == networkId)
    const networkSummary = Object.values(marketData[networkId]).reduce((prev, curr) => {
      return {
        supplyUSD: prev.supplyUSD + curr.totalSupplyUSD,
        borrowUSD: prev.borrowUSD + curr.totalBorrowsUSD,
        totalWell: prev.totalWell + curr.wellPerEpochMarket,
        supplyWell: prev.supplyWell + curr.wellPerEpochMarketSupply,
        borrowWell: prev.borrowWell + curr.wellPerEpochMarketBorrow,
        totalWellBySpeed: prev.totalWellBySpeed + (curr.newWellSupplySpeed * mainConfig.secondsPerEpoch) + (curr.newWellBorrowSpeed * mainConfig.secondsPerEpoch),
        totalNative: prev.totalNative + curr.nativePerEpochMarket,
        supplyNative: prev.supplyNative + curr.nativePerEpochMarketSupply,
        borrowNative: prev.borrowNative + curr.nativePerEpochMarketBorrow,
        totalNativeBySpeed: prev.totalNativeBySpeed + (curr.newNativeSupplySpeed * mainConfig.secondsPerEpoch) + (curr.newNativeBorrowSpeed * mainConfig.secondsPerEpoch),
      }
    }, { supplyUSD: 0, borrowUSD: 0, totalWell: 0, supplyWell: 0, borrowWell: 0, totalWellBySpeed: 0, totalNative: 0, supplyNative: 0, borrowNative: 0, totalNativeBySpeed: 0,  })

    const blockNumber = networkId === '10' ? marketData.optimismBlockNumber : networkId === '1284' ? marketData.moonbeamBlockNumber : networkId === '8453' ? marketData.baseBlockNumber : null;

    markdown += `| Metric | Value |\n`;
    markdown += `| ------ | ----- |\n`;
    markdown += `| Timestamp of capture | ${marketData.timestamp} |\n`;
    markdown += `| Closest block number | ${blockNumber} |\n`;
    markdown += `| Total Supply in USD | ${formatUSD(networkSummary.supplyUSD)} |\n`;
    markdown += `| Total Borrows in USD | ${formatUSD(networkSummary.borrowUSD)} |\n`;

    if (networkDexInfo) {
      markdown += `| | |\n`;
      markdown += `| Total LP (${networkDexInfo?.symbol} on ${networkDexInfo?.dex}) | ${formatUSD(networkDexInfo?.tvl || 0)} |\n`;
    }

    const dexWell = networkId === '10' ? networkMarketData?.wellPerEpochDex : networkId === '1284' ? networkMarketData?.wellPerEpochDex : networkId === '8453' ? mainConfig.base.dexRelayerAmount : null;

    markdown += `| | |\n`;
    markdown += `| Total WELL to distribute DEX | ${Math.max(0, Number(dexWell || 0))} WELL |\n`;
    markdown += `| Total WELL to distribute Safety Module | ${Math.max(0, Number(networkMarketData?.wellPerEpochSafetyModule || 0))} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Config) | ${Math.max(0, Number(networkMarketData?.wellPerEpochMarkets))} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Sanity Check) | ${Math.max(0, Number(networkSummary?.totalWell)).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Supply Side) | ${Math.max(0, Number(networkSummary?.supplyWell)).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Borrow Side) | ${Math.max(0, Number(networkSummary?.borrowWell)).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Borrow + Supply) | ${Math.max(0, Number(networkSummary?.borrowWell) + Number(networkSummary?.supplyWell)).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (By Speed) | ${Math.max(0, Number(networkSummary?.totalWellBySpeed)).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute (Config) | ${Math.max(0, Number(networkMarketData.wellPerEpoch))} WELL |\n`;
    markdown += `| Total WELL to distribute (Sanity Check) | ${Math.max(0, Number(networkMarketData?.wellPerEpochDex) + Number(networkMarketData?.wellPerEpochSafetyModule) + Number(networkSummary?.totalWell)).toFixed(18)} WELL \n`;

    markdown += `| | |\n`;
    markdown += `| Total ${nativeToken} to distribute Markets (Config) | ${Math.max(0, Number(networkMarketData?.nativePerEpoch)).toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total ${nativeToken} to distribute Markets (Sanity Check) | ${Math.max(0, Number(networkSummary?.totalNative)).toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total ${nativeToken} to distribute Markets (Supply Side) | ${Math.max(0, Number(networkSummary?.supplyNative)).toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total ${nativeToken} to distribute Markets (Borrow Side) | ${Math.max(0, Number(networkSummary?.borrowNative)).toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total ${nativeToken} to distribute Markets (Borrow + Supply) | ${Math.max(0, Number(networkSummary?.borrowNative) + Number(networkSummary?.supplyNative)).toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total ${nativeToken} to distribute Markets (By Speed) | ${Math.max(0, Number(networkSummary?.totalNativeBySpeed)).toFixed(18)} ${nativeToken} |\n`;
    markdown += `\n`;
    // Iterate over the markets for the specific network
    for (const market of Object.values(marketData[networkId])) {
      markdown += `### ${market.name} (${market.alias})\n\n`;
      // Cancel out boosts and deboosts so we don't show incorrect total supply in USD
      markdown += `Total Supply in USD: ${formatUSD(market.totalSupplyUSD - market.boost + market.deboost)}\n`;
      markdown += `Total Borrows in USD: ${formatUSD(market.totalBorrowsUSD)}\n\n`;
      markdown += `| Metric | Current Value | New Value |\n`;
      markdown += `| --- | --- | --- |\n`;
      markdown += `| Supply APY | ${Math.max(0, market.supplyApy * 100).toFixed(2)}% | ${Math.max(0, market.supplyApy * 100).toFixed(2)}% |\n`;
      markdown += `| Borrow APY | ${Math.max(0, market.borrowApy * 100).toFixed(2)}% | ${Math.max(0, market.borrowApy * 100).toFixed(2)}% |\n`;
      markdown += `| WELL Supply APR | ${Math.max(0, market.wellSupplyApr)}% | ${Math.max(0, market.newWellSupplyApr)}% |\n`;
      markdown += `| WELL Borrow APR | ${Math.max(0, market.wellBorrowApr)}% | ${Math.max(0, market.newWellBorrowApr)}% |\n`;
      markdown += `| ${nativeToken} Supply APR | ${Math.max(0, market.nativeSupplyApr)}% | ${Math.max(0, market.newNativeSupplyApr)}% |\n`;
      markdown += `| ${nativeToken} Borrow APR | ${Math.max(0, market.nativeBorrowApr)}% | ${Math.max(0, market.newNativeBorrowApr)}% |\n`;
      markdown += `| Total Supply APR | ${Math.max(0, ((Number(market.supplyApy) + (market.wellSupplyApr / 100) + (market.nativeSupplyApr / 100)) * 100)).toFixed(2)}% | ${Math.max(0, ((Number(market.supplyApy) + (market.newWellSupplyApr / 100) + (market.newNativeSupplyApr / 100)) * 100)).toFixed(2)}% |\n`;
      markdown += `| Total Borrow APR | ${Math.max(0, ((Number(market.borrowApy) - (market.wellBorrowApr / 100) - (market.nativeBorrowApr / 100)) * 100)).toFixed(2)}% | ${Math.max(0, ((Number(market.borrowApy) - (market.newWellBorrowApr / 100) - (market.newNativeBorrowApr / 100)) * 100)).toFixed(2)}% |\n`;
      markdown += `| Total Supply Incentives Per Day in USD | ${formatUSD(Math.max(0, (Number(market.wellSupplyPerDayUsd) + Number(market.nativeSupplyPerDayUsd))))} | ${formatUSD(Math.max(0, (Number(market.newWellSupplyPerDayUsd) + Number(market.newNativeSupplyPerDayUsd))))} |\n`;
      markdown += `| Total Borrow Incentives Per Day in USD | ${formatUSD(Math.max(0, (Number(market.wellBorrowPerDayUsd) + Number(market.nativeBorrowPerDayUsd))))} | ${formatUSD(Math.max(0, (Number(market.newWellBorrowPerDayUsd) + Number(market.newNativeBorrowPerDayUsd))))} |\n`;
      markdown += '\n';
      markdown += `| Metric | % Change |\n`;
      markdown += `| --- | --- |\n`;
      markdown += `| WELL Supply | ${market.wellChangeSupplySpeedPercentage}% |\n`;
      markdown += `| WELL Borrow | ${market.wellChangeBorrowSpeedPercentage}% |\n`;
      markdown += `| ${nativeToken} Supply | ${market.nativeChangeSupplySpeedPercentage}% |\n`;
      markdown += `| ${nativeToken} Borrow | ${market.nativeChangeBorrowSpeedPercentage === 99999999999900 ? '0%' : `${market.nativeChangeBorrowSpeedPercentage}%`} |\n`;
    }
  } else {
    markdown += 'Invalid network provided.\n';
  }
  return markdown;
}

export default generateMarkdown;
