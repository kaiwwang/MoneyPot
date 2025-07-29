// API Test File - Test connection to local backend
// Run this in browser console to test API connection

import apiService from './services/api.js';
import dataService from './services/dataService.js';

console.log('Testing MoneyPot Local Backend API Connection...');

// Test 1: Get Portfolio
try {
  const portfolio = await apiService.getPortfolio();
  console.log('✅ Portfolio API test:', portfolio);
} catch (error) {
  console.error('❌ Portfolio API failed:', error);
}

// Test 2: Get Market Stocks
try {
  const marketData = await apiService.getMarketStocks();
  console.log('✅ Market API test:', marketData);
} catch (error) {
  console.error('❌ Market API failed:', error);
}

// Test 3: Transform Portfolio Data
try {
  const portfolioData = await dataService.getPortfolio();
  const transformedData = dataService.transformPortfolioData(portfolioData);
  console.log('✅ Portfolio transformation test:', transformedData);
} catch (error) {
  console.error('❌ Portfolio transformation failed:', error);
}

// Test 4: Transform Market Data
try {
  const marketData = await dataService.getAvailableStocks();
  const transformedStocks = dataService.transformStocksData(marketData);
  console.log('✅ Market transformation test:', transformedStocks);
} catch (error) {
  console.error('❌ Market transformation failed:', error);
}

console.log('API tests completed. Check results above.');
