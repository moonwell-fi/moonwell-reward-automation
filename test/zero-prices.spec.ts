import { describe, it, expect } from 'vitest';
import { getMarketData } from '../src/markets';

describe('Market Price Tests', () => {
  it('should not have zero values for totalSupplyUSD and totalBorrowsUSD', async () => {
    // Use current timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    
    const marketData = await getMarketData(timestamp);
    
    // Check Moonbeam markets
    console.log('\nChecking Moonbeam markets:');
    const moonbeamMarkets = marketData[1284];
    const moonbeamZeroValues = checkMarketsForZeroValues(moonbeamMarkets, 'Moonbeam');
    
    // Check Base markets
    console.log('\nChecking Base markets:');
    const baseMarkets = marketData[8453];
    const baseZeroValues = checkMarketsForZeroValues(baseMarkets, 'Base');
    
    // Check Optimism markets
    console.log('\nChecking Optimism markets:');
    const optimismMarkets = marketData[10];
    const optimismZeroValues = checkMarketsForZeroValues(optimismMarkets, 'Optimism');
    
    // Assert that there are no markets with zero values
    expect(moonbeamZeroValues.zeroSupplyCount).toBe(0);
    expect(moonbeamZeroValues.zeroBorrowCount).toBe(0);
    expect(baseZeroValues.zeroSupplyCount).toBe(0);
    expect(baseZeroValues.zeroBorrowCount).toBe(0);
    expect(optimismZeroValues.zeroSupplyCount).toBe(0);
    expect(optimismZeroValues.zeroBorrowCount).toBe(0);
  });
});

function checkMarketsForZeroValues(markets: any[], networkName: string) {
  let zeroSupplyCount = 0;
  let zeroBorrowCount = 0;
  
  markets.forEach(market => {
    if (market.totalSupplyUSD === 0) {
      zeroSupplyCount++;
    }
    
    if (market.totalBorrowsUSD === 0) {
      zeroBorrowCount++;
    }
  });
  
  if (zeroSupplyCount === 0 && zeroBorrowCount === 0) {
    console.log(`  All ${networkName} markets have non-zero values for totalSupplyUSD and totalBorrowsUSD`);
  } else {
    console.log(`  Found ${zeroSupplyCount} markets with zero totalSupplyUSD and ${zeroBorrowCount} markets with zero totalBorrowsUSD`);
  }
  
  return { zeroSupplyCount, zeroBorrowCount };
}
