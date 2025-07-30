const DatabaseService = require('./services/DatabaseService');

async function testTimeFormat() {
  const dbService = new DatabaseService();
  
  try {
    console.log('测试时间格式处理...');
    
    // 测试获取交易历史
    const trades = await dbService.getTrades();
    console.log('获取到的交易历史:');
    trades.forEach((trade, index) => {
      console.log(`${index + 1}. ${trade.stock_code} - ${trade.trade_date} - ${trade.trade_type}`);
    });
    
    // 测试插入新交易记录
    const testTrade = {
      ticker: 'TEST BB',
      stockName: 'Test Stock',
      timestamp: new Date().toISOString().replace('T', ' ').replace('Z', ''),
      type: 'buy',
      quantity: 100,
      price: 50.00,
      totalAmount: 5000.00,
      totalHoldings: 100,
      avgCost: 50.00
    };
    
    console.log('\n插入测试交易记录...');
    const result = await dbService.insertTrade(testTrade);
    console.log('插入结果:', result);
    
    // 再次获取交易历史验证
    const updatedTrades = await dbService.getTrades();
    console.log('\n更新后的交易历史:');
    updatedTrades.forEach((trade, index) => {
      console.log(`${index + 1}. ${trade.stock_code} - ${trade.trade_date} - ${trade.trade_type}`);
    });
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await dbService.close();
  }
}

testTimeFormat(); 