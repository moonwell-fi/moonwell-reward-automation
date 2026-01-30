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
    markdown += `| Total Supply in USD for incentivized markets | ${formatUSD(networkSummary.supplyUSD)} |\n`;
    markdown += `| Total Borrows in USD | ${formatUSD(networkSummary.borrowUSD)} |\n`;
    
    // Calculate and display Safety Module APR
    if (networkId === '1284') {
      const stkWellTotalSupply = parseFloat(marketData.moonbeamStkWELLTotalSupply) / 10**18;
      if (stkWellTotalSupply > 0) {
        const rewardsPerSecond = parseFloat(networkMarketData.wellPerEpochSafetyModule) / mainConfig.secondsPerEpoch;
        const annualRewards = rewardsPerSecond * 31536000; // seconds in a year
        const safetyModuleAPR = (annualRewards / stkWellTotalSupply) * 100;
        markdown += `| Safety Module APR | ${safetyModuleAPR.toFixed(2)}% |\n`;
        
        // Add Safety Module Boosted APR if wellHolderBalance exists and is > 0
        if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
          const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18;
          const totalRewardsPerSecond = (parseFloat(networkMarketData.wellPerEpochSafetyModule) + wellBalance) / mainConfig.secondsPerEpoch;
          const totalAnnualRewards = totalRewardsPerSecond * 31536000; // seconds in a year
          const boostedSafetyModuleAPR = (totalAnnualRewards / stkWellTotalSupply) * 100;
          markdown += `| **Safety Module Boosted APR** | **${boostedSafetyModuleAPR.toFixed(2)}%** |\n`;
        }
      }
    } else if (networkId === '8453') {
      const stkWellTotalSupply = parseFloat(marketData.baseStkWELLTotalSupply) / 10**18;
      if (stkWellTotalSupply > 0) {
        const rewardsPerSecond = parseFloat(networkMarketData.wellPerEpochSafetyModule) / mainConfig.secondsPerEpoch;
        const annualRewards = rewardsPerSecond * 31536000; // seconds in a year
        const safetyModuleAPR = (annualRewards / stkWellTotalSupply) * 100;
        markdown += `| Safety Module APR (Base) | ${safetyModuleAPR.toFixed(2)}% |\n`;

        // Add Safety Module Boosted APR if wellHolderBalance exists and is > 0
        if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
          const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18;
          const baseSafetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
          const epochsPerYear = 365 / 28;
          const targetAPY = 0.10; // 10% max APY cap

          // Calculate capped distribution
          const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
          const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - baseSafetyModuleRewards);
          const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);
          const totalCappedRewards = baseSafetyModuleRewards + cappedWellHolderBalance;
          const remainingWellHolder = wellBalance - cappedWellHolderBalance;

          // Calculate capped APR
          const cappedRewardsPerSecond = totalCappedRewards / mainConfig.secondsPerEpoch;
          const cappedAnnualRewards = cappedRewardsPerSecond * 31536000;
          const cappedSafetyModuleAPR = (cappedAnnualRewards / stkWellTotalSupply) * 100;

          markdown += `| Safety Module APR (Capped at 10%) | ${cappedSafetyModuleAPR.toFixed(2)}% |\n`;
          markdown += `| WELL from auctions (this epoch) | ${cappedWellHolderBalance.toLocaleString()} WELL |\n`;
          markdown += `| WELL from auctions (reserved for future) | ${remainingWellHolder.toLocaleString()} WELL |\n`;
        }
      }
    } else if (networkId === '10') {
      const stkWellTotalSupply = parseFloat(marketData.optimismStkWELLTotalSupply) / 10**18;
      if (stkWellTotalSupply > 0) {
        const safetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
        const rewardsPerSecond = safetyModuleRewards / mainConfig.secondsPerEpoch;
        const annualRewards = rewardsPerSecond * 31536000;
        const safetyModuleAPR = (annualRewards / stkWellTotalSupply) * 100;
        markdown += `| Safety Module APR (Base) | ${safetyModuleAPR.toFixed(2)}% |\n`;

        // Calculate capped APY (10% cap) if wellHolderBalance exists and is > 0
        if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
          const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18;
          const epochsPerYear = 365 / 28;
          const targetAPY = 0.10;
          const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
          const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - safetyModuleRewards);
          const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);
          const remainingWellHolder = wellBalance - cappedWellHolderBalance;

          const cappedRewardsPerSecond = (safetyModuleRewards + cappedWellHolderBalance) / mainConfig.secondsPerEpoch;
          const cappedAnnualRewards = cappedRewardsPerSecond * 31536000;
          const cappedSafetyModuleAPR = (cappedAnnualRewards / stkWellTotalSupply) * 100;

          markdown += `| Safety Module APR (Capped at 10%) | ${cappedSafetyModuleAPR.toFixed(2)}% |\n`;
          markdown += `| WELL from auctions (this epoch) | ${cappedWellHolderBalance.toLocaleString()} WELL |\n`;
          markdown += `| WELL from auctions (reserved for future) | ${remainingWellHolder.toLocaleString()} WELL |\n`;
        }
      }
    }
    
    // Add USD value of WELL from auctions if non-zero
    if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
      // Calculate USD value by first adjusting for 18 decimal places in the token amount
      const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18; // Adjust for 18 decimal places
      const wellPrice = parseFloat(marketData.wellPrice);
      const wellUsdValue = wellBalance * wellPrice;
      markdown += `| **Total WELL acquired in auctions (USD)** | **${formatUSD(wellUsdValue)}** |\n`;
    }

    if (networkDexInfo) {
      markdown += `| | |\n`;
      markdown += `| Total LP (${networkDexInfo?.symbol} on ${networkDexInfo?.dex}) | ${formatUSD(networkDexInfo?.tvl || 0)} |\n`;
    }

    const dexWell = networkId === '10' ? networkMarketData?.wellPerEpochDex : networkId === '1284' ? networkMarketData?.wellPerEpochDex : networkId === '8453' ? mainConfig.base.dexRelayerAmount : null;

    markdown += `| | |\n`;
    markdown += `| Total WELL to distribute DEX | ${Math.max(0, Number(dexWell || 0)).toLocaleString()} WELL |\n`;
    markdown += `| Total WELL to distribute Safety Module | ${Math.max(0, Number(networkMarketData?.wellPerEpochSafetyModule || 0)).toLocaleString()} WELL |\n`;
    
    // Add quantity of WELL from auctions if non-zero
    if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
      // Adjust for 18 decimal places to show human-readable amount
      const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18;

      // For Base network, show capped amount due to 10% APY cap
      if (networkId === '8453') {
        const stkWellTotalSupply = parseFloat(marketData.baseStkWELLTotalSupply) / 10**18;
        const baseSafetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
        const epochsPerYear = 365 / 28;
        const targetAPY = 0.10;
        const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
        const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - baseSafetyModuleRewards);
        const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);
        const remainingWellHolder = wellBalance - cappedWellHolderBalance;

        markdown += `| Total WELL from auctions (available) | ${wellBalance.toLocaleString()} WELL |\n`;
        markdown += `| Total WELL from auctions (this epoch - capped) | ${cappedWellHolderBalance.toLocaleString()} WELL |\n`;
        markdown += `| Total WELL from auctions (reserved for future) | ${remainingWellHolder.toLocaleString()} WELL |\n`;
      } else {
        markdown += `| Total WELL to distribute Safety Module (Auctions) | ${wellBalance.toLocaleString()} WELL |\n`;
      }
    }
    markdown += `| Total WELL to distribute Markets (Config) | ${Math.max(0, Number(networkMarketData?.wellPerEpochMarkets)).toLocaleString()} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Sanity Check) | ${Math.max(0, Number(networkSummary?.totalWell)).toFixed(4).toLocaleString()} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Supply Side) | ${Math.max(0, Number(networkSummary?.supplyWell)).toFixed(4).toLocaleString()} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Borrow Side) | ${Math.max(0, Number(networkSummary?.borrowWell)).toFixed(4).toLocaleString()} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (Borrow + Supply) | ${Math.max(0, Number(networkSummary?.borrowWell) + Number(networkSummary?.supplyWell)).toFixed(4).toLocaleString()} WELL |\n`;
    markdown += `| Total WELL to distribute Markets (By Speed) | ${Math.max(0, Number(networkSummary?.totalWellBySpeed)).toFixed(4).toLocaleString()} WELL |\n`;
    // Check if wellHolderBalance is non-zero and adjust the display accordingly
    if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
      const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18;

      // For Base network, use capped amount due to 10% APY cap
      if (networkId === '8453') {
        const stkWellTotalSupply = parseFloat(marketData.baseStkWELLTotalSupply) / 10**18;
        const baseSafetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
        const epochsPerYear = 365 / 28;
        const targetAPY = 0.10;
        const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
        const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - baseSafetyModuleRewards);
        const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);

        const totalWell = Math.max(0, Number(networkMarketData.wellPerEpoch) + cappedWellHolderBalance);
        markdown += `| Total WELL to distribute (Config + Capped Auctions) | ${totalWell.toFixed(4).toLocaleString()} WELL |\n`;
      } else {
        const totalWell = Math.max(0, Number(networkMarketData.wellPerEpoch) + wellBalance);
        markdown += `| Total WELL to distribute (Config + Auctions) | ${totalWell.toFixed(4).toLocaleString()} WELL |\n`;
      }
    } else {
      markdown += `| Total WELL to distribute (Config) | ${Math.max(0, Number(networkMarketData.wellPerEpoch)).toFixed(4).toLocaleString()} WELL |\n`;
    }
    // For Sanity Check, also add wellBalance if it exists
    if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
      const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 10**18;

      // For Base network, use capped amount due to 10% APY cap
      if (networkId === '8453') {
        const stkWellTotalSupply = parseFloat(marketData.baseStkWELLTotalSupply) / 10**18;
        const baseSafetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
        const epochsPerYear = 365 / 28;
        const targetAPY = 0.10;
        const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
        const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - baseSafetyModuleRewards);
        const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);

        markdown += `| Total WELL to distribute (Sanity Check - Capped) | ${Math.max(0, Number(networkMarketData?.wellPerEpochDex) + Number(networkMarketData?.wellPerEpochSafetyModule) + Number(networkSummary?.totalWell) + cappedWellHolderBalance).toFixed(4).toLocaleString()} WELL \n`;
      } else {
        markdown += `| Total WELL to distribute (Sanity Check) | ${Math.max(0, Number(networkMarketData?.wellPerEpochDex) + Number(networkMarketData?.wellPerEpochSafetyModule) + Number(networkSummary?.totalWell) + wellBalance).toFixed(4).toLocaleString()} WELL \n`;
      }
    } else {
      markdown += `| Total WELL to distribute (Sanity Check) | ${Math.max(0, Number(networkMarketData?.wellPerEpochDex) + Number(networkMarketData?.wellPerEpochSafetyModule) + Number(networkSummary?.totalWell)).toFixed(4).toLocaleString()} WELL \n`;
    }

    markdown += `| | |\n`;
    if (Number(networkMarketData?.nativePerEpoch) !== 0) {
      markdown += `| Total ${nativeToken} to distribute Markets (Config) | ${Math.max(0, Number(networkMarketData?.nativePerEpoch)).toFixed(4).toLocaleString()} ${nativeToken} |\n`;
      markdown += `| Total ${nativeToken} to distribute Markets (Sanity Check) | ${Math.max(0, Number(networkSummary?.totalNative)).toFixed(4).toLocaleString()} ${nativeToken} |\n`;
      markdown += `| Total ${nativeToken} to distribute Markets (Supply Side) | ${Math.max(0, Number(networkSummary?.supplyNative)).toFixed(4).toLocaleString()} ${nativeToken} |\n`;
      markdown += `| Total ${nativeToken} to distribute Markets (Borrow Side) | ${Math.max(0, Number(networkSummary?.borrowNative)).toFixed(4).toLocaleString()} ${nativeToken} |\n`;
      markdown += `| Total ${nativeToken} to distribute Markets (Borrow + Supply) | ${Math.max(0, Number(networkSummary?.borrowNative) + Number(networkSummary?.supplyNative)).toFixed(4).toLocaleString()} ${nativeToken} |\n`;
      markdown += `| Total ${nativeToken} to distribute Markets (By Speed) | ${Math.max(0, Number(networkSummary?.totalNativeBySpeed)).toFixed(4).toLocaleString()} ${nativeToken} |\n`;
    }

    // Add Merkle Campaigns section for Base network
    if (networkId === '8453') {
      markdown += `\n### Merkle Campaigns\n\n`;
      markdown += `| Campaign | WELL Rewards (28 days) |\n`;
      markdown += `| -------- | ---------------------- |\n`;

      // stkWELL Merkle Campaign (Safety Module + Capped Auctions)
      if (networkMarketData?.wellPerEpochSafetyModule) {
        const safetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
        let stkWellTotal = safetyModuleRewards;

        // Add capped wellHolderBalance if available
        if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
          const stkWellTotalSupply = parseFloat(marketData.baseStkWELLTotalSupply) / 1e18;
          const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 1e18;
          const epochsPerYear = 365 / 28;
          const targetAPY = 0.10;
          const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
          const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - safetyModuleRewards);
          const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);
          stkWellTotal = safetyModuleRewards + cappedWellHolderBalance;
        }
        markdown += `| stkWELL (Safety Module) | ${Math.max(0, stkWellTotal).toLocaleString()} WELL |\n`;
      }

      // MetaMorpho Vault Campaigns
      if (networkMarketData?.vaultAmounts) {
        const vaultAmounts = networkMarketData.vaultAmounts;
        if (vaultAmounts.USDC > 0) {
          markdown += `| USDC MetaMorpho Vault | ${Math.max(0, Number(vaultAmounts.USDC)).toLocaleString()} WELL |\n`;
        }
        if (vaultAmounts.WETH > 0) {
          markdown += `| WETH MetaMorpho Vault | ${Math.max(0, Number(vaultAmounts.WETH)).toLocaleString()} WELL |\n`;
        }
        if (vaultAmounts.EURC > 0) {
          markdown += `| EURC MetaMorpho Vault | ${Math.max(0, Number(vaultAmounts.EURC)).toLocaleString()} WELL |\n`;
        }
        if (vaultAmounts.cbBTC > 0) {
          markdown += `| cbBTC MetaMorpho Vault | ${Math.max(0, Number(vaultAmounts.cbBTC)).toLocaleString()} WELL |\n`;
        }

        // Calculate total Merkle rewards
        const totalVaultRewards = (vaultAmounts.USDC || 0) + (vaultAmounts.WETH || 0) + (vaultAmounts.EURC || 0) + (vaultAmounts.cbBTC || 0);
        let totalMerkleRewards = totalVaultRewards;
        if (networkMarketData?.wellPerEpochSafetyModule) {
          const safetyModuleRewards = parseFloat(networkMarketData.wellPerEpochSafetyModule);
          let stkWellTotal = safetyModuleRewards;
          if (networkMarketData?.wellHolderBalance && Number(networkMarketData.wellHolderBalance) > 0) {
            const stkWellTotalSupply = parseFloat(marketData.baseStkWELLTotalSupply) / 1e18;
            const wellBalance = parseFloat(networkMarketData.wellHolderBalance) / 1e18;
            const epochsPerYear = 365 / 28;
            const targetAPY = 0.10;
            const maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear;
            const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - safetyModuleRewards);
            const cappedWellHolderBalance = Math.min(wellBalance, maxWellHolderContribution);
            stkWellTotal = safetyModuleRewards + cappedWellHolderBalance;
          }
          totalMerkleRewards += stkWellTotal;
        }
        markdown += `| **Total Merkle Campaigns** | **${Math.max(0, totalMerkleRewards).toLocaleString()} WELL** |\n`;
      }
    }

    markdown += `\n`;
    // Iterate over the markets for the specific network, but only include enabled markets
    for (const market of Object.values(marketData[networkId])) {
      // Skip markets that are not enabled
      if (!market.enabled) {
        continue;
      }
      
      markdown += `### ${market.name} (${market.alias})\n\n`;
      // Cancel out boosts and deboosts so we don't show incorrect total supply in USD
      markdown += `Total Supply in USD: ${formatUSD(market.totalSupplyUSD - market.boost + market.deboost)}\n`;
      markdown += `Total Borrows in USD: ${formatUSD(market.totalBorrowsUSD)}\n`;
      
      // Add reserves to auction if enabled and available
      if (market.reservesEnabled && (market.reserves - market.minimumReserves) > 0) {
        const reservesToAuction = (market.reserves - market.minimumReserves) * market.underlyingPrice;
        markdown += `**Reserves to auction: ${formatUSD(reservesToAuction)}**\n`;
      }
      markdown += '\n';
      markdown += `| Metric | Current Value | New Value |\n`;
      markdown += `| --- | --- | --- |\n`;
      markdown += `| Supply APY | ${Math.max(0, market.supplyApy * 100).toFixed(2)}% | ${Math.max(0, market.supplyApy * 100).toFixed(2)}% |\n`;
      markdown += `| Borrow APY | ${Math.max(0, market.borrowApy * 100).toFixed(2)}% | ${Math.max(0, market.borrowApy * 100).toFixed(2)}% |\n`;
      markdown += `| WELL Supply APR | ${Math.max(0, market.wellSupplyApr)}% | ${Math.max(0, market.newWellSupplyApr)}% |\n`;
      markdown += `| WELL Borrow APR | ${Math.max(0, market.wellBorrowApr)}% | ${Math.max(0, market.newWellBorrowApr)}% |\n`;
      if (Number(networkMarketData?.nativePerEpoch) !== 0) {
        markdown += `| ${nativeToken} Supply APR | ${Math.max(0, market.nativeSupplyApr)}% | ${Math.max(0, market.newNativeSupplyApr)}% |\n`;
        markdown += `| ${nativeToken} Borrow APR | ${Math.max(0, market.nativeBorrowApr)}% | ${Math.max(0, market.newNativeBorrowApr)}% |\n`;
      }
      if (Number(networkMarketData?.nativePerEpoch) !== 0) {
        markdown += `| Total Supply APR | ${Math.max(0, ((Number(market.supplyApy) + (market.wellSupplyApr / 100) + (market.nativeSupplyApr / 100)) * 100)).toFixed(2)}% | ${Math.max(0, ((Number(market.supplyApy) + (market.newWellSupplyApr / 100) + (market.newNativeSupplyApr / 100)) * 100)).toFixed(2)}% |\n`;
        markdown += `| Total Borrow APR | ${Math.max(0, ((Number(market.borrowApy) - (market.wellBorrowApr / 100) - (market.nativeBorrowApr / 100)) * 100)).toFixed(2)}% | ${Math.max(0, ((Number(market.borrowApy) - (market.newWellBorrowApr / 100) - (market.newNativeBorrowApr / 100)) * 100)).toFixed(2)}% |\n`;
      } else {
        markdown += `| Total Supply APR | ${Math.max(0, ((Number(market.supplyApy) + (market.wellSupplyApr / 100)) * 100)).toFixed(2)}% | ${Math.max(0, ((Number(market.supplyApy) + (market.newWellSupplyApr / 100)) * 100)).toFixed(2)}% |\n`;
        markdown += `| Total Borrow APR | ${Math.max(0, ((Number(market.borrowApy) - (market.wellBorrowApr / 100)) * 100)).toFixed(2)}% | ${Math.max(0, ((Number(market.borrowApy) - (market.newWellBorrowApr / 100)) * 100)).toFixed(2)}% |\n`;
      }
      if (Number(networkMarketData?.nativePerEpoch) !== 0) {
        markdown += `| Total Supply Incentives Per Day in USD | ${formatUSD(Math.max(0, (Number(market.wellSupplyPerDayUsd) + Number(market.nativeSupplyPerDayUsd))))} | ${formatUSD(Math.max(0, (Number(market.newWellSupplyPerDayUsd) + Number(market.newNativeSupplyPerDayUsd))))} |\n`;
        markdown += `| Total Borrow Incentives Per Day in USD | ${formatUSD(Math.max(0, (Number(market.wellBorrowPerDayUsd) + Number(market.nativeBorrowPerDayUsd))))} | ${formatUSD(Math.max(0, (Number(market.newWellBorrowPerDayUsd) + Number(market.newNativeBorrowPerDayUsd))))} |\n`;
      } else {
        markdown += `| Total Supply Incentives Per Day in USD | ${formatUSD(Math.max(0, Number(market.wellSupplyPerDayUsd)))} | ${formatUSD(Math.max(0, Number(market.newWellSupplyPerDayUsd)))} |\n`;
        markdown += `| Total Borrow Incentives Per Day in USD | ${formatUSD(Math.max(0, Number(market.wellBorrowPerDayUsd)))} | ${formatUSD(Math.max(0, Number(market.newWellBorrowPerDayUsd)))} |\n`;
      }
      markdown += '\n';
      markdown += `| Metric | % Change |\n`;
      markdown += `| --- | --- |\n`;
      markdown += `| WELL Supply | ${market.wellChangeSupplySpeedPercentage}% |\n`;
      markdown += `| WELL Borrow | ${market.wellChangeBorrowSpeedPercentage}% |\n`;
      if (Number(networkMarketData?.nativePerEpoch) !== 0) {
        markdown += `| ${nativeToken} Supply | ${market.nativeChangeSupplySpeedPercentage}% |\n`;
        markdown += `| ${nativeToken} Borrow | ${market.nativeChangeBorrowSpeedPercentage === 99999999999900 ? '0%' : `${market.nativeChangeBorrowSpeedPercentage}%`} |\n`;
      }
    }
  } else {
    markdown += 'Invalid network provided.\n';
  }
  return markdown;
}

export default generateMarkdown;
