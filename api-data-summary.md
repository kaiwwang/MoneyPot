# 📊 API数据完整概览

## 🏦 **账户信息** (`GET /api/account`)
```json
{
  "initialBalance": 100000,      // 初始资金：10万欧元
  "currentBalance": 95160,       // 当前现金余额：9.516万欧元
  "totalAssets": 100698.2,       // 总资产：10.07万欧元
  "totalProfit": 698.2,          // 总盈利：698.2欧元
  "profitPercentage": 0.698      // 盈利率：0.698%
}
```

## 📈 **持仓信息** (`GET /api/portfolio`)

### 总持仓概况
- **总市值**: 5,538.2 欧元
- **总盈利**: 698.2 欧元
- **持仓股票**: 3只

### 具体持仓明细

#### 1. **GLE FP - Societe Generale (法国兴业银行)**
```json
{
  "ticker": "GLE FP",
  "name": "Societe Generale",
  "quantity": 100,               // 持有100股
  "costPrice": 23.5,             // 成本价：23.5欧元/股
  "currentPrice": 31.25,         // 当前价：31.25欧元/股
  "totalCost": 2350,             // 总成本：2,350欧元
  "currentValue": 3125,          // 当前市值：3,125欧元
  "profit": 775,                 // 盈利：775欧元
  "profitPercentage": 32.98      // 盈利率：32.98%
}
```

#### 2. **KPN NA - Koninklijke KPN (荷兰皇家KPN)**
```json
{
  "ticker": "KPN NA",
  "name": "Koninklijke KPN",
  "quantity": 200,               // 持有200股
  "costPrice": 3.2,              // 成本价：3.2欧元/股
  "currentPrice": 3.491,         // 当前价：3.491欧元/股
  "totalCost": 640,              // 总成本：640欧元
  "currentValue": 698.2,         // 当前市值：698.2欧元
  "profit": 58.2,                // 盈利：58.2欧元
  "profitPercentage": 9.09       // 盈利率：9.09%
}
```

#### 3. **AALB NA - ASML Holding (荷兰半导体设备公司)**
```json
{
  "ticker": "AALB NA",
  "name": "ASML Holding",
  "quantity": 50,                // 持有50股
  "costPrice": 37,               // 成本价：37欧元/股
  "currentPrice": 34.3,          // 当前价：34.3欧元/股
  "totalCost": 1850,             // 总成本：1,850欧元
  "currentValue": 1715,          // 当前市值：1,715欧元
  "profit": -135,                // 亏损：135欧元
  "profitPercentage": -7.30      // 亏损率：-7.30%
}
```

## 📊 **市场数据** (`GET /api/market`)

### 可交易股票列表（5只欧洲股票）

#### 1. **GLE FP - Societe Generale** 🇫🇷
```json
{
  "ticker": "GLE FP",
  "name": "Societe Generale",
  "currentPrice": 31.25,         // 当前价格
  "high": 31.415,                // 今日最高价
  "low": 31.09,                  // 今日最低价
  "open": 31.185,                // 今日开盘价
  "volume": 3855468,             // 成交量：385万股
  "change": 0.195,               // 价格变动：+0.195欧元
  "changePercentage": 0.628      // 涨跌幅：+0.628%
}
```

#### 2. **KPN NA - Koninklijke KPN** 🇳🇱
```json
{
  "ticker": "KPN NA",
  "name": "Koninklijke KPN",
  "currentPrice": 3.491,         // 当前价格
  "high": 3.55,                  // 今日最高价
  "low": 3.491,                  // 今日最低价
  "open": 3.55,                  // 今日开盘价
  "volume": 16537984,            // 成交量：1653万股
  "change": -0.063,              // 价格变动：-0.063欧元
  "changePercentage": -1.77      // 涨跌幅：-1.77%
}
```

#### 3. **NK FP - Natixis** 🇫🇷
```json
{
  "ticker": "NK FP",
  "name": "Natixis",
  "currentPrice": 26.7,          // 当前价格
  "high": 26.96,                 // 今日最高价
  "low": 26.48,                  // 今日最低价
  "open": 26.96,                 // 今日开盘价
  "volume": 102804,              // 成交量：10万股
  "change": -0.16,               // 价格变动：-0.16欧元
  "changePercentage": -0.60      // 涨跌幅：-0.60%
}
```

