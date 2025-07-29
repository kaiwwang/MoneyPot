const logger = require('../logger');
const DatabaseService = require('./DatabaseService');

class StockDataService {
  constructor() {
    this.dbService = new DatabaseService();
    this.stockNames = {
      'GLE FP': 'Societe Generale',
      'KPN NA': 'Koninklijke KPN',
      'NK FP': 'Natixis',
      'ROVI SM': 'Laboratorios Rovi',
      'AALB NA': 'ASML Holding'
    };
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    return await this.dbService.testConnection();
  }

  /**
   * 获取所有股票代码
   */
  getAllTickers() {
    return Array.from(this.stockData.keys());
  }

  /**
   * 获取股票最新数据
   */
  getLatestStockData(ticker) {
    const data = this.stockData.get(ticker);
    if (!data || data.length === 0) {
      return null;
    }
    
    // 获取最新数据（按日期排序）
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedData[0];
    
    // 计算涨跌幅（与前一天比较）
    let change = 0;
    let changePercentage = 0;
    
    if (sortedData.length > 1) {
      const previous = sortedData[1];
      change = latest.close - previous.close;
      changePercentage = (change / previous.close) * 100;
    }
    
    return {
      ticker,
      name: this.stockNames[ticker] || ticker,
      currentPrice: latest.close,
      high: latest.high,
      low: latest.low,
      open: latest.open,
      volume: latest.volume,
      change,
      changePercentage
    };
  }

  /**
   * 获取股票历史数据
   */
  getStockHistory(ticker, days = 30) {
    const data = this.stockData.get(ticker);
    if (!data) {
      return [];
    }
    
    // 按日期排序并返回最近的数据
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData.slice(0, days);
  }

  /**
   * 获取所有股票的最新数据
   */
  getAllLatestStockData() {
    const stocks = [];
    for (const ticker of this.stockData.keys()) {
      const stockData = this.getLatestStockData(ticker);
      if (stockData) {
        stocks.push(stockData);
      }
    }
    return stocks;
  }

  /**
   * 验证股票代码是否存在
   */
  isValidTicker(ticker) {
    return this.stockData.has(ticker);
  }

  /**
   * 获取股票名称
   */
  getStockName(ticker) {
    return this.stockNames[ticker] || ticker;
  }
}

module.exports = StockDataService; 