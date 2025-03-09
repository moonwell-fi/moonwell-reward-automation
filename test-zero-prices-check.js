const { getMarketData } = require('./src/markets.ts');

async function testZeroPrices() {
  console.log('Testing for zero prices in market data...');
  
  // Use current timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  
  try {
    console.log('Fetching market data...');
    const marketData = await getMarketData(timestamp);
    
    // Check Moonbeam markets
    console.log('\nChecking Moonbeam markets for zero prices:');
    const moonbeamMarkets = marketData[1284];
    checkMarketsForZeroValues(moonbeamMarkets, 'Moonbeam');
    
    // Check Base markets
    console.log('\nChecking Base markets for zero prices:');
    const baseMarkets = marketData[8453];
    checkMarketsForZeroValues(baseMarkets, 'Base');
    
    // Check Optimism markets
    console.log('\nChecking Optimism markets for zero prices:');
    const optimismMarkets = marketData[10];
    checkMarketsForZeroValues(optimismMarkets, 'Optimism');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

function checkMarketsForZeroValues(markets, networkName) {
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
}

// Run the test
testZeroPrices();
