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
  async getAllTickers() {
    try {
      return await this.dbService.getAllTickers();
    } catch (error) {
      logger.error('获取股票代码失败:', error);
      return [];
    }
  }

  /**
   * 获取股票最新数据
   */
  async getLatestStockData(ticker) {
    try {
      const data = await this.dbService.getStockData(ticker, 2);
      if (!data || data.length === 0) {
        return null;
      }
      
      const latest = data[0];
      
      // 计算涨跌幅（与前一天比较）
      let change = 0;
      let changePercentage = 0;
      
      if (data.length > 1) {
        const previous = data[1];
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
    } catch (error) {
      logger.error('获取股票最新数据失败:', error);
      return null;
    }
  }

  /**
   * 获取股票历史数据
   */
  async getStockHistory(ticker, days = 30) {
    try {
      return await this.dbService.getStockHistory(ticker, days);
    } catch (error) {
      logger.error('获取股票历史数据失败:', error);
      return [];
    }
  }

  /**
   * 获取所有股票的最新数据
   */
  async getAllLatestStockData() {
    try {
      const data = await this.dbService.getAllLatestStockData();
      const stocks = [];
      
      for (const row of data) {
        const stockData = await this.getLatestStockData(row.ticker);
        if (stockData) {
          stocks.push(stockData);
        }
      }
      
      return stocks;
    } catch (error) {
      logger.error('获取所有股票最新数据失败:', error);
      return [];
    }
  }

  /**
   * 验证股票代码是否存在
   */
  async isValidTicker(ticker) {
    try {
      const tickers = await this.getAllTickers();
      return tickers.includes(ticker);
    } catch (error) {
      logger.error('验证股票代码失败:', error);
      return false;
    }
  }

  /**
   * 获取股票名称
   */
  getStockName(ticker) {
    return this.stockNames[ticker] || ticker;
  }
}

module.exports = StockDataService; 