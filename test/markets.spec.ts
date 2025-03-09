import { describe, it, expect, vi } from 'vitest';
import { getMarketData, MarketType } from '../src/markets';

describe('Markets module', () => {
  it('should calculate totalSupplyUSD and totalBorrowsUSD correctly', { timeout: 20000 }, async () => {
    // Set 20 second timeout for this test
    // Use a recent timestamp
    const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago to ensure block availability
    
    // Get market data
    const data = await getMarketData(timestamp);
    
    // Check that we have data for all networks
    expect(data[1284]).toBeDefined(); // Moonbeam
    expect(data[8453]).toBeDefined(); // Base
    expect(data[10]).toBeDefined(); // Optimism
    
    // Check that totalSupplyUSD and totalBorrowsUSD are not zero for all markets in each network
    // Collect markets with zero values
    const marketsWithZeroValues: { network: string, symbol: string, totalSupplyUSD: number, totalBorrowsUSD: number }[] = [];
    
    // Check Moonbeam markets
    data[1284].forEach((market: MarketType) => {
      if (market.totalSupplyUSD === 0 || market.totalBorrowsUSD === 0) {
        marketsWithZeroValues.push({
          network: 'Moonbeam',
          symbol: market.name,
          totalSupplyUSD: market.totalSupplyUSD,
          totalBorrowsUSD: market.totalBorrowsUSD
        });
      }
    });
    
    // Check Base markets
    data[8453].forEach((market: MarketType) => {
      if (market.totalSupplyUSD === 0 || market.totalBorrowsUSD === 0) {
        marketsWithZeroValues.push({
          network: 'Base',
          symbol: market.name,
          totalSupplyUSD: market.totalSupplyUSD,
          totalBorrowsUSD: market.totalBorrowsUSD
        });
      }
    });
    
    // Check Optimism markets
    data[10].forEach((market: MarketType) => {
      if (market.totalSupplyUSD === 0 || market.totalBorrowsUSD === 0) {
        marketsWithZeroValues.push({
          network: 'Optimism',
          symbol: market.name,
          totalSupplyUSD: market.totalSupplyUSD,
          totalBorrowsUSD: market.totalBorrowsUSD
        });
      }
    });
    
    // If any markets have zero values, fail the test and output the details
    if (marketsWithZeroValues.length > 0) {
      console.error('Markets with zero values:');
      marketsWithZeroValues.forEach(market => {
        console.error(`${market.network} - ${market.symbol}: totalSupplyUSD=${market.totalSupplyUSD}, totalBorrowsUSD=${market.totalBorrowsUSD}`);
      });
      expect(marketsWithZeroValues.length, 'Some markets have zero totalSupplyUSD or totalBorrowsUSD values').toBe(0);
    }
    
    // Log some sample values for manual verification
    console.log('Sample market data:');
    console.log('Moonbeam market 0:', {
      totalSupplyUSD: data[1284][0].totalSupplyUSD,
      totalBorrowsUSD: data[1284][0].totalBorrowsUSD
    });
    console.log('Base market 0:', {
      totalSupplyUSD: data[8453][0].totalSupplyUSD,
      totalBorrowsUSD: data[8453][0].totalBorrowsUSD
    });
    console.log('Optimism market 0:', {
      totalSupplyUSD: data[10][0].totalSupplyUSD,
      totalBorrowsUSD: data[10][0].totalBorrowsUSD
    });
  });
});
