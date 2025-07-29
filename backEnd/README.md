# 股票管理API系统

## 📋 项目简介

这是一个完整的股票管理API系统，提供真实的股票投资组合管理功能。系统连接到PostgreSQL数据库，支持持仓管理、市场数据查询、交易操作和账户管理等功能。

## 🚀 快速启动

### 环境要求
- Node.js (版本 14 或更高)
- npm 或 yarn
- PostgreSQL 数据库

### 安装依赖
```bash
npm install
```

### 环境配置
确保 `config.env` 文件包含正确的数据库连接信息：
```
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_EXTERNAL_URL=postgresql://user:password@host:port/database
```

### 启动服务器
```bash
node index.js
```

### 访问API文档
打开浏览器访问：http://localhost:3000/api-doc/

## 📚 API接口说明

### 持仓管理
- `GET /api/portfolio` - 获取所有持仓信息
- `GET /api/portfolio/:ticker` - 获取特定股票持仓

### 市场数据
- `GET /api/market` - 获取所有可交易股票列表
- `GET /api/market/:ticker` - 获取特定股票市场数据
- `GET /api/market/:ticker/max-buy` - 获取最大可买入数量

### 交易操作
- `POST /api/trade/buy` - 买入股票
- `POST /api/trade/sell` - 卖出股票

### 账户管理
- `GET /api/account` - 获取账户信息
- `POST /api/account/deposit` - 充值

## 🧪 测试API

### 测试数据库连接
```bash
node test-database.js
```

### 测试API端点
```bash
# 获取持仓信息
curl -X GET http://localhost:3000/api/portfolio

# 获取账户信息
curl -X GET http://localhost:3000/api/account

# 获取市场股票列表
curl -X GET http://localhost:3000/api/market

# 买入股票
curl -X POST http://localhost:3000/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AALB NA","quantity":10}'

# 卖出股票
curl -X POST http://localhost:3000/api/trade/sell \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AALB NA","quantity":5}'
```

## 📊 数据库结构

### holdings表 (持仓信息)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| stock_code | character varying | 股票代码 |
| stock_name | character varying | 股票名称 |
| shares | integer | 持股数量 |
| cost_price | numeric | 成本价 |
| current_price | numeric | 当前价格 |
| profit_loss_amount | numeric | 盈亏金额 |
| profit_loss_percent | numeric | 盈亏百分比 |
| investment_status | character varying | 投资状态 |

### stocks表 (股票市场数据)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| ticker | text | 股票代码 |
| date | date | 日期 |
| close | double precision | 收盘价 |
| raw_close | double precision | 原始收盘价 |
| high | double precision | 最高价 |
| low | double precision | 最低价 |
| open | double precision | 开盘价 |
| volume | double precision | 成交量 |

## 🔧 技术栈

- **后端框架**: Express.js
- **数据库**: PostgreSQL
- **数据库驱动**: pg (node-postgres)
- **API文档**: Swagger UI
- **数据格式**: JSON
- **日志系统**: Winston
- **环境配置**: dotenv

## 📁 项目结构

```
├── api/
│   └── openapi.yaml          # API规范文档
├── controllers/
│   ├── Controller.js         # 基础控制器
│   ├── StockController.js    # 股票管理控制器
│   └── index.js             # 控制器导出
├── services/
│   ├── DatabaseService.js    # 数据库服务
│   ├── StockDataService.js   # 股票数据服务
│   ├── AccountService.js     # 账户服务
│   └── index.js             # 服务导出
├── config.env               # 环境变量配置
├── expressServer.js         # Express服务器配置
├── index.js                 # 应用入口
├── package.json             # 项目配置
└── test-database.js        # 数据库测试脚本
```

## 🌐 在线访问

启动服务器后，可以通过以下地址访问：

- **API文档**: http://localhost:3000/api-doc/
- **API根路径**: http://localhost:3000/
- **健康检查**: http://localhost:3000/hello

## 📝 使用示例

### 获取持仓信息
```bash
curl -X GET http://localhost:3000/api/portfolio
```

响应示例：
```json
{
  "holdings": [
    {
      "ticker": "AALB NA",
      "name": "ASML Holding",
      "quantity": 100,
      "costPrice": "34.30",
      "currentPrice": "34.30",
      "totalCost": 3430,
      "currentValue": 3430,
      "profit": 0,
      "profitPercentage": 0,
      "investmentStatus": "HOLDING"
    }
  ],
  "totalValue": 3430,
  "totalProfit": 0
}
```

### 买入股票
```bash
curl -X POST http://localhost:3000/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AALB NA","quantity":10}'
```

### 获取账户信息
```bash
curl -X GET http://localhost:3000/api/account
```

## 🔍 故障排除

1. **数据库连接失败**: 检查 `config.env` 中的数据库连接信息
2. **端口被占用**: 修改 `config.js` 中的 `URL_PORT` 值
3. **依赖安装失败**: 删除 `node_modules` 文件夹，重新运行 `npm install`
4. **API返回错误**: 检查数据库表是否存在且包含数据

## 📞 技术支持

如有问题，请检查：
1. Node.js 版本是否正确
2. 所有依赖是否安装完成
3. 数据库连接是否正常
4. 数据库表结构是否正确

## 🔐 安全注意事项

- 确保 `config.env` 文件不被提交到版本控制系统
- 在生产环境中使用强密码和SSL连接
- 定期备份数据库数据
- 监控API访问日志

---

**注意**: 这是一个生产就绪的股票管理系统，所有数据都存储在PostgreSQL数据库中。
