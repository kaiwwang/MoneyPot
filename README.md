# MoneyPot - 股票投资组合管理系统

## 📋 项目简介

MoneyPot 是一个完整的股票投资组合管理系统，提供真实的股票投资组合管理功能。系统包含前端Vue.js界面和后端Express.js API，连接到PostgreSQL数据库，支持持仓管理、市场数据查询、交易操作和账户管理等功能。

## 🚀 功能特性

- **持仓管理**: 实时查看和管理股票持仓
- **市场数据**: 获取实时股票价格和市场信息
- **交易功能**: 支持买入和卖出股票操作
- **账户管理**: 资金余额管理和充值功能
- **交易历史**: 完整的交易记录查询
- **数据可视化**: 资产走势图和投资组合饼图
- **响应式设计**: 支持桌面和移动设备

## 🛠️ 技术栈

### 前端
- **框架**: Vue.js 3
- **构建工具**: Vite
- **图表库**: ECharts
- **样式**: CSS3 + 响应式设计

### 后端
- **框架**: Express.js
- **数据库**: PostgreSQL
- **数据库驱动**: pg (node-postgres)
- **API文档**: Swagger UI
- **日志系统**: Winston

## 📦 安装指南

### 1. 环境要求

- Node.js (版本 16 或更高)
- npm 或 yarn
- PostgreSQL 数据库

### 2. 数据库安装

#### macOS (使用 Homebrew)
```bash
# 安装 PostgreSQL
brew install postgresql

# 启动 PostgreSQL 服务
brew services start postgresql

# 创建数据库用户（可选，如果使用默认用户）
createuser -s postgres

# 创建数据库
createdb moneypot_db
```

#### Ubuntu/Debian
```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动 PostgreSQL 服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库用户和数据库
CREATE USER your_username WITH PASSWORD 'your_password';
CREATE DATABASE moneypot_db OWNER your_username;
GRANT ALL PRIVILEGES ON DATABASE moneypot_db TO your_username;
\q
```

#### Windows
1. 下载并安装 [PostgreSQL](https://www.postgresql.org/download/windows/)
2. 安装时设置密码
3. 使用 pgAdmin 或命令行创建数据库 `moneypot_db`

### 3. 数据库初始化

```bash
# 导入数据库结构和数据
psql -U your_username -d moneypot_db -f moneypot_db.sql
```

### 4. 配置数据库连接

#### 修改 config.env 文件
```bash
# 将 your_username 替换为您的数据库用户名
DB_LOCAL_URL=postgresql://your_username:your_password@localhost:5432/moneypot_db
```

#### 修改 backEnd/services/DatabaseService.js
```javascript
// 第8行，将 'walker' 替换为您的数据库用户名
const connectionString = process.env.DB_LOCAL_URL || 'postgresql://your_username:@localhost:5432/moneypot_db';
```

### 5. 安装项目依赖

```bash
# 克隆项目
git clone <repository-url>
cd MoneyPot

# 安装后端依赖
cd backEnd
npm install

# 安装前端依赖
cd ../frontEnd
npm install
```

## 🚀 启动项目

### 1. 启动后端服务器

```bash
cd backEnd
node index.js
```

后端服务器将在 `http://localhost:3000` 启动

### 2. 启动前端开发服务器

```bash
cd frontEnd
npm run dev
```

前端应用将在 `http://localhost:5173` 启动（端口可能不同）

### 3. 访问应用

- **前端应用**: http://localhost:5173
- **API文档**: http://localhost:3000/api-doc/

## 📊 数据库结构

### holdings 表 (持仓信息)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| stock_code | character varying(20) | 股票代码 |
| stock_name | character varying(100) | 股票名称 |
| shares | integer | 持股数量 |
| cost_price | numeric(10,2) | 成本价 |
| current_price | numeric(10,2) | 当前价格 |
| profit_loss_amount | numeric(12,2) | 盈亏金额 |
| profit_loss_percent | numeric(5,2) | 盈亏百分比 |
| investment_status | character varying(10) | 投资状态 |

### stocks 表 (股票市场数据)
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

### trade_records 表 (交易记录)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| stock_code | text | 股票代码 |
| stock_name | text | 股票名称 |
| trade_date | timestamp | 交易时间 |
| trade_type | text | 交易类型 (buy/sell) |
| trade_volume | integer | 交易数量 |
| trade_price | numeric(10,2) | 交易价格 |
| trade_amount | numeric(12,2) | 交易总额 |
| total_holdings | integer | 总持仓 |
| avg_cost | numeric(10,2) | 平均成本 |

## 🔧 API 接口

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

### 交易历史
- `GET /api/trades` - 获取交易历史

## 🧪 测试

### 测试数据库连接
```bash
cd backEnd
node test-database.js
```

### 测试时间格式处理
```bash
cd backEnd
node test-time-format.js
```

## 📁 项目结构

```
MoneyPot/
├── backEnd/                    # 后端代码
│   ├── api/                   # API规范文档
│   ├── controllers/           # 控制器
│   ├── services/              # 服务层
│   ├── utils/                 # 工具函数
│   ├── expressServer.js       # Express服务器配置
│   ├── index.js               # 应用入口
│   └── package.json           # 后端依赖
├── frontEnd/                   # 前端代码
│   ├── src/                   # 源代码
│   │   ├── components/        # Vue组件
│   │   ├── services/          # API服务
│   │   ├── composables/       # Vue组合式函数
│   │   └── portfolio.vue      # 主页面
│   ├── public/                # 静态资源
│   └── package.json           # 前端依赖
├── config.env                  # 环境变量配置
├── moneypot_db.sql            # 数据库结构和数据
└── README.md                  # 项目说明
```

## 🔍 故障排除

### 数据库连接问题
1. 确保 PostgreSQL 服务正在运行
2. 检查 `config.env` 中的数据库连接字符串
3. 确认数据库用户名和密码正确
4. 验证数据库 `moneypot_db` 已创建

### 端口占用问题
如果端口 3000 被占用，可以修改 `backEnd/index.js` 中的端口号

### 前端图表不显示
1. 检查浏览器控制台是否有错误
2. 确认后端API正常响应
3. 检查网络连接

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 完整的股票投资组合管理功能
- 实时数据更新
- 响应式设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 请确保在修改数据库配置时，将 `your_username` 和 `your_password` 替换为您的实际数据库用户名和密码。 