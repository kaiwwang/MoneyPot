/**
 * Data Service - Handles data transformation and caching
 */

import apiService from './api.js';

class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  /**
   * Get data from cache or fetch from API
   */
  async getCachedData(key, fetchFunction) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key).data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      // Return cached data if available, even if expired
      const cached = this.cache.get(key);
      if (cached) {
        console.warn(`Using expired cache for ${key}`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // ========== Data Fetching Methods ==========

  /**
   * Get user account information with caching
   */
  async getAccountInfo() {
    return this.getCachedData('account_info', () => 
      apiService.getAccountInfo()
    );
  }

  /**
   * Get portfolio data with real-time updates
   */
  async getPortfolio() {
    return this.getCachedData('portfolio', () => 
      apiService.getPortfolio()
    );
  }

  /**
   * Get available stocks with caching
   */
  async getAvailableStocks() {
    return this.getCachedData('market_stocks', () => 
      apiService.getMarketStocks()
    );
  }

  /**
   * Get specific stock data
   */
  async getStockData(ticker) {
    return this.getCachedData(`stock_${ticker}`, () => 
      apiService.getStockData(ticker)
    );
  }

  /**
   * Get stock history for charts
   */
  async getStockHistory(ticker, period = '1M') {
    const key = `stock_history_${ticker}_${period}`;
    return this.getCachedData(key, () => 
      apiService.getStockHistory(ticker, period)
    );
  }

  /**
   * Get trade history
   */
  async getTradeHistory() {
    return this.getCachedData('trade_history', () => 
      apiService.getTradeHistory()
    );
  }

  /**
   * Execute trade and clear relevant cache
   */
  async executeTrade(tradeData) {
    try {
      const result = await apiService.executeTrade(tradeData);
      
      // Clear cache for user portfolio and balance
      this.clearCache('portfolio');
      this.clearCache('account_info');
      this.clearCache('trade_history');
      
      return result;
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  /**
   * Get real-time data for multiple stocks
   */
  async getRealTimeData(tickers) {
    // For the local backend, we'll get individual stock data
    try {
      const promises = tickers.map(ticker => apiService.getStockData(ticker));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Real-time data fetch failed:', error);
      throw error;
    }
  }

  // ========== Data Transformation Methods ==========

  /**
   * Transform API portfolio data to component format
   */
  transformPortfolioData(apiData) {
    if (!apiData || !apiData.holdings || !Array.isArray(apiData.holdings)) return [];
    
    return apiData.holdings.map(stock => ({
      code: stock.ticker,
      name: stock.name,
      currentPrice: parseFloat(stock.currentPrice),
      changePercent: parseFloat(stock.changePercentage || 0),
      shares: parseInt(stock.quantity),
      costPrice: parseFloat(stock.costPrice),
      pnl: parseFloat(stock.profit),
      yearHigh: parseFloat(stock.currentPrice * 1.2), // 估算年高点
      yearLow: parseFloat(stock.currentPrice * 0.8),  // 估算年低点
      volume: stock.volume ? stock.volume.toString() : '0'
    }));
  }

  /**
   * Transform API market stocks data to component format
   */
  transformStocksData(apiData) {
    if (!apiData || !apiData.stocks || !Array.isArray(apiData.stocks)) return [];
    
    return apiData.stocks.map(stock => ({
      code: stock.ticker,
      name: stock.name,
      price: parseFloat(stock.currentPrice),
      change: parseFloat(stock.changePercentage || 0)
    }));
  }

  /**
   * Transform API account data to component format
   */
  transformAccountData(apiData) {
    if (!apiData) return null;
    
    return {
      id: 'LOCAL_USER',
      name: 'Local User',
      balance: parseFloat(apiData.currentBalance || apiData.balance || 50000),
      registerDate: '2024-01-01',
      riskLevel: 'Conservative'
    };
  }

  /**
   * Transform API chart data to ECharts format
   */
  transformChartData(apiData, type = 'line') {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    switch (type) {
      case 'candlestick':
        return apiData.map(item => [
          item.timestamp || item.date,
          parseFloat(item.open),
          parseFloat(item.close),
          parseFloat(item.low),
          parseFloat(item.high),
          parseInt(item.volume || 0)
        ]);
      
      case 'line':
      default:
        return apiData.map(item => ({
          name: item.date || item.timestamp,
          value: parseFloat(item.value || item.price || item.close)
        }));
    }
  }

  /**
   * Transform API trade history data to component format
   */
  transformTradeHistoryData(apiData) {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData.map((trade, index) => ({
      id: index + 1,
      stockCode: trade.stock_code || "",
      stockName: trade.stock_name || "Unknown",
      type: (trade.trade_type || "buy").toLowerCase(),
      quantity: Number(trade.trade_volume) || 0,
      price: Number(trade.trade_price) || 0,
      date: this.formatTradeDate(trade.trade_date),
      totalAmount: Number(trade.trade_amount) || 0,
      totalHoldings: Number(trade.total_holdings) || 0,
      avgCost: Number(trade.avg_cost) || 0
    }));
  }

  /**
   * Format trade date for display
   */
  formatTradeDate(tradeDate) {
    if (!tradeDate) {
      return new Date().toLocaleDateString('zh-CN');
    }
    
    try {
      // 处理数据库返回的时间格式，可能是ISO格式或字符串格式
      let date;
      
      if (typeof tradeDate === 'string') {
        // 如果是ISO格式（包含T和Z），直接解析
        if (tradeDate.includes('T')) {
          date = new Date(tradeDate);
        } else {
          // 如果是 "2024-09-09 09:30:15" 格式，转换为ISO格式
          date = new Date(tradeDate.replace(' ', 'T') + 'Z');
        }
      } else {
        date = new Date(tradeDate);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', tradeDate);
        return new Date().toLocaleDateString('zh-CN');
      }
      
      // 格式化为中文日期格式，使用本地时区
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai'
      });
    } catch (error) {
      console.error('Error formatting trade date:', error, tradeDate);
      return new Date().toLocaleDateString('zh-CN');
    }
  }
}

// Create and export singleton instance
const dataService = new DataService();
export default dataService;

// Also export the class
export { DataService };
