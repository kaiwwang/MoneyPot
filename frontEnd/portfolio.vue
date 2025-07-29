<template>
  <div class="stock-trading-app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">股票交易系统</h1>
        <div class="user-info">
          <span class="user-name">{{ userInfo.name }}</span>
          <span class="account-balance">账户余额: ¥{{ userInfo.balance.toLocaleString() }}</span>
        </div>
      </div>
    </header>

    <!-- 标签页导航 -->
    <nav class="tab-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 持仓页面 -->
      <div v-if="activeTab === 'portfolio'" class="portfolio-section">
        <div class="portfolio-summary">
          <div class="summary-card">
            <h3>总资产</h3>
            <div class="amount">¥{{ totalAssets.toLocaleString() }}</div>
            <div class="change" :class="{ positive: totalChange >= 0, negative: totalChange < 0 }">
              {{ totalChange >= 0 ? '+' : '' }}{{ totalChange.toFixed(2) }}%
            </div>
          </div>
          <div class="summary-card">
            <h3>今日盈亏</h3>
            <div class="amount">¥{{ todayPnL.toLocaleString() }}</div>
            <div class="change" :class="{ positive: todayPnL >= 0, negative: todayPnL < 0 }">
              {{ todayPnL >= 0 ? '+' : '' }}¥{{ Math.abs(todayPnL).toLocaleString() }}
            </div>
          </div>
          <div class="summary-card">
            <h3>持仓市值</h3>
            <div class="amount">¥{{ holdingsValue.toLocaleString() }}</div>
          </div>
        </div>

        <!-- 股票列表 -->
        <div class="stock-list">
          <div class="list-header">
            <div class="header-item">股票代码</div>
            <div class="header-item">股票名称</div>
            <div class="header-item">当前价格</div>
            <div class="header-item">涨跌幅</div>
            <div class="header-item">持仓量</div>
            <div class="header-item">市值</div>
            <div class="header-item">盈亏</div>
          </div>
          <div 
            v-for="stock in portfolio" 
            :key="stock.code"
            class="stock-item"
          >
            <div class="stock-code">{{ stock.code }}</div>
            <div class="stock-name">{{ stock.name }}</div>
            <div class="stock-price">¥{{ stock.currentPrice.toFixed(2) }}</div>
            <div class="stock-change" :class="{ positive: stock.changePercent >= 0, negative: stock.changePercent < 0 }">
              {{ stock.changePercent >= 0 ? '+' : '' }}{{ stock.changePercent.toFixed(2) }}%
            </div>
            <div class="stock-shares">{{ stock.shares }}</div>
            <div class="stock-value">¥{{ (stock.currentPrice * stock.shares).toLocaleString() }}</div>
            <div class="stock-pnl" :class="{ positive: stock.pnl >= 0, negative: stock.pnl < 0 }">
              {{ stock.pnl >= 0 ? '+' : '' }}¥{{ stock.pnl.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 买卖股票页面 -->
      <div v-if="activeTab === 'trading'" class="trading-section">
        <div class="trading-form">
          <h3>股票交易</h3>
          <div class="form-group">
            <label>股票代码:</label>
            <input 
              v-model="tradeForm.code" 
              type="text" 
              placeholder="请输入股票代码"
              @input="searchStock"
            />
          </div>
          <div v-if="selectedStock" class="stock-info">
            <h4>{{ selectedStock.name }} ({{ selectedStock.code }})</h4>
            <p>当前价格: ¥{{ selectedStock.price.toFixed(2) }}</p>
            <p class="change" :class="{ positive: selectedStock.change >= 0, negative: selectedStock.change < 0 }">
              {{ selectedStock.change >= 0 ? '+' : '' }}{{ selectedStock.change.toFixed(2) }}%
            </p>
          </div>
          <div class="form-group">
            <label>交易类型:</label>
            <div class="trade-type">
              <button 
                :class="['type-btn', { active: tradeForm.type === 'buy' }]"
                @click="tradeForm.type = 'buy'"
              >
                买入
              </button>
              <button 
                :class="['type-btn', { active: tradeForm.type === 'sell' }]"
                @click="tradeForm.type = 'sell'"
              >
                卖出
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>交易数量:</label>
            <input 
              v-model.number="tradeForm.quantity" 
              type="number" 
              placeholder="请输入交易数量"
            />
          </div>
          <div v-if="selectedStock" class="trade-summary">
            <p>交易金额: ¥{{ (selectedStock.price * tradeForm.quantity).toLocaleString() }}</p>
            <p v-if="tradeForm.type === 'buy'">
              交易后余额: ¥{{ (userInfo.balance - selectedStock.price * tradeForm.quantity).toLocaleString() }}
            </p>
          </div>
          <button 
            class="trade-btn"
            :class="tradeForm.type"
            @click="executeTrade"
            :disabled="!canTrade"
          >
            {{ tradeForm.type === 'buy' ? '买入' : '卖出' }}
          </button>
        </div>

        <!-- 可交易股票列表 -->
        <div class="available-stocks">
          <h3>热门股票</h3>
          <div class="stocks-grid">
            <div 
              v-for="stock in availableStocks" 
              :key="stock.code"
              class="available-stock-item"
              @click="selectStock(stock)"
            >
              <div class="stock-header">
                <span class="code">{{ stock.code }}</span>
                <span class="name">{{ stock.name }}</span>
              </div>
              <div class="stock-price">¥{{ stock.price.toFixed(2) }}</div>
              <div class="stock-change" :class="{ positive: stock.change >= 0, negative: stock.change < 0 }">
                {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 个人用户页面 -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar">{{ userInfo.name.charAt(0) }}</div>
            <div class="user-details">
              <h3>{{ userInfo.name }}</h3>
              <p>用户ID: {{ userInfo.id }}</p>
              <p>注册时间: {{ userInfo.registerDate }}</p>
            </div>
          </div>
          
          <div class="account-info">
            <h4>账户信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>账户余额:</label>
                <span>¥{{ userInfo.balance.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <label>总资产:</label>
                <span>¥{{ totalAssets.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <label>持仓数量:</label>
                <span>{{ portfolio.length }}只</span>
              </div>
              <div class="info-item">
                <label>风险等级:</label>
                <span class="risk-level">{{ userInfo.riskLevel }}</span>
              </div>
            </div>
          </div>

          <div class="trading-history">
            <h4>最近交易记录</h4>
            <div class="history-list">
              <div 
                v-for="record in tradingHistory" 
                :key="record.id"
                class="history-item"
              >
                <div class="record-info">
                  <span class="stock-info">{{ record.stockName }} ({{ record.stockCode }})</span>
                  <span class="trade-type" :class="record.type">{{ record.type === 'buy' ? '买入' : '卖出' }}</span>
                </div>
                <div class="record-details">
                  <span>{{ record.quantity }}股 @ ¥{{ record.price.toFixed(2) }}</span>
                  <span class="date">{{ record.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Portfolio',
  data() {
    return {
      activeTab: 'portfolio',
      tabs: [
        { id: 'portfolio', name: '持仓' },
        { id: 'trading', name: '买卖股票' },
        { id: 'profile', name: '个人中心' }
      ],
      userInfo: {
        id: 'U123456789',
        name: '张三',
        balance: 150000,
        registerDate: '2023-01-15',
        riskLevel: '稳健型'
      },
      portfolio: [
        {
          code: '000001',
          name: '平安银行',
          currentPrice: 12.85,
          changePercent: 2.4,
          shares: 1000,
          costPrice: 12.50,
          pnl: 350
        },
        {
          code: '000002',
          name: '万科A',
          currentPrice: 8.96,
          changePercent: -1.2,
          shares: 2000,
          costPrice: 9.20,
          pnl: -480
        },
        {
          code: '600036',
          name: '招商银行',
          currentPrice: 38.45,
          changePercent: 1.8,
          shares: 500,
          costPrice: 37.80,
          pnl: 325
        },
        {
          code: '000858',
          name: '五粮液',
          currentPrice: 165.50,
          changePercent: -0.5,
          shares: 200,
          costPrice: 168.00,
          pnl: -500
        }
      ],
      availableStocks: [
        { code: '600519', name: '贵州茅台', price: 1680.50, change: 2.3 },
        { code: '000001', name: '平安银行', price: 12.85, change: 2.4 },
        { code: '600036', name: '招商银行', price: 38.45, change: 1.8 },
        { code: '000002', name: '万科A', price: 8.96, change: -1.2 },
        { code: '000858', name: '五粮液', price: 165.50, change: -0.5 },
        { code: '600276', name: '恒瑞医药', price: 45.80, change: 0.8 },
        { code: '002415', name: '海康威视', price: 32.15, change: -0.3 },
        { code: '000568', name: '泸州老窖', price: 185.60, change: 1.5 }
      ],
      tradeForm: {
        code: '',
        type: 'buy',
        quantity: 0
      },
      selectedStock: null,
      tradingHistory: [
        {
          id: 1,
          stockCode: '600036',
          stockName: '招商银行',
          type: 'buy',
          quantity: 500,
          price: 37.80,
          date: '2025-07-27 14:30'
        },
        {
          id: 2,
          stockCode: '000858',
          stockName: '五粮液',
          type: 'buy',
          quantity: 200,
          price: 168.00,
          date: '2025-07-26 10:15'
        },
        {
          id: 3,
          stockCode: '000002',
          stockName: '万科A',
          type: 'sell',
          quantity: 500,
          price: 9.10,
          date: '2025-07-25 15:45'
        }
      ]
    }
  },
  computed: {
    totalAssets() {
      const holdingsValue = this.portfolio.reduce((sum, stock) => {
        return sum + stock.currentPrice * stock.shares;
      }, 0);
      return this.userInfo.balance + holdingsValue;
    },
    holdingsValue() {
      return this.portfolio.reduce((sum, stock) => {
        return sum + stock.currentPrice * stock.shares;
      }, 0);
    },
    todayPnL() {
      return this.portfolio.reduce((sum, stock) => {
        return sum + stock.pnl;
      }, 0);
    },
    totalChange() {
      const totalCost = this.portfolio.reduce((sum, stock) => {
        return sum + stock.costPrice * stock.shares;
      }, 0);
      return totalCost > 0 ? ((this.holdingsValue - totalCost) / totalCost) * 100 : 0;
    },
    canTrade() {
      if (!this.selectedStock || !this.tradeForm.quantity) return false;
      
      if (this.tradeForm.type === 'buy') {
        return this.userInfo.balance >= this.selectedStock.price * this.tradeForm.quantity;
      } else {
        const holding = this.portfolio.find(p => p.code === this.selectedStock.code);
        return holding && holding.shares >= this.tradeForm.quantity;
      }
    }
  },
  methods: {
    searchStock() {
      const stock = this.availableStocks.find(s => s.code === this.tradeForm.code);
      this.selectedStock = stock || null;
    },
    selectStock(stock) {
      this.tradeForm.code = stock.code;
      this.selectedStock = stock;
    },
    executeTrade() {
      if (!this.canTrade) return;

      const { type, quantity } = this.tradeForm;
      const stock = this.selectedStock;
      const tradeAmount = stock.price * quantity;

      if (type === 'buy') {
        // 买入逻辑
        this.userInfo.balance -= tradeAmount;
        
        const existingHolding = this.portfolio.find(p => p.code === stock.code);
        if (existingHolding) {
          const totalShares = existingHolding.shares + quantity;
          const totalCost = existingHolding.costPrice * existingHolding.shares + tradeAmount;
          existingHolding.costPrice = totalCost / totalShares;
          existingHolding.shares = totalShares;
          existingHolding.pnl = (stock.price - existingHolding.costPrice) * totalShares;
        } else {
          this.portfolio.push({
            code: stock.code,
            name: stock.name,
            currentPrice: stock.price,
            changePercent: stock.change,
            shares: quantity,
            costPrice: stock.price,
            pnl: 0
          });
        }
      } else {
        // 卖出逻辑
        this.userInfo.balance += tradeAmount;
        
        const holding = this.portfolio.find(p => p.code === stock.code);
        if (holding) {
          holding.shares -= quantity;
          if (holding.shares <= 0) {
            const index = this.portfolio.findIndex(p => p.code === stock.code);
            this.portfolio.splice(index, 1);
          } else {
            holding.pnl = (stock.price - holding.costPrice) * holding.shares;
          }
        }
      }

      // 添加交易记录
      this.tradingHistory.unshift({
        id: Date.now(),
        stockCode: stock.code,
        stockName: stock.name,
        type: type,
        quantity: quantity,
        price: stock.price,
        date: new Date().toLocaleString('zh-CN')
      });

      // 重置表单
      this.tradeForm = {
        code: '',
        type: 'buy',
        quantity: 0
      };
      this.selectedStock = null;

      alert(`${type === 'buy' ? '买入' : '卖出'}成功！`);
    }
  }
}
</script>

<style scoped>
.stock-trading-app {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.header {
  background: #1a1a1a;
  color: white;
  padding: 1rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-name {
  font-weight: 500;
}

.account-balance {
  color: #4caf50;
  font-weight: bold;
}

/* 标签页导航 */
.tab-nav {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button:hover {
  background: #f5f5f5;
}

.tab-button.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 持仓页面样式 */
.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.summary-card .amount {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.summary-card .change {
  font-size: 0.9rem;
  font-weight: 500;
}

.positive {
  color: #f44336;
}

.negative {
  color: #4caf50;
}

/* 股票列表 */
.stock-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr;
  background: #f5f5f5;
  padding: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
}

.stock-item {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.stock-item:hover {
  background: #f9f9f9;
}

.stock-item:last-child {
  border-bottom: none;
}

/* 交易页面样式 */
.trading-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.trading-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.stock-info {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.stock-info h4 {
  margin: 0 0 0.5rem 0;
}

.trade-type {
  display: flex;
  gap: 0.5rem;
}

.type-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.trade-summary {
  background: #e3f2fd;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.trade-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.trade-btn.buy {
  background: #f44336;
  color: white;
}

.trade-btn.sell {
  background: #4caf50;
  color: white;
}

.trade-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 可交易股票列表 */
.available-stocks {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.available-stock-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.available-stock-item:hover {
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33,150,243,0.2);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.code {
  font-weight: bold;
}

.name {
  color: #666;
  font-size: 0.9rem;
}

.stock-price {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

/* 个人中心样式 */
.profile-section {
  max-width: 800px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 1.5rem;
}

.user-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.user-details p {
  margin: 0.25rem 0;
  opacity: 0.9;
}

.account-info {
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.account-info h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.info-item label {
  color: #666;
}

.risk-level {
  color: #ff9800;
  font-weight: 500;
}

.trading-history {
  padding: 2rem;
}

.trading-history h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.record-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.trade-type.buy {
  color: #f44336;
  font-weight: bold;
}

.trade-type.sell {
  color: #4caf50;
  font-weight: bold;
}

.record-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.date {
  color: #666;
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trading-section {
    grid-template-columns: 1fr;
  }
  
  .portfolio-summary {
    grid-template-columns: 1fr;
  }
  
  .list-header,
  .stock-item {
    grid-template-columns: repeat(4, 1fr);
    font-size: 0.8rem;
  }
  
  .list-header .header-item:nth-child(n+5),
  .stock-item > div:nth-child(n+5) {
    display: none;
  }
  
  .stocks-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>