// Simple script to test the markets.ts module
const { getMarketData } = require('./src/markets.ts');

async function testMarkets() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const data = await getMarketData(timestamp);
    
    console.log('Sample market data:');
    console.log('Moonbeam market 0 totalSupplyUSD:', data[1284][0].totalSupplyUSD);
    console.log('Moonbeam market 0 totalBorrowsUSD:', data[1284][0].totalBorrowsUSD);
    console.log('Base market 0 totalSupplyUSD:', data[8453][0].totalSupplyUSD);
    console.log('Base market 0 totalBorrowsUSD:', data[8453][0].totalBorrowsUSD);
    console.log('Optimism market 0 totalSupplyUSD:', data[10][0].totalSupplyUSD);
    console.log('Optimism market 0 totalBorrowsUSD:', data[10][0].totalBorrowsUSD);
  } catch (error) {
    console.error('Error testing markets:', error);
  }
}

testMarkets();
