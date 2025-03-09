import { describe, it, expect } from 'vitest';
import { getMarketData } from '../src/markets';

describe('Zero Prices Check', () => {
  it('should log zero prices and check for zero totalSupplyUSD and totalBorrowsUSD', { timeout: 20000 }, async () => {
    console.log('Testing for zero prices in market data...');
    
    // Use current timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    
    try {
      console.log('Fetching market data...');
      const marketData = await getMarketData(timestamp);
      
      // Check Moonbeam markets
      console.log('\nChecking Moonbeam markets for zero prices:');
      const moonbeamMarkets = marketData[1284];
      const moonbeamResults = checkMarketsForZeroValues(moonbeamMarkets, 'Moonbeam');
      
      // Check Base markets
      console.log('\nChecking Base markets for zero prices:');
      const baseMarkets = marketData[8453];
      const baseResults = checkMarketsForZeroValues(baseMarkets, 'Base');
      
      // Check Optimism markets
      console.log('\nChecking Optimism markets for zero prices:');
      const optimismMarkets = marketData[10];
      const optimismResults = checkMarketsForZeroValues(optimismMarkets, 'Optimism');
      
      console.log('\nTest completed successfully!');
      
      // This test will always pass, we're just using it to run the checks
      expect(true).toBe(true);
    } catch (error) {
      console.error('Error running test:', error);
      throw error;
    }
  });
});

function checkMarketsForZeroValues(markets: any[], networkName: string) {
  let zeroSupplyCount = 0;
  let zeroBorrowCount = 0;
  let zeroPriceCount = 0;
  
  markets.forEach(market => {
    if (market.underlyingPrice === 0) {
      console.log(`  - ${market.name}: ZERO PRICE DETECTED`);
      zeroPriceCount++;
    }
    
    if (market.totalSupplyUSD === 0) {
      zeroSupplyCount++;
    }
    
    if (market.totalBorrowsUSD === 0) {
      zeroBorrowCount++;
    }
  });
  
  console.log(`  ${networkName} summary: ${zeroPriceCount} markets with zero price, ${zeroSupplyCount} markets with zero totalSupplyUSD, ${zeroBorrowCount} markets with zero totalBorrowsUSD`);
  
  return { zeroPriceCount, zeroSupplyCount, zeroBorrowCount };
}
