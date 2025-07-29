const AccountService = require('./services/AccountService');
const DatabaseService = require('./services/DatabaseService');

async function testBuySell() {
  console.log('开始测试买入卖出功能...');
  
  try {
    const accountService = new AccountService();
    const dbService = new DatabaseService();
    
    // 测试股票代码
    const testTicker = 'AALB NA';
    const testQuantity = 10;
    
    console.log(`\n1. 测试前检查持仓: ${testTicker}`);
    const beforeHolding = await dbService.getHolding(testTicker);
    console.log('买入前持仓:', beforeHolding);
    
    console.log(`\n2. 执行买入操作: ${testTicker} ${testQuantity}股`);
    const buyResult = await accountService.buyStock(testTicker, testQuantity);
    console.log('买入结果:', buyResult);
    
    console.log(`\n3. 买入后检查持仓: ${testTicker}`);
    const afterBuyHolding = await dbService.getHolding(testTicker);
    console.log('买入后持仓:', afterBuyHolding);
    
    console.log(`\n4. 执行卖出操作: ${testTicker} 5股`);
    const sellResult = await accountService.sellStock(testTicker, 5);
    console.log('卖出结果:', sellResult);
    
    console.log(`\n5. 卖出后检查持仓: ${testTicker}`);
    const afterSellHolding = await dbService.getHolding(testTicker);
    console.log('卖出后持仓:', afterSellHolding);
    
    console.log('\n6. 检查账户信息');
    const accountInfo = await accountService.getAccountInfo();
    console.log('账户信息:', accountInfo);
    
    console.log('\n✅ 买入卖出测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testBuySell(); 