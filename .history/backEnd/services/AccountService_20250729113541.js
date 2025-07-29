const logger = require('../logger');
const StockDataService = require('./StockDataService');
const DatabaseService = require('./DatabaseService');

class AccountService {
  constructor() {
    this.stockDataService = new StockDataService();
    this.dbService = new DatabaseService();
    
    // 模拟用户数据（实际应用中应该使用数据库）
    this.userAccount = {
      initialBalance: 100000, // 初始资金10万
      currentBalance: 100000, // 当前现金余额
      holdings: new Map(), // 持仓信息
      trades: [] // 交易记录
    };
  }

  /**
   * 初始化数据库连接
   */
  async initialize() {
    try {
      await this.dbService.testConnection();
      logger.info('数据库连接初始化成功');
    } catch (error) {
      logger.error('数据库连接初始化失败:', error);
    }
  }

  /**
   * 获取账户信息
   */
  getAccountInfo() {
    const totalAssets = this.calculateTotalAssets();
    const totalProfit = totalAssets - this.userAccount.initialBalance;
    const profitPercentage = (totalProfit / this.userAccount.initialBalance) * 100;

    return {
      initialBalance: this.userAccount.initialBalance,
      currentBalance: this.userAccount.currentBalance,
      totalAssets,
      totalProfit,
      profitPercentage
    };
  }

  /**
   * 计算总资产
   */
  async calculateTotalAssets() {
    try {
      const holdings = await this.dbService.getHoldings();
      let stockValue = 0;
      
      for (const holding of holdings) {
        stockValue += holding.shares * holding.current_price;
      }
      
      return this.userAccount.currentBalance + stockValue;
    } catch (error) {
      logger.error('计算总资产失败:', error);
      return this.userAccount.currentBalance;
    }
  }

  /**
   * 获取持仓信息
   */
  async getPortfolio() {
    try {
      const holdings = await this.dbService.getHoldings();
      let totalValue = 0;
      let totalProfit = 0;

      const holdingsWithDetails = [];
      for (const holding of holdings) {
        const currentValue = holding.shares * holding.current_price;
        const profit = holding.profit_loss_amount;
        const profitPercentage = holding.profit_loss_percent;

        const holdingInfo = {
          ticker: holding.stock_code,
          name: holding.stock_name,
          quantity: holding.shares,
          costPrice: holding.cost_price,
          currentPrice: holding.current_price,
          totalCost: holding.shares * holding.cost_price,
          currentValue,
          profit,
          profitPercentage,
          investmentStatus: holding.investment_status
        };

        holdingsWithDetails.push(holdingInfo);
        totalValue += currentValue;
        totalProfit += profit;
      }

      return {
        holdings: holdingsWithDetails,
        totalValue,
        totalProfit
      };
    } catch (error) {
      logger.error('获取持仓信息失败:', error);
      return {
        holdings: [],
        totalValue: 0,
        totalProfit: 0
      };
    }
  }

  /**
   * 获取特定股票持仓
   */
  async getHolding(ticker) {
    try {
      const holding = await this.dbService.getHolding(ticker);
      if (!holding) {
        return null;
      }

      const currentValue = holding.shares * holding.current_price;
      const profit = holding.profit_loss_amount;
      const profitPercentage = holding.profit_loss_percent;

      return {
        ticker: holding.stock_code,
        name: holding.stock_name,
        quantity: holding.shares,
        costPrice: holding.cost_price,
        currentPrice: holding.current_price,
        totalCost: holding.shares * holding.cost_price,
        currentValue,
        profit,
        profitPercentage,
        investmentStatus: holding.investment_status
      };
    } catch (error) {
      logger.error('获取股票持仓失败:', error);
      return null;
    }
  }

