# Portfolio API Integration - Local Backend

这个项目现在连接到本地MoneyPot后端服务器，提供真实的股票数据和交易功能。

## 🏗️ **架构概述**

```
Frontend (Vue.js)  ←→  Local Backend (Node.js/Express)  ←→  CSV Stock Data
    ↓                        ↓                              ↓
Portfolio App          API Endpoints                   Real Stock Data
```

## 📁 **文件结构**

```
src/
├── services/
│   ├── api.js              # 本地API服务 (localhost:3000)
│   └── dataService.js      # 数据服务（缓存和转换）
├── composables/
│   └── usePortfolio.js     # Vue 3 组合式API
├── portfolio.vue           # 主组件
└── test-api.js            # API测试文件
```

## 🚀 **核心特性**

### 1. **本地后端集成**
- 连接到 `http://localhost:3000/api`
- 使用真实的欧洲股票数据 (CSV格式)
- 支持持仓管理和交易模拟

### 2. **可用的股票**
后端包含以下5只欧洲股票的真实数据：
- **GLE FP** - Societe Generale (法国兴业银行)
- **KPN NA** - Koninklijke KPN (荷兰皇家KPN)
- **NK FP** - Natixis (法国外贸银行)
- **ROVI SM** - Laboratorios Rovi (西班牙制药公司)
- **AALB NA** - ASML Holding (荷兰半导体设备公司)

## 📡 **API端点**

基础URL: `http://localhost:3000/api`

### **持仓管理**
- `GET /portfolio` - 获取用户持仓信息
- `GET /portfolio/{ticker}` - 获取特定股票持仓

### **市场数据**
- `GET /market` - 获取所有可交易股票
- `GET /market/{ticker}` - 获取特定股票数据
- `GET /market/{ticker}/history` - 获取股票历史数据

### **交易功能**
- `POST /trade` - 执行买卖交易
- `GET /trade/history` - 获取交易历史

### **账户管理**
- `GET /account` - 获取账户信息
- `POST /account/add-funds` - 充值
- `GET /account/balance` - 获取余额

## 🔧 **设置步骤**

### 1. **启动后端服务器**

```bash
# 进入后端目录
cd /Users/azumichen/Library/CloudStorage/OneDrive-Personal/work/js/moneypot-backend/backEnd

# 安装依赖
npm install

# 启动服务器
node index.js
```

服务器将在 `http://localhost:3000` 启动

### 2. **启动前端应用**

```bash
# 进入项目目录
cd /Users/azumichen/Library/CloudStorage/OneDrive-Personal/work/js/portfolio

# 启动开发服务器
npm run dev
```

### 3. **验证连接**

在浏览器控制台中运行：
```javascript
// 测试API连接
fetch('http://localhost:3000/api/portfolio')
  .then(r => r.json())
  .then(console.log);
```

## 💻 **使用方法**

### **方法1：使用组合式API（推荐）**

```vue
<script>
import { usePortfolio } from './composables/usePortfolio.js'

export default {
  setup() {
    const {
      // 响应式数据
      loading,
      error,
      userInfo,
      portfolio,
      availableStocks,
      
      // 计算属性
      totalAssets,
      holdingsValue,
      todayPnL,
      
      // 方法
      executeTrade,
      getStockHistory,
      refreshData
    } = usePortfolio();
    
    return {
      loading,
      error,
      userInfo,
      portfolio,
      availableStocks,
      totalAssets,
      holdingsValue,
      todayPnL,
      executeTrade,
      getStockHistory,
      refreshData
    };
  }
}
</script>
```

### **方法2：直接使用API服务**

```javascript
import apiService from './services/api.js'
import dataService from './services/dataService.js'

// 获取持仓信息
const portfolio = await dataService.getPortfolio();

// 执行交易
const tradeResult = await dataService.executeTrade({
  ticker: 'GLE FP',
  type: 'buy',
  quantity: 100,
  price: 31.25
});

// 获取市场数据
const marketStocks = await dataService.getAvailableStocks();
```

## � **数据格式**

### **持仓数据格式**
```json
{
  "holdings": [
    {
      "ticker": "GLE FP",
      "name": "Societe Generale",
      "quantity": 100,
      "costPrice": 23.5,
      "currentPrice": 31.25,
      "totalCost": 2350,
      "currentValue": 3125,
      "profit": 775,
      "profitPercentage": 32.98
    }
  ],
  "totalValue": 5538.2,
  "totalProfit": 698.2
}
```

### **市场数据格式**
```json
{
  "stocks": [
    {
      "ticker": "GLE FP",
      "name": "Societe Generale",
      "currentPrice": 31.25,
      "high": 31.415,
      "low": 31.09,
      "open": 31.185,
      "volume": 3855468,
      "change": 0.195,
      "changePercentage": 0.628
    }
  ]
}
```

## 🔄 **实时更新**

应用每30秒自动刷新以下数据：
- 持仓信息和盈亏
- 市场股票价格
- 账户余额

## 🎯 **交易功能**

### **买入股票**
```javascript
await executeTrade({
  ticker: 'GLE FP',
  type: 'buy',
  quantity: 50,
  price: 31.25
});
```

### **卖出股票**
```javascript
await executeTrade({
  ticker: 'GLE FP',
  type: 'sell',
  quantity: 25,
  price: 31.50
});
```

## 🐛 **调试指南**

### **检查后端状态**
```bash
curl http://localhost:3000/api/portfolio
```

### **查看后端日志**
后端服务器会在控制台显示详细的日志信息。

### **前端调试**
```javascript
// 在浏览器控制台中
import dataService from './services/dataService.js'

// 查看缓存状态
console.log(dataService.cache);

// 清除缓存
dataService.clearCache();
```

## ⚠️ **注意事项**

1. **后端依赖**：前端应用需要后端服务器运行在 `localhost:3000`
2. **CORS设置**：后端已配置CORS允许前端访问
3. **数据持久性**：当前版本的交易数据在服务器重启后会重置
4. **股票数据**：使用的是真实的欧洲股票历史数据，但价格更新是模拟的

## 🔧 **自定义配置**

### **修改API基础URL**
在 `src/services/api.js` 中：
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### **调整缓存时间**
在 `src/services/dataService.js` 中：
```javascript
this.cacheTimeout = 5 * 60 * 1000; // 5分钟
```

### **修改实时更新间隔**
在 `src/composables/usePortfolio.js` 中：
```javascript
startRealTimeUpdates(30000); // 30秒间隔
```

## � **技术支持**

如果遇到问题：

1. **检查后端是否运行**：访问 `http://localhost:3000/hello`
2. **查看API文档**：访问 `http://localhost:3000/api-doc`
3. **检查浏览器控制台**：查看网络请求和错误信息
4. **查看后端日志**：检查服务器终端的输出

---

现在您的股票交易应用已经完全集成了本地后端，可以处理真实的股票数据和交易！🎉
