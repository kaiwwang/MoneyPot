const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 开始测试API接口...\n');

  try {
    // 测试GET接口
    console.log('📡 测试GET接口 /api/test');
    const getResponse = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ GET接口响应:');
    console.log(JSON.stringify(getResponse.data, null, 2));
    console.log('');

    // 测试POST接口
    console.log('📡 测试POST接口 /api/test/post');
    const postData = {
      name: '测试用户',
      message: '这是一条测试消息',
      data: {
        key: 'value',
        number: 123,
        array: [1, 2, 3]
      }
    };
    
    const postResponse = await axios.post(`${BASE_URL}/api/test/post`, postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST接口响应:');
    console.log(JSON.stringify(postResponse.data, null, 2));
    console.log('');

    console.log('\n🎉 所有测试完成！');
    console.log('\n📖 使用说明:');
    console.log('1. GET接口: curl -X GET http://localhost:3000/api/test');
    console.log('2. POST接口: curl -X POST http://localhost:3000/api/test/post -H "Content-Type: application/json" -d \'{"name":"测试","message":"消息"}\'');
    console.log('3. Swagger UI: 访问 http://localhost:3000/api-doc/ 查看API文档');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };