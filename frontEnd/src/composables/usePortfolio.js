/**
 * Portfolio Composable - Vue 3 Composition API
 * Manages portfolio state and API interactions
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import dataService from '../services/dataService.js';

export function usePortfolio() {
  // ========== Reactive State ==========
  const loading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);

  const userInfo = ref({
    id: 'LOCAL_USER',
    name: 'Local User',
    balance: 50000,
    registerDate: '2024-01-01',
    riskLevel: 'Conservative'
  });

  const portfolio = ref([]);
  const availableStocks = ref([]);
  const tradeHistory = ref([]);
  
  // Real-time update interval
  let updateInterval = null;

  // ========== Computed Properties ==========
  const totalAssets = computed(() => {
    const holdingsValue = portfolio.value.reduce((sum, stock) => {
      return sum + (stock.currentPrice * stock.shares);
    }, 0);
    return userInfo.value.balance + holdingsValue;
  });

  const holdingsValue = computed(() => {
    return portfolio.value.reduce((sum, stock) => {
      return sum + (stock.currentPrice * stock.shares);
    }, 0);
  });

  const todayPnL = computed(() => {
    return portfolio.value.reduce((sum, stock) => {
      return sum + stock.pnl;
    }, 0);
  });

  const totalChange = computed(() => {
    const totalCost = portfolio.value.reduce((sum, stock) => {
      return sum + (stock.costPrice * stock.shares);
    }, 0);
    return totalCost > 0 ? ((holdingsValue.value - totalCost) / totalCost) * 100 : 0;
  });

  // ========== API Methods ==========
  
  /**
   * Load user account information
   */
  const loadAccountInfo = async () => {
    try {
      loading.value = true;
      const accountData = await dataService.getAccountInfo();
      if (accountData) {
        userInfo.value = dataService.transformAccountData(accountData);
      }
    } catch (err) {
      error.value = `Failed to load account info: ${err.message}`;
      console.error('Error loading account info:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load portfolio data
   */
  const loadPortfolio = async () => {
    try {
      loading.value = true;
      const portfolioData = await dataService.getPortfolio();
      if (portfolioData) {
        portfolio.value = dataService.transformPortfolioData(portfolioData);
      }
    } catch (err) {
      error.value = `Failed to load portfolio: ${err.message}`;
      console.error('Error loading portfolio:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load available stocks
   */
  const loadAvailableStocks = async () => {
    try {
      const stocksData = await dataService.getAvailableStocks();
      if (stocksData) {
        availableStocks.value = dataService.transformStocksData(stocksData);
      }
    } catch (err) {
      error.value = `Failed to load stocks: ${err.message}`;
      console.error('Error loading available stocks:', err);
    }
  };

  /**
   * Load trade history
   */
  const loadTradeHistory = async () => {
    try {
      const historyData = await dataService.getTradeHistory();
      if (historyData && Array.isArray(historyData)) {
        tradeHistory.value = dataService.transformTradeHistoryData(historyData);
      }
    } catch (err) {
      error.value = `Failed to load trade history: ${err.message}`;
      console.error('Error loading trade history:', err);
    }
  };

  /**
   * Execute a trade
   */
  const executeTrade = async (tradeData) => {
    try {
      loading.value = true;
      const result = await dataService.executeTrade(tradeData);
      
      // Reload data after successful trade
      await Promise.all([
        loadPortfolio(),
        loadAccountInfo(),
        loadTradeHistory()
      ]);
      
      return result;
    } catch (err) {
      error.value = `Trade failed: ${err.message}`;
      console.error('Error executing trade:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get stock history for charts
   */
  const getStockHistory = async (ticker, period = '1M') => {
    try {
      const historyData = await dataService.getStockHistory(ticker, period);
      return dataService.transformChartData(historyData, 'candlestick');
    } catch (err) {
      error.value = `Failed to load stock history: ${err.message}`;
      console.error('Error loading stock history:', err);
      return [];
    }
  };

  /**
   * Initialize all data
   */
  const initializeData = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // Load all initial data in parallel
      await Promise.all([
        loadAccountInfo(),
        loadPortfolio(),
        loadAvailableStocks(),
        loadTradeHistory()
      ]);
      
      lastUpdated.value = new Date();
    } catch (err) {
      error.value = `Failed to initialize data: ${err.message}`;
      console.error('Error initializing data:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Start real-time updates
   */
  const startRealTimeUpdates = (intervalMs = 30000) => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(async () => {
      try {
        // Update portfolio and market data
        await Promise.all([
          loadPortfolio(),
          loadAvailableStocks()
        ]);
        lastUpdated.value = new Date();
      } catch (err) {
        console.error('Error in real-time update:', err);
      }
    }, intervalMs);
  };

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  };

  /**
   * Refresh all data manually
   */
  const refreshData = async () => {
    dataService.clearCache();
    await initializeData();
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };

  // ========== Lifecycle ==========
  onMounted(() => {
    initializeData();
    startRealTimeUpdates();
  });

  onUnmounted(() => {
    stopRealTimeUpdates();
  });

  // ========== Return API ==========
  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    userInfo: readonly(userInfo),
    portfolio: readonly(portfolio),
    availableStocks: readonly(availableStocks),
    tradeHistory: readonly(tradeHistory),
    
    // Computed
    totalAssets,
    holdingsValue,
    todayPnL,
    totalChange,
    
    // Methods
    initializeData,
    loadAccountInfo,
    loadPortfolio,
    loadAvailableStocks,
    loadTradeHistory,
    executeTrade,
    getStockHistory,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    refreshData,
    clearError
  };
}

// Import readonly helper
import { readonly } from 'vue';
