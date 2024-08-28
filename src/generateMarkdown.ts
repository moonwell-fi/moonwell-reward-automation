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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function generateMarkdown(marketData: MarketData, proposal: string, network: string, dexData: DexPoolInfo[]): string {
  const startDate = formatDate(marketData.epochStartTimestamp);
  const endDate = formatDate(marketData.epochEndTimestamp);

  let markdown = `# MIP-${proposal} Automated Liquidity Incentive Proposal

This is an automated liquidity incentive governance proposal for the Moonwell protocol on the ${network} network. If successful, the proposal would automatically distribute and adjust liquidity incentives for the period beginning ${startDate} and ending on ${endDate}.

`;

  const networkId = network === 'Optimism' ? '10' : network === 'Moonbeam' ? '1284' : network === 'Base' ? '8453' : null;

  if (networkId && marketData[networkId]) {
    const networkName = networkId === '1284' ? 'Moonbeam' : networkId === '10' ? 'Optimism' : 'Base';
    const nativeToken = networkId === '1284' ? 'GLMR' : networkId === '10' ? 'OP' : 'USDC';

    markdown += `## ${networkName} Network\n\n`;
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
        totalNative: prev.totalNative + curr.nativePerEpochMarket,
        supplyNative: prev.supplyNative + curr.nativePerEpochMarketSupply,
        borrowNative: prev.borrowNative + curr.nativePerEpochMarketBorrow,
        totalWellBySpeed: prev.totalWellBySpeed + (curr.newWellSupplySpeed  * mainConfig.secondsPerEpoch) + (curr.newWellBorrowSpeed  * mainConfig.secondsPerEpoch),
        totalNativeBySpeed: prev.totalNativeBySpeed + (curr.newNativeSupplySpeed  * mainConfig.secondsPerEpoch) + (curr.newNativeBorrowSpeed  * mainConfig.secondsPerEpoch),
      }
    }, { supplyUSD: 0, borrowUSD: 0, totalWell: 0, supplyWell: 0, borrowWell: 0, totalWellBySpeed: 0, totalNative: 0, supplyNative: 0, borrowNative: 0, totalNativeBySpeed: 0 });

    const blockNumber = networkId === '10' ? marketData.optimismBlockNumber : networkId === '1284' ? marketData.moonbeamBlockNumber : networkId === '8453' ? marketData.baseBlockNumber : null;

    markdown += `| Metric | Value |\n`;
    markdown += `| --- | --- |\n`;
    markdown += `| Timestamp of capture | ${marketData.timestamp} |\n`;
    markdown += `| Closest block number | ${blockNumber} |\n`;
    markdown += `| Total Supply in USD | ${formatUSD(networkSummary.supplyUSD)} |\n`;
    markdown += `| Total Borrows in USD | ${formatUSD(networkSummary.borrowUSD)} |\n`;

    if (networkDexInfo) {
      markdown += `| Total LP (${networkDexInfo?.symbol} on ${networkDexInfo?.dex}) | ${formatUSD(networkDexInfo?.tvl || 0)} |\n`;
    }

    markdown += `| Total WELL to distribute DEX | ${networkMarketData?.wellPerEpochDex} WELL |\n`;
    markdown += `| Total WELL to distribute Safety Module | ${networkMarketData?.wellPerEpochSafetyModule} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Config) | ${networkMarketData?.wellPerEpochMarkets} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Sanity Check) | ${networkSummary?.totalWell.toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Supply Side) | ${networkSummary?.supplyWell.toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Borrow Side) | ${networkSummary?.borrowWell.toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Borrow + Supply) | ${(networkSummary?.borrowWell + networkSummary?.supplyWell).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (By Speed) | ${(networkSummary?.totalWellBySpeed).toFixed(18)} WELL |\n`;
    markdown += `| Total WELL to distribute (Config) | ${networkMarketData.wellPerEpoch} WELL |\n`;
    markdown += `| Total WELL to distribute (Sanity Check) | ${(Number(networkMarketData?.wellPerEpochDex) + Number(networkMarketData?.wellPerEpochSafetyModule) + Number(networkSummary?.totalWell)).toFixed(18)} WELL |\n`;
    markdown += `| Total Native to distribute Markets (Config) | ${networkMarketData?.nativePerEpochMarkets} ${nativeToken} |\n`;
    markdown += `| Total Native to distribute Markets (Sanity Check) | ${networkSummary?.totalNative.toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total Native to distribute Markets (Supply Side) | ${networkSummary?.supplyNative.toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total Native to distribute Markets (Borrow Side) | ${networkSummary?.borrowNative.toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total Native to distribute Markets (Borrow + Supply) | ${(networkSummary?.borrowNative + networkSummary?.supplyNative).toFixed(18)} ${nativeToken} |\n`;
    markdown += `| Total Native to distribute Markets (By Speed) | ${(networkSummary?.totalNativeBySpeed).toFixed(18)} ${nativeToken} |\n`;



    // Iterate over the markets for the specific network
    for (const market of Object.values(marketData[networkId])) {
      markdown += `### ${market.name} (${market.alias})\n\n`;
      markdown += `Total Supply in USD: ${formatUSD(market.totalSupplyUSD)}\n`;
      markdown += `Total Borrows in USD: ${formatUSD(market.totalBorrowsUSD)}\n\n`;
      markdown += `| Metric | Current Value | New Value |\n`;
      markdown += `| --- | --- | --- |\n`;
      markdown += `| Supply APY | ${(market.supplyApy * 100).toFixed(2)}% | ${(market.supplyApy * 100).toFixed(2)}% |\n`;
      markdown += `| Borrow APY | ${(market.borrowApy * 100).toFixed(2)}% | ${(market.borrowApy * 100).toFixed(2)}% |\n`;
      markdown += `| WELL Supply APR | ${market.wellSupplyApr}% | ${market.newWellSupplyApr}% |\n`;
      markdown += `| WELL Borrow APR | ${market.wellBorrowApr}% | ${market.newWellBorrowApr}% |\n`;
      markdown += `| ${nativeToken} Supply APR | ${market.nativeSupplyApr}% | ${market.newNativeSupplyApr}% |\n`;
      markdown += `| ${nativeToken} Borrow APR | ${market.nativeBorrowApr}% | ${market.newNativeBorrowApr}% |\n`;
      markdown += `| Total Supply APR | ${((Number(market.supplyApy) + (market.wellSupplyApr / 100) + (market.nativeSupplyApr / 100)) * 100).toFixed(2)}% | ${((Number(market.supplyApy) + (market.newWellSupplyApr / 100) + (market.newNativeSupplyApr / 100)) * 100).toFixed(2)}% |\n`;
      markdown += `| Total Borrow APR | ${((Number(market.borrowApy) - (market.wellBorrowApr / 100) - (market.nativeBorrowApr / 100)) * 100).toFixed(2)}% | ${((Number(market.borrowApy) - (market.newWellBorrowApr / 100) - (market.newNativeBorrowApr / 100)) * 100).toFixed(2)}% |\n`;
      markdown += `| Total Supply Incentives Per Day in USD | ${formatUSD((Number(market.wellSupplyPerDayUsd) + Number(market.nativeSupplyPerDayUsd)))} | ${formatUSD((Number(market.newWellSupplyPerDayUsd) + Number(market.newNativeSupplyPerDayUsd)))} |\n`;
      markdown += `| Total Borrow Incentives Per Day in USD | ${formatUSD((Number(market.wellBorrowPerDayUsd) + Number(market.nativeBorrowPerDayUsd)))} | ${formatUSD((Number(market.newWellBorrowPerDayUsd) + Number(market.newNativeBorrowPerDayUsd)))} |\n`;
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