#### 4. **ROVI SM - Laboratorios Rovi** 🇪🇸
```json
{
  "ticker": "ROVI SM",
  "name": "Laboratorios Rovi",
  "currentPrice": 65.55,         // 当前价格
  "high": 66.55,                 // 今日最高价
  "low": 65.5,                   // 今日最低价
  "open": 66,                    // 今日开盘价
  "volume": 98834,               // 成交量：9.8万股
  "change": 0.05,                // 价格变动：+0.05欧元
  "changePercentage": 0.076      // 涨跌幅：+0.076%
}
```

#### 5. **AALB NA - ASML Holding** 🇳🇱
```json
{
  "ticker": "AALB NA",
  "name": "ASML Holding",
  "currentPrice": 34.3,          // 当前价格
  "high": 34.7,                  // 今日最高价
  "low": 34.18,                  // 今日最低价
  "open": 34.42,                 // 今日开盘价
  "volume": 165719,              // 成交量：16.5万股
  "change": -0.10,               // 价格变动：-0.10欧元
  "changePercentage": -0.29      // 涨跌幅：-0.29%
}
```

## 💰 **购买力分析** (`GET /api/market/{ticker}/max-buy`)

基于当前现金余额 **95,160欧元**，各股票最大可买入数量：

| 股票代码 | 公司名称 | 当前价格 | 最大买入量 | 所需资金 |
|---------|----------|----------|-----------|----------|
| **GLE FP** | Societe Generale | 31.25€ | **3,045股** | 95,156€ |
| **KPN NA** | Koninklijke KPN | 3.491€ | **27,258股** | 95,155€ |
| **NK FP** | Natixis | 26.7€ | **3,564股** | 95,159€ |
| **ROVI SM** | Laboratorios Rovi | 65.55€ | **1,451股** | 95,157€ |
| **AALB NA** | ASML Holding | 34.3€ | **2,774股** | 95,149€ |

## 🔄 **交易功能** 

### 可用的交易API端点：
- `POST /api/trade/buy` - 买入股票
- `POST /api/trade/sell` - 卖出股票

### 买入请求示例：
```json
{
  "ticker": "GLE FP",
  "quantity": 10
}
```

### 买入响应示例：
```json
{
  "message": "买入成功",
  "trade": {
    "id": "trade_1753757885575_n7cg4eejg",
    "ticker": "GLE FP",
    "type": "buy",
    "quantity": 10,
    "price": 31.25,
    "totalAmount": 312.5,
    "timestamp": "2025-07-29T02:58:05.575Z"
  }
}
```

## 📋 **完整API端点列表**

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/portfolio` | 获取所有持仓信息 |
| `GET` | `/api/portfolio/{ticker}` | 获取特定股票持仓 |
| `GET` | `/api/market` | 获取所有市场股票数据 |
| `GET` | `/api/market/{ticker}` | 获取特定股票市场数据 |
| `GET` | `/api/market/{ticker}/max-buy` | 获取最大可买入数量 |
| `GET` | `/api/account` | 获取账户信息 |
| `POST` | `/api/trade/buy` | 买入股票 |
| `POST` | `/api/trade/sell` | 卖出股票 |
| `POST` | `/api/account/deposit` | 账户充值 |

## 💡 **数据特点**

1. **真实性**: 使用真实的欧洲股票数据
2. **实时性**: 价格数据会动态更新
3. **完整性**: 包含开高低收、成交量、涨跌幅等完整信息
4. **交互性**: 支持完整的买卖交易功能
5. **安全性**: 有余额检查和持仓验证

## 🎯 **投资组合分析**

- **总投入**: 4,840 欧元
- **当前市值**: 5,538.2 欧元
- **总盈利**: 698.2 欧元 (14.43% 收益率)
- **最佳表现**: GLE FP (+32.98%)
- **最差表现**: AALB NA (-7.30%)
- **现金比例**: 94.5% (现金过多，可考虑增加投资)

这个API提供了一个完整的股票交易模拟环境，包含真实的欧洲股票数据和完整的交易功能！
