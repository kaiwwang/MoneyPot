const Controller = require('./Controller');
const logger = require('../logger');
const AccountService = require('../services/AccountService');
const StockDataService = require('../services/StockDataService');

// 创建全局的AccountService实例
const globalAccountService = new AccountService();
const globalStockDataService = new StockDataService();

class StockController extends Controller {

  /**
   * 获取持仓信息
   */
  static async getPortfolio(request, response) {
    try {
      logger.info('获取持仓信息');
      
      const portfolio = await globalAccountService.getPortfolio();
      
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
      
      const holding = await globalAccountService.getHolding(ticker);
      
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
      
      const stocks = await globalStockDataService.getAllLatestStockData();
      
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
      
      const stockData = await globalStockDataService.getLatestStockData(ticker);
      
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
      
      const trade = await globalAccountService.buyStock(ticker, quantity);
      
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
      
      const trade = await globalAccountService.sellStock(ticker, quantity);
      
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
      
      const accountInfo = await globalAccountService.getAccountInfo();
      
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
      logger.info(`账户充值: ${amount}`);
      
      if (!amount || amount <= 0) {
        return Controller.sendError(response, {
          code: 400,
          error: '充值金额必须大于0'
        });
      }
      
      globalAccountService.deposit(amount);
      
      Controller.sendResponse(response, {
        message: '充值成功',
        newBalance: globalAccountService.userAccount.currentBalance
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
   * 获取最大买入数量
   */
  static async getMaxBuyQuantity(request, response) {
    try {
      const { ticker } = request.params;
      logger.info(`获取最大买入数量: ${ticker}`);
      
      const maxQuantity = await globalAccountService.getMaxBuyQuantity(ticker);
      
      Controller.sendResponse(response, {
        ticker,
        maxQuantity,
        currentBalance: globalAccountService.userAccount.currentBalance
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