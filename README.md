# MoneyPot - 股票管理工具

## 📋 项目简介

MoneyPot 是一个完整的股票投资组合管理系统，提供四个主要功能界面：持仓管理、股票市场、交易操作和个人账户。系统连接到真实的PostgreSQL数据库，支持实时股票数据查询和投资组合管理。

## 🎯 主要功能

### 📊 持仓管理 (Holdings)
- 查看所有持仓股票
- 实时盈亏计算
- 投资状态跟踪
- 持仓详情分析

### 📈 股票市场 (Stocks)
- 实时股票价格数据
- 50只欧洲股票覆盖
- 历史价格走势
- 市场数据分析

### 💰 交易操作 (Trading)
- 买入股票功能
- 卖出股票功能
- 最大可买入数量计算
- 交易记录管理

### 👤 个人账户 (Account)
- 账户余额管理
- 总资产统计
- 投资收益分析
- 充值功能

## 🚀 快速开始

### 环境要求
- Node.js (版本 14 或更高)
- npm 或 yarn
- PostgreSQL 数据库

### 安装和启动

1. **克隆项目**
```bash
git clone <repository-url>
cd MoneyPot
```

2. **安装后端依赖**
```bash
cd backEnd
npm install
```

3. **配置环境变量**
创建 `config.env` 文件并配置数据库连接信息：
```
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_EXTERNAL_URL=postgresql://user:password@host:port/database
```

4. **启动后端服务**
```bash
node index.js
```

5. **访问应用**
- API文档: http://localhost:3000/api-doc/
- 健康检查: http://localhost:3000/hello

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

## 🔧 技术架构

### 后端技术栈
- **框架**: Express.js
- **数据库**: PostgreSQL
- **ORM**: node-postgres (pg)
- **API文档**: Swagger UI
- **日志**: Winston
- **环境配置**: dotenv

### 项目结构
```
MoneyPot/
├── backEnd/                 # 后端API服务
│   ├── controllers/         # 控制器层
│   ├── services/           # 服务层
│   ├── api/               # API规范
│   ├── config.env         # 环境配置
│   └── index.js           # 应用入口
├── config.env             # 根目录配置
└── README.md              # 项目文档
```

## 📚 API接口

### 持仓管理
- `GET /api/portfolio` - 获取所有持仓
- `GET /api/portfolio/:ticker` - 获取特定股票持仓

### 市场数据
- `GET /api/market` - 获取股票列表
- `GET /api/market/:ticker` - 获取股票数据
- `GET /api/market/:ticker/max-buy` - 获取最大可买入数量

### 交易操作
- `POST /api/trade/buy` - 买入股票
- `POST /api/trade/sell` - 卖出股票

### 账户管理
- `GET /api/account` - 获取账户信息
- `POST /api/account/deposit` - 充值

## 🧪 测试

### 测试数据库连接
```bash
cd backEnd
node test-database.js
```

### 测试API端点
```bash
# 获取持仓信息
curl -X GET http://localhost:3000/api/portfolio

# 获取账户信息
curl -X GET http://localhost:3000/api/account

# 买入股票
curl -X POST http://localhost:3000/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AALB NA","quantity":10}'
```

## 📈 数据示例

### 持仓数据示例
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
  "totalValue": 1287131.2,
  "totalProfit": 0
}
```

### 账户信息示例
```json
{
  "initialBalance": 100000,
  "currentBalance": 100000,
  "totalAssets": 1387131.2,
  "totalProfit": 1287131.2,
  "profitPercentage": 1287.1312
}
```

## 🔍 故障排除

1. **数据库连接失败**
   - 检查 `config.env` 中的连接信息
   - 确认数据库服务正在运行
   - 验证网络连接

2. **API返回错误**
   - 检查数据库表是否存在
   - 确认表结构是否正确
   - 查看服务器日志

3. **端口被占用**
   - 修改 `config.js` 中的端口配置
   - 检查是否有其他服务占用端口

## 🔐 安全注意事项

- 确保环境变量文件不被提交到版本控制
- 在生产环境中使用强密码
- 启用SSL连接
- 定期备份数据库
- 监控API访问日志

## 📞 技术支持

如有问题，请检查：
1. Node.js 版本是否符合要求
2. 所有依赖是否正确安装
3. 数据库连接是否正常
4. 数据库表结构是否正确

## 📄 许可证

本项目采用 MIT 许可证。

---

**注意**: MoneyPot 是一个生产就绪的股票管理系统，所有数据都存储在PostgreSQL数据库中，支持真实的股票投资组合管理。