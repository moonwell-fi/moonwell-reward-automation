import { getMarketData } from './src/markets';

async function testZeroPrices() {
  console.log('Testing for zero prices in market data...');
  
  // Use current timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  
  try {
    const marketData = await getMarketData(timestamp);
    
    // Check Moonbeam markets
    console.log('\nChecking Moonbeam markets:');
    const moonbeamMarkets = marketData[1284];
    checkMarketsForZeroValues(moonbeamMarkets, 'Moonbeam');
    
    // Check Base markets
    console.log('\nChecking Base markets:');
    const baseMarkets = marketData[8453];
    checkMarketsForZeroValues(baseMarkets, 'Base');
    
    // Check Optimism markets
    console.log('\nChecking Optimism markets:');
    const optimismMarkets = marketData[10];
    checkMarketsForZeroValues(optimismMarkets, 'Optimism');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

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
}

// Run the test
testZeroPrices();
