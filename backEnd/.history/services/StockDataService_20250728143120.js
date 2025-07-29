const fs = require('fs');
const path = require('path');
const logger = require('../logger');

class StockDataService {
  constructor() {
    this.stockData = new Map();
    this.stockNames = {
      'GLE FP': 'Societe Generale',
      'KPN NA': 'Koninklijke KPN',
      'NK FP': 'Natixis',
      'ROVI SM': 'Laboratorios Rovi',
      'AALB NA': 'ASML Holding'
    };
    this.loadStockData();
  }

  /**
   * 加载CSV数据
   */
  loadStockData() {
    try {
      const csvPath = path.join(__dirname, '../uploaded_files/top5_companies_filtered.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n');
      
      // 跳过标题行
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [ticker, date, close, rawClose, high, low, open, volume] = line.split(',');
        
        if (!this.stockData.has(ticker)) {
          this.stockData.set(ticker, []);
        }
        
        this.stockData.get(ticker).push({
          date,
          close: parseFloat(close),
          high: parseFloat(high),
          low: parseFloat(low),
          open: parseFloat(open),
          volume: parseFloat(volume)
        });
      }
      
      logger.info(`成功加载 ${this.stockData.size} 只股票的数据`);
    } catch (error) {
      logger.error('加载股票数据失败:', error);
    }
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