  /**
   * 买入股票
   */
  buyStock(ticker, quantity, price = null) {
    if (!this.stockDataService.isValidTicker(ticker)) {
      throw new Error('股票代码无效');
    }

    if (quantity <= 0) {
      throw new Error('买入数量必须大于0');
    }

    const stockData = this.stockDataService.getLatestStockData(ticker);
    if (!stockData) {
      throw new Error('无法获取股票数据');
    }

    const currentPrice = price || stockData.currentPrice;
    const totalCost = quantity * currentPrice;

    if (totalCost > this.userAccount.currentBalance) {
      throw new Error('余额不足');
    }

    // 更新现金余额
    this.userAccount.currentBalance -= totalCost;

    // 更新持仓
    if (this.userAccount.holdings.has(ticker)) {
      const existingHolding = this.userAccount.holdings.get(ticker);
      const newQuantity = existingHolding.quantity + quantity;
      const newTotalCost = existingHolding.totalCost + totalCost;
      const newCostPrice = newTotalCost / newQuantity;

      this.userAccount.holdings.set(ticker, {
        quantity: newQuantity,
        costPrice: newCostPrice,
        totalCost: newTotalCost
      });
    } else {
      this.userAccount.holdings.set(ticker, {
        quantity,
        costPrice: currentPrice,
        totalCost
      });
    }

    // 记录交易
    const trade = {
      id: this.generateTradeId(),
      ticker,
      type: 'buy',
      quantity,
      price: currentPrice,
      totalAmount: totalCost,
      timestamp: new Date().toISOString()
    };
    this.userAccount.trades.push(trade);

    logger.info(`买入成功: ${ticker} ${quantity}股，价格: ${currentPrice}`);
    return trade;
  }

  /**
   * 卖出股票
   */
  sellStock(ticker, quantity) {
    if (!this.stockDataService.isValidTicker(ticker)) {
      throw new Error('股票代码无效');
    }

    if (quantity <= 0) {
      throw new Error('卖出数量必须大于0');
    }

    const holding = this.userAccount.holdings.get(ticker);
    if (!holding || holding.quantity < quantity) {
      throw new Error('持仓不足');
    }

    const stockData = this.stockDataService.getLatestStockData(ticker);
    if (!stockData) {
      throw new Error('无法获取股票数据');
    }

    const currentPrice = stockData.currentPrice;
    const totalAmount = quantity * currentPrice;

    // 更新现金余额
    this.userAccount.currentBalance += totalAmount;

    // 更新持仓
    const newQuantity = holding.quantity - quantity;
    if (newQuantity === 0) {
      this.userAccount.holdings.delete(ticker);
    } else {
      // 按比例计算剩余成本
      const remainingCost = (holding.totalCost * newQuantity) / holding.quantity;
      this.userAccount.holdings.set(ticker, {
        quantity: newQuantity,
        costPrice: remainingCost / newQuantity,
        totalCost: remainingCost
      });
    }

    // 记录交易
    const trade = {
      id: this.generateTradeId(),
      ticker,
      type: 'sell',
      quantity,
      price: currentPrice,
      totalAmount,
      timestamp: new Date().toISOString()
    };
    this.userAccount.trades.push(trade);

    logger.info(`卖出成功: ${ticker} ${quantity}股，价格: ${currentPrice}`);
    return trade;
  }

  /**
   * 充值
   */
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('充值金额必须大于0');
    }

    this.userAccount.currentBalance += amount;
    this.userAccount.initialBalance += amount;

    logger.info(`充值成功: ${amount}`);
    return this.userAccount.currentBalance;
  }

  /**
   * 获取可买入的最大数量
   */
  getMaxBuyQuantity(ticker) {
    const stockData = this.stockDataService.getLatestStockData(ticker);
    if (!stockData) {
      return 0;
    }

    return Math.floor(this.userAccount.currentBalance / stockData.currentPrice);
  }

  /**
   * 生成交易ID
   */
  generateTradeId() {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取交易历史
   */
  getTradeHistory() {
    return this.userAccount.trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = AccountService; 