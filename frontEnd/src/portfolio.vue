<template>
  <div class="stock-trading-app">
    <!-- 标签页导航 -->
    <nav class="tab-nav">
      <div class="nav-left">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click.stop="switchTab(tab.id)"
        >
          {{ tab.name }}
        </button>
        <!-- Debug info -->
        <span style="margin-left: 20px; color: #666; font-size: 0.8rem;">
          Current: {{ activeTab }}
        </span>
      </div>
      <div class="nav-right">
        <span v-if="loading" class="loading-indicator">🔄 加载中...</span>
        <span v-if="error" class="error-indicator">❌ {{ error }}</span>
        <span v-if="lastUpdateTime" class="update-time">更新: {{ lastUpdateTime.toLocaleTimeString() }}</span>
        <span class="user-name">{{ userInfo.name }}</span>
        <span class="account-balance">Balance: €{{ userInfo.balance.toLocaleString() }}</span>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 持仓页面 -->
      <div v-if="activeTab === 'portfolio'" class="portfolio-section">
        <div class="portfolio-summary">
          <div class="summary-card">
            <h3>Total Assets</h3>
            <div class="amount">€{{ (userInfo.totalAssets || 0).toLocaleString() }}</div>
            <div class="change" :class="{ positive: (userInfo.profitPercentage || 0) >= 0, negative: (userInfo.profitPercentage || 0) < 0 }">
              {{ (userInfo.profitPercentage || 0) >= 0 ? '+' : '' }}{{ (userInfo.profitPercentage || 0).toFixed(2) }}%
            </div>
          </div>
          <div class="summary-card">
            <h3>Today's P&L</h3>
            <div class="amount">€{{ (userInfo.totalProfit || 0).toLocaleString() }}</div>
            <div class="change" :class="{ positive: (userInfo.totalProfit || 0) >= 0, negative: (userInfo.totalProfit || 0) < 0 }">
              {{ (userInfo.totalProfit || 0) >= 0 ? '+' : '' }}€{{ Math.abs(userInfo.totalProfit || 0).toLocaleString() }}
            </div>
          </div>
          <div class="summary-card">
            <h3>Holdings Value</h3>
            <div class="amount">${{ (holdingsValue || 0).toLocaleString() }}</div>
          </div>
        </div>

        <!-- Total Assets Trend Chart -->
        <div class="asset-trend-section">
          <div class="trend-header">
            <div class="trend-info">
              <div class="asset-value">
                <span class="label">Net Assets - HKD</span>
                <div class="value-section">
                  <span class="current-value">{{ totalAssets.toLocaleString() }}</span>
                  <span class="daily-change" :class="{ positive: todayPnL >= 0, negative: todayPnL < 0 }">
                    {{ todayPnL >= 0 ? '+' : '' }}{{ todayPnL.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
            <div class="time-range-selector">
              <button 
                v-for="range in timeRanges" 
                :key="range.id"
                :class="['range-btn', { active: selectedTimeRange === range.id }]"
                @click="changeTimeRange(range.id)"
              >
                {{ range.name }}
              </button>
            </div>
          </div>
          <div ref="assetChartRef" class="asset-trend-chart"></div>
        </div>

        <!-- Stock List -->
        <div class="stock-list">
          <div class="list-header">
            <div class="header-item">Code</div>
            <div class="header-item">Name</div>
            <div class="header-item">Price</div>
            <div class="header-item">Change</div>
            <div class="header-item">Shares</div>
            <div class="header-item">Value</div>
            <div class="header-item">P&L</div>
          </div>
          <div 
            v-for="stock in portfolio" 
            :key="stock.code"
            class="stock-item"
            @click="showKlineChart(stock)"
          >
            <div class="stock-code">{{ stock.code }}</div>
            <div class="stock-name">{{ stock.name }}</div>
            <div class="stock-price">${{ (stock.currentPrice || 0).toFixed(2) }}</div>
            <div class="stock-change" :class="{ positive: (stock.changePercent || 0) >= 0, negative: (stock.changePercent || 0) < 0 }">
              {{ (stock.changePercent || 0) >= 0 ? '+' : '' }}{{ (stock.changePercent || 0).toFixed(2) }}%
            </div>
            <div class="stock-shares">{{ stock.shares || 0 }}</div>
            <div class="stock-value">${{ ((stock.currentPrice || 0) * (stock.shares || 0)).toLocaleString() }}</div>
            <div class="stock-pnl" :class="{ positive: (stock.pnl || 0) >= 0, negative: (stock.pnl || 0) < 0 }">
              {{ (stock.pnl || 0) >= 0 ? '+' : '' }}${{ (stock.pnl || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- K-line Chart Modal -->
        <div v-if="showChart" class="chart-modal" @click="closeChart">
          <div class="chart-container" @click.stop>
            <div class="chart-header">
              <h3>{{ selectedChartStock.name }} ({{ selectedChartStock.code }}) - Annual K-line Chart</h3>
              <button class="close-btn" @click="closeChart">×</button>
            </div>
            <div class="chart-info">
              <div class="current-price">
                <span class="price">${{ selectedChartStock.currentPrice.toFixed(2) }}</span>
                <span class="change" :class="{ positive: selectedChartStock.changePercent >= 0, negative: selectedChartStock.changePercent < 0 }">
                  {{ selectedChartStock.changePercent >= 0 ? '+' : '' }}{{ selectedChartStock.changePercent.toFixed(2) }}%
                </span>
              </div>
              <div class="stock-stats">
                <span>High: ${{ selectedChartStock.yearHigh }}</span>
                <span>Low: ${{ selectedChartStock.yearLow }}</span>
                <span>Volume: {{ selectedChartStock.volume }}</span>
              </div>
              <div class="trade-actions">
                <button class="trade-action-btn buy-btn" @click="goToTrading('buy')">
                  Buy
                </button>
                <button class="trade-action-btn sell-btn" @click="goToTrading('sell')">
                  Sell
                </button>
              </div>
            </div>
            <div ref="chartRef" class="kline-chart"></div>
          </div>
        </div>
      </div>

      <!-- Stock Trading Page -->
      <div v-if="activeTab === 'trading'" class="trading-section">
        <div class="trading-form">
          <h3>Stock Trading</h3>
          <div class="form-group">
            <label>Stock Code:</label>
            <input 
              v-model="tradeForm.code" 
              type="text" 
              placeholder="Enter stock code"
              @input="searchStock"
            />
          </div>
          <div v-if="selectedStock" class="stock-info">
            <h4>{{ selectedStock.name }} ({{ selectedStock.code }})</h4>
            <p>Current Price: ${{ selectedStock.price.toFixed(2) }}</p>
            <p class="change" :class="{ positive: selectedStock.change >= 0, negative: selectedStock.change < 0 }">
              {{ selectedStock.change >= 0 ? '+' : '' }}{{ selectedStock.change.toFixed(2) }}%
            </p>
          </div>
          <div class="form-group">
            <label>Trade Type:</label>
            <div class="trade-type">
              <button 
                :class="['type-btn', { active: tradeForm.type === 'buy' }]"
                @click="tradeForm.type = 'buy'"
              >
                Buy
              </button>
              <button 
                :class="['type-btn', { active: tradeForm.type === 'sell' }]"
                @click="tradeForm.type = 'sell'"
              >
                Sell
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Quantity:</label>
            <input 
              v-model.number="tradeForm.quantity" 
              type="number" 
              placeholder="Enter quantity"
            />
          </div>
          <div v-if="selectedStock" class="trade-summary">
            <p>Trade Amount: ${{ (selectedStock.price * tradeForm.quantity).toLocaleString() }}</p>
            <p v-if="tradeForm.type === 'buy'">
              Balance After Trade: ${{ (userInfo.balance - selectedStock.price * tradeForm.quantity).toLocaleString() }}
            </p>
          </div>
          <button 
            class="trade-btn"
            :class="tradeForm.type"
            @click="executeTrade"
            :disabled="!canTrade"
          >
            {{ tradeForm.type === 'buy' ? 'Buy' : 'Sell' }}
          </button>
        </div>

        <!-- Available Stocks List -->
        <div class="available-stocks">
          <!-- Major Indices Section -->
          <div class="indices-section">
            <div class="indices-header">
              <h3>Major Indices</h3>
              <div class="update-info" v-if="lastUpdateTime">
                <span class="update-time">Last Updated: {{ lastUpdateTime.toLocaleTimeString() }}</span>
                <span class="update-indicator" :class="{ active: updateInterval }">●</span>
              </div>
            </div>
            <div class="indices-grid">
              <div 
                v-for="index in majorIndices" 
                :key="index.code"
                class="index-item"
                :class="{ positive: index.change >= 0, negative: index.change < 0 }"
              >
                <div class="index-header">
                  <div class="index-info">
                    <span class="index-code">{{ index.code }}</span>
                    <span class="market-tag" :class="index.market.toLowerCase()">{{ index.market }}</span>
                  </div>
                  <div class="index-name">{{ index.name }}</div>
                </div>
                <div class="index-value">{{ index.value.toLocaleString() }}</div>
                <div class="index-change">
                  <span class="change-percent" :class="{ positive: index.change >= 0, negative: index.change < 0 }">
                    {{ index.change >= 0 ? '+' : '' }}{{ index.change.toFixed(2) }}%
                  </span>
                  <span class="change-value" :class="{ positive: index.change >= 0, negative: index.change < 0 }">
                    {{ index.change >= 0 ? '+' : '' }}{{ index.changeValue.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Stocks Section -->
          <h3>Popular Stocks</h3>
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
              <div class="stock-price">${{ stock.price.toFixed(2) }}</div>
              <div class="stock-change" :class="{ positive: stock.change >= 0, negative: stock.change < 0 }">
                {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile Page -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar">{{ userInfo.name.charAt(0) }}</div>
            <div class="user-details">
              <h3>{{ userInfo.name }}</h3>
              <p>User ID: {{ userInfo.id }}</p>
              <p>Registration Date: {{ userInfo.registerDate }}</p>
            </div>
          </div>
          
          <div class="account-info">
            <h4>Account Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Account Balance:</label>
                <span>${{ userInfo.balance.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <label>Total Assets:</label>
                <span>${{ totalAssets.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <label>Holdings Count:</label>
                <span>{{ portfolio.length }} stocks</span>
              </div>
              <div class="info-item">
                <label>Risk Level:</label>
                <span class="risk-level">{{ userInfo.riskLevel }}</span>
              </div>
            </div>
          </div>

          <div class="trading-history">
            <h4>Recent Trading History</h4>
            <div class="history-list">
              <div 
                v-for="record in tradingHistory" 
                :key="record.id"
                class="history-item"
              >
                <div class="record-info">
                  <span class="stock-info">{{ record.stockName }} ({{ record.stockCode }})</span>
                  <span class="trade-type" :class="record.type">{{ record.type === 'buy' ? 'Buy' : 'Sell' }}</span>
                </div>
                <div class="record-details">
                  <span>{{ record.quantity }} shares @ ${{ record.price.toFixed(2) }}</span>
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
import * as echarts from 'echarts'

export default {
  name: 'Portfolio',
  data() {
    return {
      // API配置
      API_BASE_URL: 'http://localhost:3000/api',
      loading: false,
      error: null,
      lastUpdateTime: null,
      
      activeTab: 'portfolio',
      tabs: [
        { id: 'portfolio', name: 'Holdings' },
        { id: 'trading', name: 'Trading' },
        { id: 'profile', name: 'Profile' }
      ],
      userInfo: {
        id: 'U123456789',
        name: 'Portfolio User',
        balance: 150000,
        registerDate: '2023-01-15',
        riskLevel: 'Conservative',
        initialBalance: 150000,
        totalAssets: 200000,
        totalProfit: 50000,
        profitPercentage: 25.0
      },
      portfolio: [
        {
          code: '000001',
          name: 'Ping An Bank',
          currentPrice: 12.85,
          changePercent: 2.4,
          shares: 1000,
          costPrice: 12.50,
          pnl: 350,
          yearHigh: 15.40,
          yearLow: 10.20,
          volume: '1.2M'
        },
        {
          code: '600036',
          name: 'China Merchants Bank',
          currentPrice: 38.45,
          changePercent: 1.8,
          shares: 500,
          costPrice: 37.80,
          pnl: 325,
          yearHigh: 42.50,
          yearLow: 30.80,
          volume: '800K'
        }
      ],
      availableStocks: [
        { code: '600519', name: 'Kweichow Moutai', price: 1680.50, change: 2.3 },
        { code: '000001', name: 'Ping An Bank', price: 12.85, change: 2.4 },
        { code: '600036', name: 'China Merchants Bank', price: 38.45, change: 1.8 },
        { code: '000002', name: 'China Vanke', price: 8.96, change: -1.2 }
      ],
      majorIndices: [
        {
          code: 'HSI',
          name: 'Hang Seng Index',
          market: 'HK',
          symbol: '^HSI',
          value: 17250.35,
          changeValue: 125.40,
          change: 0.73
        },
        {
          code: 'SPX',
          name: 'S&P 500',
          market: 'US',
          symbol: 'SPX',
          value: 4450.25,
          changeValue: -15.30,
          change: -0.34
        }
      ],
      // API配置
      apiConfig: {
        alphaVantage: {
          apiKey: '2KCGOWSHXJ371ZHF', // 需要注册获取
          baseUrl: 'https://www.alphavantage.co/query'
        },
        yahooFinance: {
          baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart'
        }
      },
      tradeForm: {
        code: '',
        type: 'buy',
        quantity: 0
      },
      selectedStock: null,
      showChart: false,
      selectedChartStock: null,
      chartInstance: null,
      assetChartInstance: null,
      updateInterval: null, // 用于存储定时器ID
      selectedTimeRange: 'ytd', // 默认选择年初至今
      timeRanges: [
        { id: 'today', name: 'Today', days: 1 },
        { id: '5d', name: '5D', days: 5 },
        { id: '1m', name: '1M', days: 30 },
        { id: 'ytd', name: 'YTD', days: 208 }, // 年初至今约208个交易日
        { id: 'custom', name: 'Custom', days: 0 }
      ],
      tradingHistory: [
        {
          id: 1,
          stockCode: '600036',
          stockName: 'China Merchants Bank',
          type: 'buy',
          quantity: 500,
          price: 37.80,
          date: '2025-07-27 14:30'
        },
        {
          id: 2,
          stockCode: '000858',
          stockName: 'Wuliangye',
          type: 'buy',
          quantity: 200,
          price: 168.00,
          date: '2025-07-26 10:15'
        },
        {
          id: 3,
          stockCode: '000002',
          stockName: 'China Vanke',
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
        return sum + (stock.currentPrice || 0) * (stock.shares || 0);
      }, 0);
      return (this.userInfo.balance || 0) + holdingsValue;
    },
    holdingsValue() {
      return this.portfolio.reduce((sum, stock) => {
        return sum + (stock.currentPrice || 0) * (stock.shares || 0);
      }, 0);
    },
    todayPnL() {
      return this.portfolio.reduce((sum, stock) => {
        return sum + (stock.pnl || 0);
      }, 0);
    },
    totalChange() {
      const totalCost = this.portfolio.reduce((sum, stock) => {
        return sum + (stock.costPrice || 0) * (stock.shares || 0);
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
    // 标签页切换方法
    switchTab(tabId) {
      console.log('[switchTab] Switching from', this.activeTab, 'to', tabId);
      this.activeTab = tabId;
      console.log('[switchTab] activeTab is now:', this.activeTab);
    },
    
    // API数据获取方法
    async fetchAccountInfo() {
      try {
        const response = await fetch(`${this.API_BASE_URL}/account`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        
        // 更新用户信息
        this.userInfo.balance = data.currentBalance
        this.userInfo.totalAssets = data.totalAssets
        this.userInfo.initialBalance = data.initialBalance
        this.userInfo.totalProfit = data.totalProfit
        this.userInfo.profitPercentage = data.profitPercentage
        
        console.log('账户信息已更新:', data)
      } catch (err) {
        console.error('获取账户信息失败:', err)
        this.error = '获取账户信息失败'
      }
    },
    
    async fetchPortfolio() {
      try {
        const response = await fetch(`${this.API_BASE_URL}/portfolio`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        
        // 转换后端数据格式为前端格式
        this.portfolio = data.holdings.map(holding => ({
          code: holding.ticker || '',
          name: holding.name || 'Unknown',
          shares: Number(holding.quantity) || 0,
          currentPrice: Number(holding.currentPrice) || 0,
          changePercent: Number(holding.profitPercentage) || 0,
          costPrice: Number(holding.costPrice) || 0,
          pnl: Number(holding.profit) || 0,
          yearHigh: Number(holding.currentPrice) * 1.2 || 0, // 估算年高
          yearLow: Number(holding.currentPrice) * 0.8 || 0,  // 估算年低
          volume: '1.2M' // 占位符
        }))
        
        console.log('持仓信息已更新:', this.portfolio)
      } catch (err) {
        console.error('获取持仓信息失败:', err)
        this.error = '获取持仓信息失败'
      }
    },
    
    async fetchMarketData() {
      try {
        const response = await fetch(`${this.API_BASE_URL}/market`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        
        // 转换后端数据格式为前端格式
        this.availableStocks = data.stocks.map(stock => ({
          code: stock.ticker || '',
          name: stock.name || 'Unknown',
          price: Number(stock.currentPrice) || 0,
          change: Number(stock.changePercentage) || 0
        }))
        
        console.log('市场数据已更新:', this.availableStocks)
      } catch (err) {
        console.error('获取市场数据失败:', err)
        this.error = '获取市场数据失败'
      }
    },
    
    async loadAllData() {
      this.loading = true
      this.error = null
      
      try {
        await Promise.all([
          this.fetchAccountInfo(),
          this.fetchPortfolio(),
          this.fetchMarketData()
        ])
        this.lastUpdateTime = new Date()
      } catch (err) {
        console.error('加载数据失败:', err)
        this.error = '加载数据失败，请检查后端服务器'
      } finally {
        this.loading = false
      }
    },
    
    async executeTradeAPI(tradeData) {
      try {
        const endpoint = tradeData.type === 'buy' ? '/trade/buy' : '/trade/sell'
        const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ticker: tradeData.code,
            quantity: tradeData.quantity
          })
        })
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        
        console.log('交易执行成功:', result)
        
        // 重新加载数据以反映交易结果
        await this.loadAllData()
        
        return result
      } catch (err) {
        console.error('交易执行失败:', err)
        throw err
      }
    },

    searchStock() {
      const stock = this.availableStocks.find(s => s.code === this.tradeForm.code);
      this.selectedStock = stock || null;
    },
    selectStock(stock) {
      this.tradeForm.code = stock.code;
      this.selectedStock = stock;
    },
    async executeTrade() {
      if (!this.canTrade) return;

      const { type, quantity } = this.tradeForm;
      const stock = this.selectedStock;

      try {
        this.loading = true
        
        // 调用API执行交易
        const result = await this.executeTradeAPI({
          code: stock.code,
          type: type,
          quantity: quantity
        })
        
        // 显示交易成功信息
        alert(`${type === 'buy' ? '买入' : '卖出'}成功！\n股票: ${stock.name}\n数量: ${quantity}\n金额: €${(stock.price * quantity).toFixed(2)}`)
        
        // 清空表单
        this.tradeForm = {
          code: '',
          type: 'buy',
          quantity: 0
        }
        this.selectedStock = null
        
      } catch (err) {
        alert(`交易失败: ${err.message}`)
      } finally {
        this.loading = false
      }
    },

    // 更新指数数据
    async updateIndicesData() {
      try {
        // 显示加载状态
        this.lastUpdateTime = new Date();
        
        // 使用Promise.allSettled来并行请求所有指数，即使某些失败也继续其他请求
        const promises = this.majorIndices.map(index => this.fetchIndexData(index));
        const results = await Promise.allSettled(promises);
        
        // 处理结果
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            // 成功获取数据，更新指数
            const updatedData = result.value;
            Object.assign(this.majorIndices[index], updatedData);
          } else {
            // API请求失败，使用模拟数据
            console.warn(`Failed to fetch data for ${this.majorIndices[index].code}, using simulated data`);
            this.simulateIndexData(this.majorIndices[index]);
          }
        });
        
        console.log('Indices data updated at:', this.lastUpdateTime.toLocaleTimeString());
      } catch (error) {
        console.error('Error updating indices data:', error);
        // 如果API完全失败，回退到模拟数据
        this.majorIndices.forEach(index => this.simulateIndexData(index));
      }
    },

    // 获取单个指数数据
    async fetchIndexData(index) {
      try {
        // 根据市场选择不同的API
        if (index.market === 'US') {
          return await this.fetchAlphaVantageData(index);
        } else {
          return await this.fetchYahooFinanceData(index);
        }
      } catch (error) {
        console.error(`Error fetching data for ${index.code}:`, error);
        return null;
      }
    },

    // 使用Alpha Vantage API获取美股指数数据
    async fetchAlphaVantageData(index) {
      const { apiKey, baseUrl } = this.apiConfig.alphaVantage;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('Alpha Vantage API key not configured');
      }

      const url = `${baseUrl}?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || data['Note']);
      }

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('No quote data available');
      }

      const currentPrice = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      return {
        value: currentPrice,
        changeValue: change,
        change: changePercent
      };
    },

    // 使用Yahoo Finance API获取其他指数数据
    async fetchYahooFinanceData(index) {
      const { baseUrl } = this.apiConfig.yahooFinance;
      const url = `${baseUrl}/${index.symbol}?interval=1m&range=1d`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.chart.error) {
        throw new Error(data.chart.error.description);
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        value: currentPrice,
        changeValue: change,
        change: changePercent
      };
    },

    // 模拟数据（作为API失败时的后备方案）
    simulateIndexData(index) {
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1%的随机变化
      const newValue = index.value * (1 + randomChange);
      const changeValue = newValue - index.value;
      const changePercent = (changeValue / index.value) * 100;
      
      index.value = parseFloat(newValue.toFixed(2));
      index.changeValue = parseFloat(changeValue.toFixed(2));
      index.change = parseFloat(changePercent.toFixed(2));
    },

    // 启动实时数据更新
    startRealTimeUpdates() {
      // 立即执行一次更新
      this.updateIndicesData();
      
      // 每30秒更新一次API数据
      this.apiUpdateInterval = setInterval(() => {
        this.loadAllData();
      }, 30000); // 30秒
      
      // 每1分钟更新一次指数数据
      this.updateInterval = setInterval(() => {
        this.updateIndicesData();
      }, 60000); // 60秒 = 1分钟
    },

    // 停止实时数据更新
    stopRealTimeUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      if (this.apiUpdateInterval) {
        clearInterval(this.apiUpdateInterval);
        this.apiUpdateInterval = null;
      }
    },
    
    // 资产走势图相关方法
    changeTimeRange(rangeId) {
      this.selectedTimeRange = rangeId;
      this.initAssetChart();
    },
    
    initAssetChart() {
      if (!this.$refs.assetChartRef) return;
      
      if (this.assetChartInstance) {
        this.assetChartInstance.dispose();
      }
      
      this.assetChartInstance = echarts.init(this.$refs.assetChartRef);
      
      const trendData = this.generateAssetTrendData();
      
      const option = {
        grid: {
          left: '3%',
          right: '3%',
          bottom: '10%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: trendData.dates,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#666',
            fontSize: 12,
            formatter: function(value) {
              if (value.includes('/01') || value.includes('/28')) {
                return value.substring(5); // 只显示月/日
              }
              return '';
            }
          },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          show: false,
          scale: true
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          formatter: function(params) {
            const data = params[0];
            return `
              <div style="padding: 5px;">
                <div>${data.axisValue}</div>
                <div style="margin-top: 5px;">
                  <span style="color: #ff9500;">Net Assets: $${data.value.toLocaleString()}</span>
                </div>
              </div>
            `;
          }
        },
        series: [
          {
            type: 'line',
            data: trendData.values,
            smooth: true,
            symbol: 'none',
            lineStyle: {
              color: '#ff9500',
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 149, 0, 0.3)' },
                { offset: 1, color: 'rgba(255, 149, 0, 0.1)' }
              ])
            }
          }
        ]
      };
      
      this.assetChartInstance.setOption(option);
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.assetChartInstance) {
          this.assetChartInstance.resize();
        }
      });
    },
    
    generateAssetTrendData() {
      const selectedRange = this.timeRanges.find(r => r.id === this.selectedTimeRange);
      const days = selectedRange.days;
      const dates = [];
      const values = [];
      const currentDate = new Date();
      const currentAssets = this.totalAssets;
      
      // 生成日期和对应的资产值
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        
        // 格式化日期
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        
        // 生成模拟的资产变化数据
        const progress = (days - 1 - i) / (days - 1);
        const baseValue = currentAssets * 0.7; // 起始值为当前资产的70%
        const growthFactor = 1 + progress * 0.3; // 30%的总增长
        const dailyNoise = (Math.random() - 0.5) * 0.02; // 2%的日常波动
        
        const value = baseValue * growthFactor * (1 + dailyNoise);
        values.push(Math.round(value));
      }
      
      // 确保最后一个值是当前总资产
      values[values.length - 1] = currentAssets;
      
      return { dates, values };
    },
    
    // K线图相关方法
    showKlineChart(stock) {
      this.selectedChartStock = stock;
      this.showChart = true;
      this.$nextTick(() => {
        this.initChart();
      });
    },
    
    closeChart() {
      this.showChart = false;
      if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
      }
    },

    goToTrading(type) {
      // 关闭K线图模态框
      this.closeChart();
      
      // 切换到交易页面
      this.activeTab = 'trading';
      
      // 填入股票信息
      this.tradeForm.code = this.selectedChartStock.code;
      this.tradeForm.type = type;
      
      // 根据股票代码查找对应的股票信息
      const stock = this.availableStocks.find(s => s.code === this.selectedChartStock.code);
      if (stock) {
        this.selectedStock = stock;
      } else {
        // 如果在可交易股票列表中没找到，创建一个临时的股票对象
        this.selectedStock = {
          code: this.selectedChartStock.code,
          name: this.selectedChartStock.name,
          price: this.selectedChartStock.currentPrice,
          change: this.selectedChartStock.changePercent
        };
      }
    },
    
    initChart() {
      if (!this.$refs.chartRef) return;
      
      this.chartInstance = echarts.init(this.$refs.chartRef);
      
      // 生成模拟K线数据
      const klineData = this.generateKlineData(this.selectedChartStock);
      
      const option = {
        title: {
          text: `${this.selectedChartStock.name} (${this.selectedChartStock.code})`,
          left: 'center',
          textStyle: {
            color: '#333',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function (params) {
            const data = params[0].data;
            return `
              Date: ${data[0]}<br/>
              Open: $${data[1]}<br/>
              Close: $${data[2]}<br/>
              Low: $${data[3]}<br/>
              High: $${data[4]}<br/>
              Volume: ${data[5]}
            `;
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: klineData.dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: {
            show: true
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 50,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 50,
            end: 100
          }
        ],
        series: [
          {
            name: 'K-line Chart',
            type: 'candlestick',
            data: klineData.values,
            itemStyle: {
              color: '#ef232a',
              color0: '#14b143',
              borderColor: '#ef232a',
              borderColor0: '#14b143'
            }
          }
        ]
      };
      
      this.chartInstance.setOption(option);
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.chartInstance) {
          this.chartInstance.resize();
        }
      });
    },
    
    generateKlineData(stock) {
      const dates = [];
      const values = [];
      const currentDate = new Date();
      const basePrice = stock.currentPrice;
      
      // 生成一年的数据（约250个交易日）
      for (let i = 250; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        // 生成随机K线数据
        const randomFactor = (Math.random() - 0.5) * 0.1;
        const dayPrice = basePrice * (1 + randomFactor);
        const open = dayPrice * (0.98 + Math.random() * 0.04);
        const close = dayPrice * (0.98 + Math.random() * 0.04);
        const low = Math.min(open, close) * (0.98 + Math.random() * 0.02);
        const high = Math.max(open, close) * (1.01 + Math.random() * 0.02);
        const volume = Math.floor(Math.random() * 50000 + 10000);
        
        values.push([
          dates[dates.length - 1],
          parseFloat(open.toFixed(2)),
          parseFloat(close.toFixed(2)),
          parseFloat(low.toFixed(2)),
          parseFloat(high.toFixed(2)),
          volume
        ]);
      }
      
      return { dates, values };
    }
  },
  
  mounted() {
    // 首先加载所有API数据
    this.loadAllData();
    
    this.$nextTick(() => {
      this.initAssetChart();
    });
    
    // 启动实时数据更新
    this.startRealTimeUpdates();
  },
  
  beforeUnmount() {
    // 停止实时更新
    this.stopRealTimeUpdates();
    
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    if (this.assetChartInstance) {
      this.assetChartInstance.dispose();
    }
    
    // 清理定时器
    this.stopRealTimeUpdates();
  }
}
</script>

<style scoped>
.stock-trading-app {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 1rem;
}

.nav-left {
  display: flex;
}

.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.loading-indicator {
  color: #007bff;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

.error-indicator {
  color: #dc3545;
  font-weight: bold;
}

.update-time {
  color: #666;
  font-size: 0.9rem;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
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

/* 资产走势图样式 */
.asset-trend-section {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.trend-info .label {
  color: #999;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.5rem;
}

.value-section {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.current-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.daily-change {
  font-size: 1.2rem;
  font-weight: 500;
}

.daily-change.positive {
  color: #ff4444;
}

.daily-change.negative {
  color: #00ff00;
}

.time-range-selector {
  display: flex;
  gap: 0.5rem;
}

.range-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #444;
  background: transparent;
  color: #999;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.range-btn:hover {
  border-color: #666;
  color: #ccc;
}

.range-btn.active {
  background: #444;
  color: white;
  border-color: #666;
}

.asset-trend-chart {
  height: 300px;
  width: 100%;
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
  cursor: pointer;
}

.stock-item:hover {
  background: #f0f8ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stock-item:last-child {
  border-bottom: none;
}

/* K线图模态框样式 */
.chart-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chart-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  height: 80%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.chart-info {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  flex-wrap: wrap;
  gap: 1rem;
}

.current-price {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-price .price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.current-price .change {
  font-size: 1rem;
  font-weight: 500;
}

.stock-stats {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  color: #666;
}

.stock-stats span {
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.trade-actions {
  display: flex;
  gap: 0.75rem;
}

.trade-action-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.buy-btn {
  background: #f44336;
  color: white;
}

.buy-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.sell-btn {
  background: #4caf50;
  color: white;
}

.sell-btn:hover {
  background: #388e3c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.kline-chart {
  flex: 1;
  padding: 1rem;
  min-height: 400px;
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

/* 指数部分样式 */
.indices-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.indices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.indices-header h3 {
  margin: 0;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.update-time {
  font-family: monospace;
}

.update-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  transition: all 0.3s;
}

.update-indicator.active {
  background: #4caf50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.indices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.index-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.25rem;
  background: #fafafa;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.index-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.index-item.positive {
  border-left: 4px solid #4caf50;
}

.index-item.negative {
  border-left: 4px solid #f44336;
}

.index-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.index-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.index-code {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.market-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.market-tag.us {
  background: #e3f2fd;
  color: #1976d2;
}

.market-tag.cn {
  background: #fce4ec;
  color: #c2185b;
}

.market-tag.hk {
  background: #f3e5f5;
  color: #7b1fa2;
}

.market-tag.jp {
  background: #fff3e0;
  color: #f57c00;
}

.market-tag.uk {
  background: #e8f5e8;
  color: #388e3c;
}

.index-name {
  font-size: 0.85rem;
  color: #666;
  text-align: right;
  line-height: 1.2;
}

.index-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.index-change {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change-percent {
  font-size: 1rem;
  font-weight: 600;
}

.change-value {
  font-size: 0.9rem;
  font-weight: 500;
}

.change-percent.positive,
.change-value.positive {
  color: #4caf50;
}

.change-percent.negative,
.change-value.negative {
  color: #f44336;
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
  .stock-trading-app {
    padding-top: 80px; /* 移动端减少顶部间距 */
  }
  
  .tab-nav {
    margin-top: 80px; /* 移动端减少上边距 */
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-left {
    order: 2;
    justify-content: center;
  }
  
  .nav-right {
    order: 1;
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .trading-section {
    grid-template-columns: 1fr;
  }
  
  .portfolio-summary {
    grid-template-columns: 1fr;
  }
  
  /* 移动端资产走势图适配 */
  .trend-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .value-section {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .current-value {
    font-size: 1.5rem;
  }
  
  .daily-change {
    font-size: 1rem;
  }
  
  .time-range-selector {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .range-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .asset-trend-chart {
    height: 250px;
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

  /* 移动端指数显示适配 */
  .indices-grid {
    grid-template-columns: 1fr;
  }

  .indices-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .update-info {
    font-size: 0.75rem;
  }

  .index-item {
    padding: 1rem;
  }

  .index-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .index-info {
    width: 100%;
    justify-content: space-between;
  }

  .index-name {
    text-align: left;
    font-size: 0.8rem;
  }

  .index-value {
    font-size: 1.3rem;
  }

  .index-change {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .change-percent {
    font-size: 0.9rem;
  }

  .change-value {
    font-size: 0.85rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  /* 移动端K线图适配 */
  .chart-container {
    width: 95%;
    height: 90%;
  }
  
  .chart-header {
    padding: 1rem;
  }
  
  .chart-header h3 {
    font-size: 1rem;
  }
  
  .chart-info {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .current-price {
    order: 1;
    width: 100%;
    justify-content: space-between;
  }

  .stock-stats {
    order: 2;
    gap: 1rem;
    flex-wrap: wrap;
    width: 100%;
  }

  .trade-actions {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .trade-action-btn {
    flex: 1;
    max-width: 120px;
  }
  
  .stock-stats {
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .kline-chart {
    padding: 0.5rem;
    min-height: 300px;
  }
}
</style>