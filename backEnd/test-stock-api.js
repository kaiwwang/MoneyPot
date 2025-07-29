const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testStockAPI() {
  console.log('🚀 开始测试股票管理API...\n');

  try {
    // 1. 测试获取账户信息
    console.log('📊 1. 测试获取账户信息');
    const accountResponse = await axios.get(`${BASE_URL}/api/account`);
    console.log('✅ 账户信息:');
    console.log(JSON.stringify(accountResponse.data, null, 2));
    console.log('');

    // 2. 测试获取持仓信息
    console.log('📈 2. 测试获取持仓信息');
    const portfolioResponse = await axios.get(`${BASE_URL}/api/portfolio`);
    console.log('✅ 持仓信息:');
    console.log(JSON.stringify(portfolioResponse.data, null, 2));
    console.log('');

    // 3. 测试获取市场股票列表
    console.log('🏪 3. 测试获取市场股票列表');
    const marketResponse = await axios.get(`${BASE_URL}/api/market`);
    console.log('✅ 市场股票列表:');
    console.log(JSON.stringify(marketResponse.data, null, 2));
    console.log('');

    // 4. 测试获取特定股票数据
    console.log('📊 4. 测试获取特定股票数据 (GLE FP)');
    const stockDataResponse = await axios.get(`${BASE_URL}/api/market/GLE FP`);
    console.log('✅ 股票数据:');
    console.log(JSON.stringify(stockDataResponse.data, null, 2));
    console.log('');

    // 5. 测试获取最大买入数量
    console.log('💰 5. 测试获取最大买入数量 (GLE FP)');
    const maxBuyResponse = await axios.get(`${BASE_URL}/api/market/GLE FP/max-buy`);
    console.log('✅ 最大买入数量:');
    console.log(JSON.stringify(maxBuyResponse.data, null, 2));
    console.log('');

    // 6. 测试买入股票
    console.log('🛒 6. 测试买入股票 (GLE FP, 10股)');
    const buyResponse = await axios.post(`${BASE_URL}/api/trade/buy`, {
      ticker: 'GLE FP',
      quantity: 10
    });
    console.log('✅ 买入结果:');
    console.log(JSON.stringify(buyResponse.data, null, 2));
    console.log('');

    // 7. 测试卖出股票
    console.log('📤 7. 测试卖出股票 (GLE FP, 5股)');
    const sellResponse = await axios.post(`${BASE_URL}/api/trade/sell`, {
      ticker: 'GLE FP',
      quantity: 5
    });
    console.log('✅ 卖出结果:');
    console.log(JSON.stringify(sellResponse.data, null, 2));
    console.log('');

    // 8. 测试充值
    console.log('💳 8. 测试充值 (10000)');
    const depositResponse = await axios.post(`${BASE_URL}/api/account/deposit`, {
      amount: 10000
    });
    console.log('✅ 充值结果:');
    console.log(JSON.stringify(depositResponse.data, null, 2));
    console.log('');

    // 9. 再次获取账户信息查看变化
    console.log('📊 9. 再次获取账户信息查看变化');
    const accountResponse2 = await axios.get(`${BASE_URL}/api/account`);
    console.log('✅ 更新后的账户信息:');
    console.log(JSON.stringify(accountResponse2.data, null, 2));
    console.log('');

    console.log('\n🎉 所有测试完成！');
    console.log('\n📖 API接口说明:');
    console.log('1. 持仓管理:');
    console.log('   - GET /api/portfolio - 获取所有持仓');
    console.log('   - GET /api/portfolio/:ticker - 获取特定股票持仓');
    console.log('2. 市场数据:');
    console.log('   - GET /api/market - 获取所有股票');
    console.log('   - GET /api/market/:ticker - 获取特定股票数据');
    console.log('   - GET /api/market/:ticker/max-buy - 获取最大买入数量');
    console.log('3. 交易操作:');
    console.log('   - POST /api/trade/buy - 买入股票');
    console.log('   - POST /api/trade/sell - 卖出股票');
    console.log('4. 账户管理:');
    console.log('   - GET /api/account - 获取账户信息');
    console.log('   - POST /api/account/deposit - 充值');
    console.log('5. Swagger UI: 访问 http://localhost:3000/api-doc/ 查看API文档');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testStockAPI();
}

module.exports = { testStockAPI }; 