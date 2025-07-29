const DatabaseService = require('./services/DatabaseService');
const StockDataService = require('./services/StockDataService');
const AccountService = require('./services/AccountService');

async function testDatabase() {
  console.log('开始测试数据库连接...');
  
  try {
    // 测试数据库连接
    const dbService = new DatabaseService();
    const isConnected = await dbService.testConnection();
    
    if (!isConnected) {
      console.error('数据库连接失败');
      return;
    }
    
    console.log('✅ 数据库连接成功');
    
    // 测试获取股票数据
    console.log('\n测试获取股票数据...');
    const stockDataService = new StockDataService();
    const tickers = await stockDataService.getAllTickers();
    console.log(`✅ 获取到 ${tickers.length} 只股票:`, tickers.slice(0, 5));
    
    if (tickers.length > 0) {
      const firstTicker = tickers[0];
      const stockData = await stockDataService.getLatestStockData(firstTicker);
      console.log(`✅ 获取股票 ${firstTicker} 数据:`, stockData);
    }
    
    // 测试获取持仓数据
    console.log('\n测试获取持仓数据...');
    const accountService = new AccountService();
    const portfolio = await accountService.getPortfolio();
    console.log(`✅ 获取持仓数据:`, portfolio);
    
    // 测试获取账户信息
    console.log('\n测试获取账户信息...');
    const accountInfo = await accountService.getAccountInfo();
    console.log(`✅ 获取账户信息:`, accountInfo);
    
    console.log('\n🎉 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 