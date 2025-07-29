const Controller = require('./Controller');
const logger = require('../logger');
const AccountService = require('../services/AccountService');
const StockDataService = require('../services/StockDataService');

class StockController extends Controller {
  constructor() {
    super();
    this.accountService = new AccountService();
    this.stockDataService = new StockDataService();
  }

  /**
   * 获取持仓信息
   */
  static async getPortfolio(request, response) {
    try {
      logger.info('获取持仓信息');
      
      const accountService = new AccountService();
      const portfolio = accountService.getPortfolio();
      
      Controller.sendResponse(response, portfolio);
    } catch (error) {
      logger.error('获取持仓信息失败:', error);
      Controller.sendError(response, {
        code: 500,
        error: '获取持仓信息失败'
      });
    }
  }

  /**
   * 获取特定股票持仓
   */
  static async getHolding(request, response) {
    try {
      const { ticker } = request.params;
      logger.info(`获取股票持仓: ${ticker}`);
      
      const accountService = new AccountService();
      const holding = accountService.getHolding(ticker);
      
      if (!holding) {
        return Controller.sendError(response, {
          code: 404,
          error: '股票未持仓'
        });
      }
      
      Controller.sendResponse(response, holding);
    } catch (error) {
      logger.error('获取股票持仓失败:', error);
      Controller.sendError(response, {
        code: 500,
        error: '获取股票持仓失败'
      });
    }
  }

  /**
   * 获取市场股票列表
   */
  static async getMarketStocks(request, response) {
    try {
      logger.info('获取市场股票列表');
      
      const stockDataService = new StockDataService();
      const stocks = stockDataService.getAllLatestStockData();
      
      Controller.sendResponse(response, { stocks });
    } catch (error) {
      logger.error('获取市场股票列表失败:', error);
      Controller.sendError(response, {
        code: 500,
        error: '获取市场股票列表失败'
      });
    }
  }

  /**
   * 获取特定股票市场数据
   */
  static async getStockData(request, response) {
    try {
      const { ticker } = request.params;
      logger.info(`获取股票数据: ${ticker}`);
      
      const stockDataService = new StockDataService();
      const stockData = stockDataService.getLatestStockData(ticker);
      
      if (!stockData) {
        return Controller.sendError(response, {
          code: 404,
          error: '股票不存在'
        });
      }
      
      Controller.sendResponse(response, stockData);
    } catch (error) {
      logger.error('获取股票数据失败:', error);
      Controller.sendError(response, {
        code: 500,
        error: '获取股票数据失败'
      });
    }
  }

  /**
   * 买入股票
   */
  static async buyStock(request, response) {
    try {
      const { ticker, quantity } = request.body;
      logger.info(`买入股票: ${ticker} ${quantity}股`);
      
      if (!ticker || !quantity) {
        return Controller.sendError(response, {
          code: 400,
          error: '缺少必要参数'
        });
      }
      
      const accountService = new AccountService();
      const trade = accountService.buyStock(ticker, quantity);
      
      Controller.sendResponse(response, {
        message: '买入成功',
        trade
      });
    } catch (error) {
      logger.error('买入股票失败:', error);
      Controller.sendError(response, {
        code: 400,
        error: error.message || '买入失败'
      });
    }
  }

  /**
   * 卖出股票
   */
  static async sellStock(request, response) {
    try {
      const { ticker, quantity } = request.body;
      logger.info(`卖出股票: ${ticker} ${quantity}股`);
      
      if (!ticker || !quantity) {
        return Controller.sendError(response, {
          code: 400,
          error: '缺少必要参数'
        });
      }
      
      const accountService = new AccountService();
      const trade = accountService.sellStock(ticker, quantity);
      
      Controller.sendResponse(response, {
        message: '卖出成功',
        trade
      });
    } catch (error) {
      logger.error('卖出股票失败:', error);
      Controller.sendError(response, {
        code: 400,
        error: error.message || '卖出失败'
      });
    }
  }

  /**
   * 获取账户信息
   */
  static async getAccount(request, response) {
    try {
      logger.info('获取账户信息');
      
      const accountService = new AccountService();
      const accountInfo = accountService.getAccountInfo();
      
      Controller.sendResponse(response, accountInfo);
    } catch (error) {
      logger.error('获取账户信息失败:', error);
      Controller.sendError(response, {
        code: 500,
        error: '获取账户信息失败'
      });
    }
  }

  /**
   * 充值
   */
  static async deposit(request, response) {
    try {
      const { amount } = request.body;
      logger.info(`充值: ${amount}`);
      
      if (!amount || amount <= 0) {
        return Controller.sendError(response, {
          code: 400,
          error: '充值金额必须大于0'
        });
      }
      
      const accountService = new AccountService();
      const newBalance = accountService.deposit(amount);
      
      Controller.sendResponse(response, {
        message: '充值成功',
        newBalance
      });
    } catch (error) {
      logger.error('充值失败:', error);
      Controller.sendError(response, {
        code: 400,
        error: error.message || '充值失败'
      });
    }
  }

  /**
   * 获取可买入的最大数量
   */
  static async getMaxBuyQuantity(request, response) {
    try {
      const { ticker } = request.params;
      logger.info(`获取最大买入数量: ${ticker}`);
      
      const accountService = new AccountService();
      const maxQuantity = accountService.getMaxBuyQuantity(ticker);
      
      Controller.sendResponse(response, {
        ticker,
        maxQuantity,
        currentBalance: accountService.userAccount.currentBalance
      });
    } catch (error) {
      logger.error('获取最大买入数量失败:', error);
      Controller.sendError(response, {
        code: 500,
        error: '获取最大买入数量失败'
      });
    }
  }
}

module.exports = StockController; 