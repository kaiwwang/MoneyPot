<template>
  <div class="futu-trading-app" :class="{ 'light-mode': !isDarkMode }">
    <!-- Header -->
    <header class="app-header">
      <div class="header-container">
        <div class="header-left">
          <div class="app-logo">
            <div class="logo-icon">💰</div>
            <span class="logo-text">MoneyPot</span>
          </div>
          <nav class="main-nav">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['nav-item', { active: activeTab === tab.id }]"
              @click.stop="switchTab(tab.id)"
            >
              <span class="nav-icon">{{ getTabIcon(tab.id) }}</span>
              <span class="nav-text">{{ tab.name }}</span>
            </button>
          </nav>
        </div>
        <div class="header-right">
          <div class="theme-toggle">
            <button @click="toggleTheme" class="theme-btn" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            </button>
          </div>
          <div class="global-indices-ticker">
            <div class="ticker-container">
              <div 
                v-for="(index, i) in globalIndices" 
                :key="index.symbol"
                class="ticker-item"
                :class="{ active: currentTickerIndex === i }"
              >
                <span class="ticker-symbol">{{ index.symbol }}</span>
                <span class="ticker-value">{{ index.price?.toFixed(2) || 'Loading...' }}</span>
                <span class="ticker-change" :class="{ profit: (index.change || 0) >= 0, loss: (index.change || 0) < 0 }">
                  {{ (index.change || 0) >= 0 ? '+' : '' }}{{ (index.changePercent || 0).toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
          <div class="market-status">
            <div class="status-indicator" :class="{ active: !loading && !error }"></div>
            <span class="status-text">
              {{ loading ? 'Syncing...' : error ? 'Connection Error' : 'Market Open' }}
            </span>
          </div>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          <div class="user-info">
            <div class="balance-display">
              <div class="balance-label">Total Balance</div>
              <div class="balance-amount">${{ userInfo.balance.toLocaleString() }}</div>
            </div>
            <div class="user-avatar">
              <span>{{ userInfo.name.charAt(0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-container">
      <!-- Portfolio Section -->
      <div v-if="activeTab === 'portfolio'" class="portfolio-page">
        <!-- Portfolio Overview Cards -->
        <div class="overview-section">
          <div class="overview-card main-card">
            <div class="card-header">
              <h3>Total Assets</h3>
              <div class="time-period">Today</div>
            </div>
            <div class="card-content">
              <div class="primary-value">${{ (userInfo.totalAssets || 0).toLocaleString() }}</div>
              <div class="value-change" :class="{ profit: (userInfo.profitPercentage || 0) >= 0, loss: (userInfo.profitPercentage || 0) < 0 }">
                <span class="change-amount">{{ (userInfo.profitPercentage || 0) >= 0 ? '+' : '' }}${{ Math.abs(userInfo.totalProfit || 0).toLocaleString() }}</span>
                <span class="change-percent">({{ (userInfo.profitPercentage || 0) >= 0 ? '+' : '' }}{{ (userInfo.profitPercentage || 0).toFixed(2) }}%)</span>
              </div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-header">
              <h3>Available Cash</h3>
            </div>
            <div class="card-content">
              <div class="secondary-value">${{ userInfo.balance.toLocaleString() }}</div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-header">
              <h3>Holdings Value</h3>
            </div>
            <div class="card-content">
              <div class="secondary-value">${{ (holdingsValue || 0).toLocaleString() }}</div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-header">
              <h3>Day's P&L</h3>
            </div>
            <div class="card-content">
              <div class="secondary-value" :class="{ profit: todayPnL >= 0, loss: todayPnL < 0 }">
                {{ todayPnL >= 0 ? '+' : '' }}${{ Math.abs(todayPnL).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Trend Chart -->
        <div class="chart-section">
          <div class="chart-container-modern">
            <div class="chart-header">
              <div class="chart-title">
                <h3>Portfolio Performance</h3>
                <div class="chart-value">
                  <span class="current-assets">${{ totalAssets.toLocaleString() }}</span>
                  <span class="daily-pnl" :class="{ profit: todayPnL >= 0, loss: todayPnL < 0 }">
                    {{ todayPnL >= 0 ? '+' : '' }}${{ Math.abs(todayPnL).toLocaleString() }}
                  </span>
                </div>
              </div>
              <div class="chart-controls">
                <div class="time-selector">
                  <button
                    v-for="range in timeRanges"
                    :key="range.id"
                    :class="['time-btn', { active: selectedTimeRange === range.id }]"
                    @click="changeTimeRange(range.id)"
                  >
                    {{ range.name }}
                  </button>
                </div>
              </div>
            </div>
            <div ref="assetChartRef" class="modern-chart"></div>
          </div>
        </div>

        <!-- Holdings List -->
        <div class="holdings-section">
          <div class="section-header">
            <h3>My Holdings</h3>
            <div class="holdings-summary">{{ portfolio.length }} positions</div>
          </div>
          
          <div class="holdings-content">
            <!-- Holdings Table (Left Side) -->
            <div class="holdings-table-container">
              <!-- Loading State -->
              <div v-if="loading && portfolio.length === 0" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading your portfolio from database...</p>
              </div>
              
              <!-- No Data State -->
              <div v-else-if="!loading && portfolio.length === 0 && !error" class="empty-state">
                <p>No holdings found. Start trading to build your portfolio!</p>
              </div>
              
              <!-- Error State -->
              <div v-else-if="error && portfolio.length === 0" class="error-state">
                <p>Unable to load portfolio data. Please check your connection and try again.</p>
                <button @click="loadAllData()" class="retry-btn">Retry</button>
              </div>
              
              <!-- Holdings Table -->
              <div v-else class="holdings-table">
                <div class="table-header">
                  <div class="header-cell symbol">Symbol</div>
                  <div class="header-cell company">Company</div>
                  <div class="header-cell price">Price</div>
                  <div class="header-cell change">Change</div>
                  <div class="header-cell shares">Shares</div>
                  <div class="header-cell market-value">Market Value</div>
                  <div class="header-cell pnl">P&L</div>
                </div>
                <div class="table-body">
                  <div
                    v-for="stock in portfolio"
                    :key="stock.code"
                    class="table-row"
                    @click="showKlineChart(stock)"
                  >
                    <div class="cell symbol">
                      <div class="stock-symbol">{{ stock.code }}</div>
                    </div>
                    <div class="cell company">
                      <div class="company-name">{{ stock.name }}</div>
                    </div>
                    <div class="cell price">
                      <div class="stock-price">${{ (stock.currentPrice || 0).toFixed(2) }}</div>
                    </div>
                    <div class="cell change">
                      <div class="price-change" :class="{ profit: (stock.changePercent || 0) >= 0, loss: (stock.changePercent || 0) < 0 }">
                        {{ (stock.changePercent || 0) >= 0 ? '+' : '' }}{{ (stock.changePercent || 0).toFixed(2) }}%
                      </div>
                    </div>
                    <div class="cell shares">
                      <div class="share-count">{{ stock.shares || 0 }}</div>
                    </div>
                    <div class="cell market-value">
                      <div class="value-amount">${{ ((stock.currentPrice || 0) * (stock.shares || 0)).toLocaleString() }}</div>
                    </div>
                    <div class="cell pnl">
                      <div class="pnl-amount" :class="{ profit: (stock.pnl || 0) >= 0, loss: (stock.pnl || 0) < 0 }">
                        {{ (stock.pnl || 0) >= 0 ? '+' : '' }}${{ Math.abs(stock.pnl || 0).toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portfolio Composition Pie Chart (Right Side) -->
            <div class="portfolio-pie-chart">
              <div class="pie-chart-header">
                <h4>Portfolio Composition</h4>
                <div class="chart-subtitle">By Market Value</div>
              </div>
              <div v-if="portfolio.length > 0" class="pie-chart-container">
                <div ref="portfolioPieChartRef" class="pie-chart"></div>
              </div>
              <div v-else class="no-chart-data">
                <p>No portfolio data available for chart</p>
              </div>
            </div>
          </div>
        </div>

        <!-- K-line Chart Modal -->
        <div v-if="showChart" class="modal-overlay" @click="closeChart">
          <div class="chart-modal" @click.stop>
            <div class="modal-header">
              <div class="modal-title">
                <h2>{{ selectedChartStock.name }}</h2>
                <span class="stock-code">{{ selectedChartStock.code }}</span>
              </div>
              <button class="close-button" @click="closeChart">
                <span>×</span>
              </button>
            </div>
            <div class="modal-content">
              <div class="stock-info-bar">
                <div class="current-quote">
                  <span class="quote-price">${{ selectedChartStock.currentPrice.toFixed(2) }}</span>
                  <span class="quote-change" :class="{ profit: selectedChartStock.changePercent >= 0, loss: selectedChartStock.changePercent < 0 }">
                    {{ selectedChartStock.changePercent >= 0 ? '+' : '' }}{{ selectedChartStock.changePercent.toFixed(2) }}%
                  </span>
                </div>
                <div class="stock-metrics">
                  <div class="metric">
                    <span class="metric-label">High</span>
                    <span class="metric-value">${{ selectedChartStock.yearHigh }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Low</span>
                    <span class="metric-value">${{ selectedChartStock.yearLow }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Volume</span>
                    <span class="metric-value">{{ selectedChartStock.volume }}</span>
                  </div>
                </div>
                <div class="action-buttons">
                  <button class="action-btn buy-btn" @click="goToTrading('buy')">
                    <span>Buy</span>
                  </button>
                  <button class="action-btn sell-btn" @click="goToTrading('sell')">
                    <span>Sell</span>
                  </button>
                </div>
              </div>
              <div ref="chartRef" class="modal-chart"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trading Section -->
      <div v-if="activeTab === 'trading'" class="trading-page">
        <div class="trading-layout">
          <!-- Trading Panel -->
          <div class="trading-panel">
            <div class="panel-header">
              <h3>Trade</h3>
            </div>
            <div class="trading-form-modern">
              <div class="form-section">
                <label class="form-label">Stock Symbol</label>
                <div class="input-container">
                  <input
                    v-model="tradeForm.code"
                    type="text"
                    placeholder="Enter symbol (e.g., AAPL)"
                    class="form-input"
                    @input="searchStock"
                  />
                </div>
              </div>

              <div v-if="selectedStock" class="selected-stock-info">
                <div class="stock-header">
                  <div class="stock-identity">
                    <h4>{{ selectedStock.name }}</h4>
                    <span class="stock-symbol">{{ selectedStock.code }}</span>
                  </div>
                  <div class="stock-quote">
                    <span class="current-price">${{ selectedStock.price.toFixed(2) }}</span>
                    <span class="price-movement" :class="{ profit: selectedStock.change >= 0, loss: selectedStock.change < 0 }">
                      {{ selectedStock.change >= 0 ? '+' : '' }}{{ selectedStock.change.toFixed(2) }}%
                    </span>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">Order Type</label>
                <div class="trade-type-selector">
                  <button
                    :class="['trade-type-btn', 'buy-type', { active: tradeForm.type === 'buy' }]"
                    @click="tradeForm.type = 'buy'"
                  >
                    <span class="btn-icon">📈</span>
                    <span>Buy</span>
                  </button>
                  <button
                    :class="['trade-type-btn', 'sell-type', { active: tradeForm.type === 'sell' }]"
                    @click="tradeForm.type = 'sell'"
                  >
                    <span class="btn-icon">📉</span>
                    <span>Sell</span>
                  </button>
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">Quantity</label>
                <div class="input-container">
                  <input
                    v-model.number="tradeForm.quantity"
                    type="number"
                    placeholder="0"
                    class="form-input"
                  />
                </div>
              </div>

              <div v-if="selectedStock" class="order-summary">
                <div class="summary-row">
                  <span>Estimated Total</span>
                  <span class="summary-value">${{ (selectedStock.price * tradeForm.quantity).toLocaleString() }}</span>
                </div>
                <div v-if="tradeForm.type === 'buy'" class="summary-row">
                  <span>Available Cash</span>
                  <span class="summary-value">${{ userInfo.balance.toLocaleString() }}</span>
                </div>
              </div>

              <button
                class="execute-btn"
                :class="[tradeForm.type, { disabled: !canTrade }]"
                @click="executeTrade"
                :disabled="!canTrade"
              >
                <span v-if="loading">Processing...</span>
                <span v-else>{{ tradeForm.type === 'buy' ? 'Buy' : 'Sell' }} {{ tradeForm.quantity || 0 }} Shares</span>
              </button>
            </div>
          </div>

          <!-- Market Overview -->
          <div class="market-panel">
            <div class="panel-header">
              <h3>Market Overview</h3>
              <div class="update-indicator" :class="{ active: !loading }">
                <span class="indicator-dot"></span>
                <span class="update-text">{{ loading ? 'Updating...' : 'Live' }}</span>
              </div>
            </div>

            <!-- Major Indices -->
            <div class="indices-grid">
              <div
                v-for="index in globalIndices"
                :key="index.symbol"
                class="index-card"
                :class="{ profit: (index.changePercent || 0) >= 0, loss: (index.changePercent || 0) < 0 }"
              >
                <div class="index-header">
                  <div class="index-info">
                    <span class="index-symbol">{{ index.symbol }}</span>
                    <span class="market-badge" :class="getMarketClass(index.symbol)">{{ getMarketCode(index.symbol) }}</span>
                  </div>
                </div>
                <div class="index-name">{{ index.symbol }}</div>
                <div class="index-quote">
                  <div class="index-value">{{ index.price?.toFixed(2) || 'Loading...' }}</div>
                  <div class="index-change" :class="{ profit: (index.changePercent || 0) >= 0, loss: (index.changePercent || 0) < 0 }">
                    <span class="change-percent">{{ (index.changePercent || 0) >= 0 ? '+' : '' }}{{ (index.changePercent || 0).toFixed(2) }}%</span>
                    <span class="change-value">{{ (index.change || 0) >= 0 ? '+' : '' }}{{ (index.change || 0).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Available Stocks -->
            <div class="stocks-section">
              <div class="stocks-header">
                <h4>Popular Stocks</h4>
                <div class="stocks-update-indicator">
                  <span class="indicator-dot"></span>
                  <span class="update-text">Live</span>
                </div>
              </div>
              <div class="stocks-grid">
                <div
                  v-for="stock in popularStocks"
                  :key="stock.code"
                  class="stock-card"
                  @click="selectStock(stock)"
                  :class="{ 
                    selected: selectedStock && selectedStock.code === stock.code,
                    updating: stock.isUpdating 
                  }"
                >
                  <div class="stock-info">
                    <div class="stock-symbol">{{ stock.code }}</div>
                    <div class="stock-name">{{ stock.name }}</div>
                  </div>
                  <div class="stock-quote">
                    <div class="stock-price">${{ stock.price.toFixed(2) }}</div>
                    <div class="stock-change" :class="{ profit: stock.change >= 0, loss: stock.change < 0 }">
                      {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Section -->
      <div v-if="activeTab === 'profile'" class="profile-page">
        <div class="profile-layout">
          <div class="profile-card-modern">
            <div class="profile-header-modern">
              <div class="user-avatar-large">{{ userInfo.name.charAt(0) }}</div>
              <div class="user-details-modern">
                <h2>{{ userInfo.name }}</h2>
                <p class="user-id">ID: {{ userInfo.id }}</p>
                <p class="join-date">Member since {{ userInfo.registerDate }}</p>
              </div>
              <div class="profile-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ portfolio.length }}</div>
                  <div class="stat-label">Holdings</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userInfo.riskLevel }}</div>
                  <div class="stat-label">Risk Level</div>
                </div>
              </div>
            </div>

            <div class="account-overview">
              <div class="overview-grid">
                <div class="overview-item">
                  <div class="item-label">Total Balance</div>
                  <div class="item-value primary">${{ userInfo.balance.toLocaleString() }}</div>
                </div>
                <div class="overview-item">
                  <div class="item-label">Total Assets</div>
                  <div class="item-value primary">${{ totalAssets.toLocaleString() }}</div>
                </div>
                <div class="overview-item">
                  <div class="item-label">Today's P&L</div>
                  <div class="item-value" :class="{ profit: todayPnL >= 0, loss: todayPnL < 0 }">
                    {{ todayPnL >= 0 ? '+' : '' }}${{ Math.abs(todayPnL).toLocaleString() }}
                  </div>
                </div>
                <div class="overview-item">
                  <div class="item-label">Total Profit</div>
                  <div class="item-value" :class="{ profit: userInfo.totalProfit >= 0, loss: userInfo.totalProfit < 0 }">
                    {{ userInfo.totalProfit >= 0 ? '+' : '' }}${{ Math.abs(userInfo.totalProfit || 0).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>

            <div class="trading-history-modern">
              <div class="history-header">
                <h4>Recent Transactions</h4>
                <span class="history-count">{{ tradingHistory.length }} records</span>
              </div>
              <div class="history-list-modern">
                <div
                  v-for="record in tradingHistory"
                  :key="record.id"
                  class="history-item-modern"
                >
                  <div class="transaction-info">
                    <div class="transaction-symbol">{{ record.stockCode }}</div>
                    <div class="transaction-name">{{ record.stockName }}</div>
                  </div>
                  <div class="transaction-details">
                    <div class="transaction-type" :class="record.type">
                      {{ record.type === 'buy' ? 'BUY' : 'SELL' }}
                    </div>
                    <div class="transaction-amount">
                      {{ record.quantity }} × ${{ record.price.toFixed(2) }}
                    </div>
                  </div>
                  <div class="transaction-meta">
                    <div class="transaction-total">${{ (record.quantity * record.price).toLocaleString() }}</div>
                    <div class="transaction-date">{{ record.date }}</div>
                  </div>
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
import * as echarts from "echarts";

export default {
  name: "Portfolio",
  data() {
    return {
      // API配置
      API_BASE_URL: "http://localhost:3000/api",
      loading: false,
      error: null,
      lastUpdateTime: null,
      isDarkMode: false,
      
      // Global indices rotation
      currentTickerIndex: 0,
      tickerRotationInterval: null,
      globalIndicesUpdateInterval: null,
      globalIndices: [
        { symbol: 'S&P 500', code: 'SPY', price: null, change: null, changePercent: null },
        { symbol: 'NASDAQ', code: 'QQQ', price: null, change: null, changePercent: null },
        { symbol: 'DOW', code: 'DIA', price: null, change: null, changePercent: null },
        { symbol: 'FTSE 100', code: 'ISF.L', price: null, change: null, changePercent: null },
        { symbol: 'DAX', code: 'DAX', price: null, change: null, changePercent: null },
        { symbol: 'CAC 40', code: 'CAC', price: null, change: null, changePercent: null },
        { symbol: 'Nikkei', code: 'N225', price: null, change: null, changePercent: null },
        { symbol: 'Hang Seng', code: 'HSI', price: null, change: null, changePercent: null },
        { symbol: 'Shanghai', code: 'SSEC', price: null, change: null, changePercent: null },
        { symbol: 'ASX 200', code: 'XJO.AX', price: null, change: null, changePercent: null },
        { symbol: 'TSX', code: 'GSPTSE', price: null, change: null, changePercent: null },
        { symbol: 'BSE Sensex', code: 'SENSEX', price: null, change: null, changePercent: null }
      ],

      activeTab: "portfolio",
      tabs: [
        { id: "portfolio", name: "Holdings" },
        { id: "trading", name: "Trading" },
        { id: "profile", name: "Profile" },
      ],
      userInfo: {
        id: "U123456789",
        name: "Portfolio User",
        balance: 0,
        registerDate: "2023-01-15",
        riskLevel: "Conservative",
        initialBalance: 0,
        totalAssets: 0,
        totalProfit: 0,
        profitPercentage: 0,
      },
      portfolio: [],
      availableStocks: [],
      majorIndices: [
        {
          code: "HSI",
          name: "Hang Seng Index",
          market: "HK",
          symbol: "^HSI",
          value: 17250.35,
          changeValue: 125.4,
          change: 0.73,
        },
        {
          code: "SPX",
          name: "S&P 500",
          market: "US",
          symbol: "SPX",
          value: 4450.25,
          changeValue: -15.3,
          change: -0.34,
        },
      ],
      // API配置
      apiConfig: {
        alphaVantage: {
          apiKey: "2KCGOWSHXJ371ZHF", // 需要注册获取
          baseUrl: "https://www.alphavantage.co/query",
        },
        yahooFinance: {
          baseUrl: "https://query1.finance.yahoo.com/v8/finance/chart",
        },
      },
      tradeForm: {
        code: "",
        type: "buy",
        quantity: 0,
      },
      selectedStock: null,
      showChart: false,
      selectedChartStock: null,
      chartInstance: null,
      assetChartInstance: null,
      portfoliePieChartInstance: null,
      updateInterval: null, // 用于存储定时器ID
      selectedTimeRange: "ytd", // 默认选择年初至今
      timeRanges: [
        // { id: 'today', name: 'Today', days: 1 },
        { id: "5d", name: "5D", days: 5 },
        { id: "1m", name: "1M", days: 30 },
        { id: "ytd", name: "YTD", days: 208 }, // 年初至今约208个交易日
        // { id: 'custom', name: 'Custom', days: 0 }
      ],
      tradingHistory: [],
      
      // 热门股票数据（从后端获取）
      popularStocks: [],
      popularStocksUpdateInterval: null,
    };
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
      return totalCost > 0
        ? ((this.holdingsValue - totalCost) / totalCost) * 100
        : 0;
    },
    portfolioComposition() {
      if (!this.portfolio || this.portfolio.length === 0) return [];
      
      const totalValue = this.holdingsValue;
      if (totalValue === 0) return [];
      
      // Color palette for the pie chart
      const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6',
        '#6366f1', '#eab308', '#f43f5e', '#22c55e', '#a855f7'
      ];
      
      return this.portfolio.map((stock, index) => {
        const marketValue = (stock.currentPrice || 0) * (stock.shares || 0);
        const percentage = (marketValue / totalValue) * 100;
        
        return {
          code: stock.code,
          name: stock.name,
          value: marketValue,
          percentage: percentage,
          color: colors[index % colors.length]
        };
      }).sort((a, b) => b.value - a.value); // Sort by value descending
    },
    canTrade() {
      if (!this.selectedStock || !this.tradeForm.quantity) return false;

      if (this.tradeForm.type === "buy") {
        return (
          this.userInfo.balance >=
          this.selectedStock.price * this.tradeForm.quantity
        );
      } else {
        const holding = this.portfolio.find(
          (p) => p.code === this.selectedStock.code
        );
        return holding && holding.shares >= this.tradeForm.quantity;
      }
    },
  },
  methods: {
    // Get tab icons
    getTabIcon(tabId) {
      const icons = {
        portfolio: '💼',
        trading: '📊',
        profile: '👤'
      };
      return icons[tabId] || '📄';
    },

    // Toggle theme
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
    },

    // Global indices rotation methods
    startTickerRotation() {
      // Rotate every 3 seconds
      this.tickerRotationInterval = setInterval(() => {
        this.currentTickerIndex = (this.currentTickerIndex + 1) % this.globalIndices.length;
      }, 3000);
    },

    stopTickerRotation() {
      if (this.tickerRotationInterval) {
        clearInterval(this.tickerRotationInterval);
        this.tickerRotationInterval = null;
      }
    },

    async fetchGlobalIndices() {
      try {
        console.log("[API] Fetching global indices data...");
        
        // Use Promise.allSettled to fetch all indices in parallel
        const promises = this.globalIndices.map(index => this.fetchSingleIndexData(index));
        const results = await Promise.allSettled(promises);
        
        // Update the indices with fetched data
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            Object.assign(this.globalIndices[index], result.value);
          } else {
            // Fallback to simulated data if API fails
            this.simulateGlobalIndexData(this.globalIndices[index]);
          }
        });
        
        console.log("[API] Global indices updated:", this.globalIndices);
      } catch (error) {
        console.error("[API] Error fetching global indices:", error);
        // Use simulated data as fallback
        this.globalIndices.forEach(index => this.simulateGlobalIndexData(index));
      }
    },

    async fetchSingleIndexData(index) {
      try {
        // Use Yahoo Finance API as primary source
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${index.code}?interval=1d&range=2d`,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const quotes = result.indicators?.quote?.[0];
          
          if (meta && quotes) {
            const currentPrice = meta.regularMarketPrice || meta.previousClose;
            const previousClose = meta.previousClose || meta.chartPreviousClose;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            return {
              price: currentPrice,
              change: change,
              changePercent: changePercent
            };
          }
        }
        
        throw new Error('Invalid data format');
      } catch (error) {
        console.warn(`Failed to fetch data for ${index.symbol}:`, error);
        
        // Try alternative API endpoint
        try {
          const altResponse = await fetch(
            `https://api.twelvedata.com/quote?symbol=${index.code}&apikey=demo`,
            { timeout: 5000 }
          );
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.price && altData.percent_change) {
              return {
                price: parseFloat(altData.price),
                change: parseFloat(altData.change),
                changePercent: parseFloat(altData.percent_change)
              };
            }
          }
        } catch (altError) {
          console.warn(`Alternative API also failed for ${index.symbol}`);
        }
        
        return null;
      }
    },

    simulateGlobalIndexData(index) {
      // Generate realistic-looking data for demo purposes
      const basePrice = index.price || this.getBasePrice(index.symbol);
      const randomChange = (Math.random() - 0.5) * 0.04; // ±2%
      const newPrice = basePrice * (1 + randomChange);
      const change = newPrice - basePrice;
      const changePercent = (change / basePrice) * 100;
      
      index.price = parseFloat(newPrice.toFixed(2));
      index.change = parseFloat(change.toFixed(2));
      index.changePercent = parseFloat(changePercent.toFixed(2));
    },

    getBasePrice(symbol) {
      // Realistic base prices for different indices
      const basePrices = {
        'S&P 500': 4500,
        'NASDAQ': 370,
        'DOW': 350,
        'FTSE 100': 7500,
        'DAX': 16000,
        'CAC 40': 7200,
        'Nikkei': 33000,
        'Hang Seng': 17500,
        'Shanghai': 3100,
        'ASX 200': 7400,
        'TSX': 21000,
        'BSE Sensex': 65000
      };
      return basePrices[symbol] || 1000;
    },

    startGlobalIndicesUpdates() {
      // Initial fetch
      this.fetchGlobalIndices();
      
      // Update every 10 seconds
      this.globalIndicesUpdateInterval = setInterval(() => {
        this.fetchGlobalIndices();
      }, 10000);
    },

    stopGlobalIndicesUpdates() {
      if (this.globalIndicesUpdateInterval) {
        clearInterval(this.globalIndicesUpdateInterval);
        this.globalIndicesUpdateInterval = null;
      }
    },

    // 随机更新热门股票数据
    updatePopularStocks() {
      // 随机选择1-3只股票进行更新
      const numToUpdate = Math.floor(Math.random() * 3) + 5; // 1-3只
      const indicesToUpdate = [];
      
      // 随机选择要更新的股票索引
      while (indicesToUpdate.length < numToUpdate) {
        const randomIndex = Math.floor(Math.random() * this.popularStocks.length);
        if (!indicesToUpdate.includes(randomIndex)) {
          indicesToUpdate.push(randomIndex);
        }
      }

      // 更新选中的股票
      indicesToUpdate.forEach(index => {
        const stock = this.popularStocks[index];
        
        // 生成更真实的价格变化（-0.5% 到 +0.5%）
        const priceChangePercent = (Math.random() - 0.5) * 1; // -0.5% 到 +0.5%
        const priceChange = stock.price * (priceChangePercent / 100);
        
        // 更新价格，保留两位小数
        stock.price = Math.max(0.01, parseFloat((stock.price + priceChange).toFixed(2)));
        
        // 生成更真实的涨跌幅变化（-0.3% 到 +0.3%）
        const changeVariation = (Math.random() - 0.5) * 0.6; // -0.3% 到 +0.3%
        stock.change = Math.max(-5, Math.min(5, parseFloat((stock.change + changeVariation).toFixed(2)))); // 限制在-5%到+5%之间
        
        // 添加动画效果
        stock.isUpdating = true;
        setTimeout(() => {
          stock.isUpdating = false;
        }, 500);
      });

      console.log(`[Popular Stocks] Updated ${numToUpdate} stocks randomly`);
    },

    // 启动热门股票实时更新
    startPopularStocksUpdates() {
      // 只有在有数据的情况下才开始更新
      if (this.popularStocks.length === 0) {
        console.log("[Popular Stocks] No data available, skipping updates");
        return;
      }
      
      // 立即更新一次
      this.updatePopularStocks();
      
      // 使用递归的setTimeout来实现随机间隔
      const scheduleNextUpdate = () => {
        const randomDelay = Math.random() * 4000 + 2000; // 2-6秒随机间隔
        this.popularStocksUpdateInterval = setTimeout(() => {
          this.updatePopularStocks();
          scheduleNextUpdate(); // 递归调用，安排下一次更新
        }, randomDelay);
      };
      
      scheduleNextUpdate();
    },

    // 停止热门股票更新
    stopPopularStocksUpdates() {
      if (this.popularStocksUpdateInterval) {
        clearInterval(this.popularStocksUpdateInterval);
        this.popularStocksUpdateInterval = null;
      }
    },

    // 标签页切换方法
    switchTab(tabId) {
      console.log("[switchTab] Switching from", this.activeTab, "to", tabId);
      this.activeTab = tabId;
      console.log("[switchTab] activeTab is now:", this.activeTab);
    },

    // 获取市场代码
    getMarketCode(symbol) {
      const marketMap = {
        'S&P 500': 'US',
        'NASDAQ': 'US', 
        'DOW': 'US',
        'FTSE 100': 'UK',
        'DAX': 'DE',
        'CAC 40': 'FR',
        'Nikkei': 'JP',
        'Hang Seng': 'HK',
        'Shanghai': 'CN',
        'ASX 200': 'AU',
        'TSX': 'CA',
        'BSE Sensex': 'IN'
      };
      return marketMap[symbol] || 'US';
    },

    // 获取市场样式类
    getMarketClass(symbol) {
      const marketCode = this.getMarketCode(symbol);
      return marketCode.toLowerCase();
    },

    // API数据获取方法
    async fetchAccountInfo() {
      try {
        console.log("[API] Fetching account info from:", `${this.API_BASE_URL}/account`);
        const response = await fetch(`${this.API_BASE_URL}/account`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        console.log("[API] Account data received:", data);

        // 更新用户信息
        this.userInfo.balance = data.currentBalance || 0;
        this.userInfo.totalAssets = data.totalAssets || 0;
        this.userInfo.initialBalance = data.initialBalance || 0;
        this.userInfo.totalProfit = data.totalProfit || 0;
        this.userInfo.profitPercentage = data.profitPercentage || 0;

        console.log("[API] 账户信息已更新:", {
          balance: this.userInfo.balance,
          totalAssets: this.userInfo.totalAssets,
          totalProfit: this.userInfo.totalProfit
        });
      } catch (err) {
        console.error("[API] 获取账户信息失败:", err);
        this.error = "Failed to fetch account info";
        throw err;
      }
    },

    async fetchPortfolio() {
      try {
        console.log("[API] Fetching portfolio from:", `${this.API_BASE_URL}/portfolio`);
        const response = await fetch(`${this.API_BASE_URL}/portfolio`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        console.log("[API] Portfolio data received:", data);

        // 转换后端数据格式为前端格式
        this.portfolio = (data.holdings || []).map((holding) => ({
          code: holding.ticker || "",
          name: holding.name || "Unknown",
          shares: Number(holding.quantity) || 0,
          currentPrice: Number(holding.currentPrice) || 0,
          changePercent: Number(holding.profitPercentage) || 0,
          costPrice: Number(holding.costPrice) || 0,
          pnl: Number(holding.profit) || 0,
          yearHigh: Number(holding.currentPrice) * 1.2 || 0, // 估算年高
          yearLow: Number(holding.currentPrice) * 0.8 || 0, // 估算年低
          volume: "1.2M", // 占位符
        }));

        console.log("[API] 持仓信息已更新:", this.portfolio);
        
        // Update pie chart when portfolio data changes
        this.$nextTick(() => {
          this.initPortfoliePieChart();
        });
      } catch (err) {
        console.error("[API] 获取持仓信息失败:", err);
        this.error = "Failed to fetch portfolio";
        throw err;
      }
    },

    async fetchMarketData() {
      try {
        console.log("[API] Fetching market data from:", `${this.API_BASE_URL}/market`);
        const response = await fetch(`${this.API_BASE_URL}/market`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        console.log("[API] Market data received:", data);

        // 转换后端数据格式为前端格式
        this.availableStocks = (data.stocks || []).map((stock) => ({
          code: stock.ticker || "",
          name: stock.name || "Unknown",
          price: Number(stock.currentPrice) || 0,
          change: Number(stock.changePercentage) || 0,
        }));

        // 设置热门股票数据（从后端数据中获取）
        this.popularStocks = (data.stocks || []).map((stock) => ({
          code: stock.ticker || "",
          name: stock.name || "Unknown",
          price: Number(stock.currentPrice) || 0,
          change: Number(stock.changePercentage) || 0,
          isUpdating: false
        }));

        console.log("[API] 市场数据已更新:", this.availableStocks);
        console.log("[API] 热门股票数据已更新:", this.popularStocks);
      } catch (err) {
        console.error("[API] 获取市场数据失败:", err);
        this.error = "Failed to fetch market data";
        throw err;
      }
    },

    async loadAllData() {
      this.loading = true;
      this.error = null;
      
      console.log("[API] Starting to load all data from backend...");
      console.log("[API] API Base URL:", this.API_BASE_URL);

      try {
        await Promise.all([
          this.fetchAccountInfo(),
          this.fetchPortfolio(),
          this.fetchMarketData(),
          this.fetchTradingHistory(),
        ]);
        this.lastUpdateTime = new Date();
        console.log("[API] All data loaded successfully at:", this.lastUpdateTime.toLocaleTimeString());
        
        // 数据加载完成后启动热门股票更新
        this.startPopularStocksUpdates();
      } catch (err) {
        console.error("[API] 加载数据失败:", err);
        this.error = "Failed to load data from backend. Please check if the backend server is running.";
      } finally {
        this.loading = false;
      }
    },

    async fetchTradingHistory() {
      try {
        console.log("[API] Attempting to fetch trading history...");
        // Try to fetch from a dedicated trading history endpoint
        const response = await fetch(`${this.API_BASE_URL}/trades`);
        if (response.ok) {
          const data = await response.json();
          console.log("[API] Trading history data received:", data);
          
          // Transform the data to match our UI format
          this.tradingHistory = (data.trades || []).map((trade, index) => ({
            id: trade.id || index + 1,
            stockCode: trade.ticker || trade.symbol || "",
            stockName: trade.stockName || trade.name || "Unknown",
            type: trade.type || (trade.action === 'BUY' ? 'buy' : 'sell'),
            quantity: Number(trade.quantity) || 0,
            price: Number(trade.price) || 0,
            date: trade.timestamp || trade.date || new Date().toISOString(),
          }));
          
          console.log("[API] Trading history updated:", this.tradingHistory);
        } else {
          // If trading history endpoint doesn't exist, try to get it from account info
          console.log("[API] No dedicated trading history endpoint, checking account info...");
          
          // For now, we'll use mock data as fallback since the backend might not have this endpoint yet
          if (this.tradingHistory.length === 0) {
            this.tradingHistory = [
              {
                id: 1,
                stockCode: "600036",
                stockName: "China Merchants Bank",
                type: "buy",
                quantity: 500,
                price: 37.8,
                date: "2025-07-27 14:30",
              },
              {
                id: 2,
                stockCode: "000858", 
                stockName: "Wuliangye",
                type: "buy",
                quantity: 200,
                price: 168.0,
                date: "2025-07-26 10:15",
              },
              {
                id: 3,
                stockCode: "000002",
                stockName: "China Vanke", 
                type: "sell",
                quantity: 500,
                price: 9.1,
                date: "2025-07-25 15:45",
              },
            ];
            console.log("[API] Using fallback trading history data");
          }
        }
      } catch (err) {
        console.error("[API] 获取交易历史失败:", err);
        // Use fallback data on error
        if (this.tradingHistory.length === 0) {
          this.tradingHistory = [
            {
              id: 1,
              stockCode: "SAMPLE",
              stockName: "Sample Stock",
              type: "buy",
              quantity: 100,
              price: 50.0,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          ];
        }
      }
    },

    async executeTradeAPI(tradeData) {
      try {
        const endpoint = tradeData.type === "buy" ? "/trade/buy" : "/trade/sell";
        const url = `${this.API_BASE_URL}${endpoint}`;
        
        console.log("[API] Executing trade:", tradeData);
        console.log("[API] Trade endpoint:", url);
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticker: tradeData.code,
            quantity: tradeData.quantity,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        console.log("[API] 交易执行成功:", result);

        // 重新加载数据以反映交易结果
        await this.loadAllData();

        return result;
      } catch (err) {
        console.error("[API] 交易执行失败:", err);
        throw err;
      }
    },

    searchStock() {
      const stock = this.availableStocks.find(
        (s) => s.code === this.tradeForm.code
      );
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
        this.loading = true;

        // 调用API执行交易
        const result = await this.executeTradeAPI({
          code: stock.code,
          type: type,
          quantity: quantity,
        });

        // 显示交易成功信息
        alert(
          `${type === "buy" ? "买入" : "卖出"}成功！\n股票: ${
            stock.name
          }\n数量: ${quantity}\n金额: $${(stock.price * quantity).toFixed(2)}`
        );

        // 清空表单
        this.tradeForm = {
          code: "",
          type: "buy",
          quantity: 0,
        };
        this.selectedStock = null;
      } catch (err) {
        alert(`交易失败: ${err.message}`);
      } finally {
        this.loading = false;
      }
    },

    // 更新指数数据
    async updateIndicesData() {
      try {
        // 显示加载状态
        this.lastUpdateTime = new Date();

        // 使用Promise.allSettled来并行请求所有指数，即使某些失败也继续其他请求
        const promises = this.majorIndices.map((index) =>
          this.fetchIndexData(index)
        );
        const results = await Promise.allSettled(promises);

        // 处理结果
        results.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value) {
            // 成功获取数据，更新指数
            const updatedData = result.value;
            Object.assign(this.majorIndices[index], updatedData);
          } else {
            // API请求失败，使用模拟数据
            console.warn(
              `Failed to fetch data for ${this.majorIndices[index].code}, using simulated data`
            );
            this.simulateIndexData(this.majorIndices[index]);
          }
        });

        console.log(
          "Indices data updated at:",
          this.lastUpdateTime.toLocaleTimeString()
        );
      } catch (error) {
        console.error("Error updating indices data:", error);
        // 如果API完全失败，回退到模拟数据
        this.majorIndices.forEach((index) => this.simulateIndexData(index));
      }
    },

    // 获取单个指数数据
    async fetchIndexData(index) {
      try {
        // 根据市场选择不同的API
        if (index.market === "US") {
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

      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        throw new Error("Alpha Vantage API key not configured");
      }

      const url = `${baseUrl}?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data["Error Message"] || data["Note"]) {
        throw new Error(data["Error Message"] || data["Note"]);
      }

      const quote = data["Global Quote"];
      if (!quote) {
        throw new Error("No quote data available");
      }

      const currentPrice = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = parseFloat(
        quote["10. change percent"].replace("%", "")
      );

      return {
        value: currentPrice,
        changeValue: change,
        change: changePercent,
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
        change: changePercent,
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
      console.log("Generated asset trend data:", trendData);

      const option = {
        grid: {
          left: "3%",
          right: "3%",
          bottom: "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: trendData.dates,
          axisLine: { show: true },
          axisTick: { show: false },
          axisLabel: {
            color: "#666",
            fontSize: 12,
            formatter: function (value) {
              // if (value.includes("-01") || value.includes("-28")) {
              //   return value.substring(5); // 只显示月/日
              // }
              // return "";
              return value.substring(5); // 只显示月/日
            },
          },
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          show: true,
          splitLine: { show: false },
          scale: true,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "transparent",
          textStyle: {
            color: "#fff",
            fontSize: 12,
          },
          formatter: function (params) {
            const data = params[0];
            return `
              <div style="padding: 5px;">
                <div>${data.axisValue}</div>
                <div style="margin-top: 5px;">
                  <span style="color: #ff9500;">Net Assets: $${data.value.toLocaleString()}</span>
                </div>
              </div>
            `;
          },
        },
        series: [
          {
            type: "line",
            data: trendData.values,
            smooth: true,
            symbol: "none",
            lineStyle: {
              color: "#ff9500",
              width: 2,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(255, 149, 0, 0.3)" },
                { offset: 1, color: "rgba(255, 149, 0, 0.1)" },
              ]),
            },
          },
        ],
      };

      this.assetChartInstance.setOption(option);

      // 监听窗口大小变化
      window.addEventListener("resize", () => {
        if (this.assetChartInstance) {
          this.assetChartInstance.resize();
        }
      });
    },

    generateAssetTrendData() {
      const selectedRange = this.timeRanges.find(
        (r) => r.id === this.selectedTimeRange
      );
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
        const dateStr = date.toISOString().split("T")[0];
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

    // Portfolio Pie Chart initialization
    initPortfoliePieChart() {
      if (!this.$refs.portfolioPieChartRef || this.portfolioComposition.length === 0) return;

      if (this.portfoliePieChartInstance) {
        this.portfoliePieChartInstance.dispose();
      }

      this.portfoliePieChartInstance = echarts.init(this.$refs.portfolioPieChartRef);

      const pieData = this.portfolioComposition.map(stock => ({
        name: stock.code,
        value: stock.value,
        itemStyle: {
          color: stock.color
        }
      }));

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          formatter: function (params) {
            return `
              <div style="padding: 5px;">
                <div>${params.name}</div>
                <div style="margin-top: 5px;">
                  <span style="color: ${params.color};">●</span>
                  Value: $${params.value.toLocaleString()}
                </div>
                <div>Percentage: ${params.percent}%</div>
              </div>
            `;
          }
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          }
        }]
      };

      this.portfoliePieChartInstance.setOption(option);

      // Handle window resize
      window.addEventListener("resize", () => {
        if (this.portfoliePieChartInstance) {
          this.portfoliePieChartInstance.resize();
        }
      });
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
      this.activeTab = "trading";

      // 填入股票信息
      this.tradeForm.code = this.selectedChartStock.code;
      this.tradeForm.type = type;

      // 根据股票代码查找对应的股票信息
      const stock = this.availableStocks.find(
        (s) => s.code === this.selectedChartStock.code
      );
      if (stock) {
        this.selectedStock = stock;
      } else {
        // 如果在可交易股票列表中没找到，创建一个临时的股票对象
        this.selectedStock = {
          code: this.selectedChartStock.code,
          name: this.selectedChartStock.name,
          price: this.selectedChartStock.currentPrice,
          change: this.selectedChartStock.changePercent,
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
          left: "center",
          textStyle: {
            color: "#333",
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
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
          },
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "15%",
        },
        xAxis: {
          type: "category",
          data: klineData.dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: "dataMin",
          max: "dataMax",
        },
        yAxis: {
          scale: true,
          splitArea: {
            show: true,
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 50,
            end: 100,
          },
          {
            show: true,
            type: "slider",
            top: "90%",
            start: 50,
            end: 100,
          },
        ],
        series: [
          {
            name: "K-line Chart",
            type: "candlestick",
            data: klineData.values,
            itemStyle: {
              color: "#ef232a",
              color0: "#14b143",
              borderColor: "#ef232a",
              borderColor0: "#14b143",
            },
          },
        ],
      };

      this.chartInstance.setOption(option);

      // 监听窗口大小变化
      window.addEventListener("resize", () => {
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
        dates.push(date.toISOString().split("T")[0]);

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
          volume,
        ]);
      }

      return { dates, values };
    },
  },

  mounted() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      this.isDarkMode = JSON.parse(savedTheme);
    }

    // 首先加载所有API数据
    this.loadAllData();

    this.$nextTick(() => {
      this.initAssetChart();
      this.initPortfoliePieChart();
    });

    // 启动实时数据更新
    this.startRealTimeUpdates();
    
    // Start global indices rotation and updates
    this.startTickerRotation();
    this.startGlobalIndicesUpdates();
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
    if (this.portfoliePieChartInstance) {
      this.portfoliePieChartInstance.dispose();
    }

    // 清理定时器
    this.stopRealTimeUpdates();
    
    // Stop global indices updates and rotation
    this.stopTickerRotation();
    this.stopGlobalIndicesUpdates();
    
    // Stop popular stocks updates
    this.stopPopularStocksUpdates();
  },
};
</script>

<style scoped>
:root {
  /* Dark mode colors (default) */
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --bg-card: #1a1a1a; 
  --bg-header: #1a1a1a;
  --bg-sidebar: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #666666;
  --border-color: #333333;
  --accent-green: #00c851;
  --accent-red: #ff4444;
  --accent-blue: #007bff;
  --hover-color: rgba(255, 255, 255, 0.1);
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.futu-trading-app.light-mode {
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-header: #ffffff;
  --bg-sidebar: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #34495e;
  --text-muted: #7f8c8d;
  --border-color: #e9ecef;
  --accent-green: #27ae60;
  --accent-red: #e74c3c;
  --accent-blue: #3498db;
  --hover-color: rgba(52, 73, 94, 0.1);
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Modern Futu-like Design System */
.futu-trading-app {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Header Styles */
.app-header {
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow);
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
  color: var(--accent-blue);
}

.logo-icon {
  font-size: 24px;
}

.main-nav {
  display: flex;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: var(--hover-color);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
}

.nav-icon {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Global Indices Ticker */
.global-indices-ticker {
  min-width: 200px;
  height: 32px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  position: relative;
}

.ticker-container {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.ticker-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s ease-in-out;
  font-size: 12px;
  white-space: nowrap;
}

.ticker-item.active {
  opacity: 1;
  transform: translateY(0);
}

.ticker-symbol {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 8px;
}

.ticker-value {
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 6px;
}

.ticker-change {
  font-weight: 600;
  font-size: 11px;
}

.ticker-change.profit {
  color: var(--accent-green);
}

.ticker-change.loss {
  color: var(--accent-red);
}

.market-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-red);
}

.status-indicator.active {
  background: var(--accent-green);
  animation: pulse 2s infinite;
}

.error-message {
  background: var(--bg-secondary);
  color: var(--accent-red);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  max-width: 200px;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance-display {
  text-align: right;
}

.balance-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-green);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

/* Main Container */
.main-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

/* Portfolio Page */
.portfolio-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.overview-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.overview-card.main-card {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  opacity: 0.8;
}

.time-period {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.primary-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.secondary-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.secondary-value.profit {
  color: #16a34a;
}

.secondary-value.loss {
  color: #dc2626;
}

.value-change {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.value-change.profit {
  color: #22c55e;
}

.value-change.loss {
  color: #ef4444;
}

/* Chart Section */
.chart-section {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.chart-container-modern {
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.chart-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.chart-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-assets {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.daily-pnl {
  font-size: 16px;
  font-weight: 600;
}

.daily-pnl.profit {
  color: var(--accent-green);
}

.daily-pnl.loss {
  color: var(--accent-red);
}

.time-selector {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 8px;
}

.time-btn {
  padding: 6px 12px;
  border: none;
  background: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  color: var(--text-primary);
  background: var(--hover-color);
}

.time-btn.active {
  background: var(--accent-blue);
  color: white;
  box-shadow: var(--shadow);
}

.modern-chart {
  height: 320px;
  width: 100%;
}

/* Loading, Empty, and Error States */
.loading-state, .empty-state, .error-state {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: var(--accent-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 12px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Holdings Section */
.holdings-section {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.holdings-content {
  display: flex;
  gap: 24px;
  padding: 0;
}

.holdings-table-container {
  flex: 1;
  min-width: 0; /* Ensures table can shrink */
}

.pie-chart-container {
  width: 300px;
  padding: 20px;
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.pie-chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.pie-chart {
  height: 250px;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.holdings-summary {
  font-size: 14px;
  color: var(--text-muted);
}

.holdings-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 100px 100px 80px 120px 100px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-cell {
  padding: 16px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-body {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 100px 100px 80px 120px 100px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.table-row:hover {
  background: var(--hover-color);
}

.cell {
  padding: 16px 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.stock-symbol {
  font-weight: 600;
  color: var(--accent-blue);
}

.company-name {
  color: var(--text-muted);
  font-size: 13px;
}

.stock-price, .value-amount {
  font-weight: 600;
  color: var(--text-primary);
}

.price-change, .pnl-amount {
  font-weight: 500;
}

.price-change.profit, .pnl-amount.profit {
  color: var(--accent-green);
}

.price-change.loss, .pnl-amount.loss {
  color: var(--accent-red);
}

.share-count {
  color: var(--text-muted);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.chart-modal {
  background: var(--bg-card);
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  height: 85%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-title h2 {            
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.stock-code {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-muted);
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--hover-color);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stock-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
}

.current-quote {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quote-price {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.quote-change {
  font-size: 16px;
  font-weight: 600;
}

.quote-change.profit {
  color: var(--accent-green);
}

.quote-change.loss {
  color: var(--accent-red);
}

.stock-metrics {
  display: flex;
  gap: 24px;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.buy-btn {
  background: var(--accent-green);
  color: white;
}

.buy-btn:hover {
  background: #00a844;
}

.sell-btn {
  background: var(--accent-red);
  color: white;
}

.sell-btn:hover {
  background: #e33e2e;
}

.modal-chart {
  flex: 1;
  padding: 20px 32px;
}

.quote-change {
  font-size: 16px;
  font-weight: 600;
}

.quote-change.profit {
  color: #16a34a;
}

.quote-change.loss {
  color: #dc2626;
}

.stock-metrics {
  display: flex;
  gap: 24px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.buy-btn {
  background: #dc2626;
  color: white;
}

.buy-btn:hover {
  background: #b91c1c;
}

.sell-btn {
  background: #16a34a;
  color: white;
}

.sell-btn:hover {
  background: #15803d;
}

.modal-chart {
  flex: 1;
  padding: 20px 32px;
  min-height: 400px;
}

/* Trading Page */
.trading-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.trading-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
}

.trading-panel, .market-panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.trading-form-modern {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-stock-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stock-identity h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

.stock-symbol {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stock-quote {
  text-align: right;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.price-movement {
  font-size: 14px;
  font-weight: 500;
}

.price-movement.profit {
  color: #16a34a;
}

.price-movement.loss {
  color: #dc2626;
}

.trade-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.trade-type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.trade-type-btn:hover {
  border-color: #d1d5db;
}

.trade-type-btn.active.buy-type {
  border-color: #dc2626;
  background: #fef2f2;
  color: #dc2626;
}

.trade-type-btn.active.sell-type {
  border-color: #16a34a;
  background: #f0fdf4;
  color: #16a34a;
}

.order-summary {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-value {
  font-weight: 600;
  color: #1a1a1a;
}

.execute-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.execute-btn.buy {
  background: #dc2626;
  color: white;
}

.execute-btn.buy:hover:not(.disabled) {
  background: #b91c1c;
}

.execute-btn.sell {
  background: #16a34a;
  color: white;
}

.execute-btn.sell:hover:not(.disabled) {
  background: #15803d;
}

.execute-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Market Panel */
.update-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dc2626;
}

.update-indicator.active .indicator-dot {
  background: #16a34a;
  animation: pulse 2s infinite;
}

.indices-grid {
  padding: 0 24px 24px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.index-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.index-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.index-card.profit {
  border-left: 3px solid #16a34a;
}

.index-card.loss {
  border-left: 3px solid #dc2626;
}

.index-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.index-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.index-symbol {
  font-weight: 600;
  color: #1a1a1a;
}

.market-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.market-badge.us {
  background: #dbeafe;
  color: #1d4ed8;
}

.market-badge.hk {
  background: #fce7f3;
  color: #be185d;
}

.market-badge.uk {
  background: #fce7f3;
  color: #be185d;
}

.market-badge.de {
  background: #fef3c7;
  color: #d97706;
}

.market-badge.fr {
  background: #dbeafe;
  color: #1d4ed8;
}

.market-badge.jp {
  background: #fce7f3;
  color: #be185d;
}

.market-badge.cn {
  background: #fef2f2;
  color: #dc2626;
}

.market-badge.au {
  background: #f0fdf4;
  color: #16a34a;
}

.market-badge.ca {
  background: #fef3c7;
  color: #d97706;
}

.market-badge.in {
  background: #fef3c7;
  color: #d97706;
}

.index-name {
  font-size: 12px;
  color: #6b7280;
}

.index-quote {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.index-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.index-change {
  text-align: right;
}

.change-percent {
  font-size: 14px;
  font-weight: 600;
}

.change-value {
  font-size: 12px;
  color: #6b7280;
}

.index-change.profit .change-percent {
  color: #16a34a;
}

.index-change.loss .change-percent {
  color: #dc2626;
}

.stocks-section {
  padding: 0 24px 24px 24px;
}

.stocks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stocks-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.stocks-update-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.stocks-update-indicator .indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
  animation: pulse 2s infinite;
}

.stocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  position: relative;
}

.stock-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  transform-origin: center;
  box-sizing: border-box;
}

.stock-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.stock-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.stock-card.updating {
  animation: stockUpdate 0.5s ease-in-out;
  z-index: 10;
  position: relative;
}

@keyframes stockUpdate {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  25% {
    transform: scale(1.05);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 3px 6px rgba(59, 130, 246, 0.2);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4), 0 4px 8px rgba(59, 130, 246, 0.4);
  }
  75% {
    transform: scale(1.05);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 3px 6px rgba(59, 130, 246, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.stock-info {
  margin-bottom: 12px;
}

.stock-symbol {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.stock-name {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.stock-quote {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-price {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.stock-change {
  font-size: 14px;
  font-weight: 500;
}

.stock-change.profit {
  color: #16a34a;
}

.stock-change.loss {
  color: #dc2626;
}

/* Profile Page */
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.profile-card-modern {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.profile-header-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
  color: white;
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
}

.user-details-modern {
  flex: 1;
}

.user-details-modern h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.user-id, .join-date {
  margin: 4px 0;
  opacity: 0.9;
  font-size: 14px;
}

.profile-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.account-overview {
  padding: 32px;
  border-bottom: 1px solid #f3f4f6;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.overview-item {
  text-align: center;
}

.item-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.item-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.item-value.primary {
  color: #3b82f6;
}

.item-value.profit {
  color: #16a34a;
}

.item-value.loss {
  color: #dc2626;
}

.trading-history-modern {
  padding: 32px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.history-count {
  font-size: 14px;
  color: #6b7280;
}

.history-list-modern {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.history-item-modern:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-symbol {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.transaction-name {
  font-size: 12px;
  color: #6b7280;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.transaction-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.transaction-type.buy {
  background: #fef2f2;
  color: #dc2626;
}

.transaction-type.sell {
  background: #f0fdf4;
  color: #16a34a;
}

.transaction-amount {
  font-size: 12px;
  color: #6b7280;
}

.transaction-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.transaction-total {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.transaction-date {
  font-size: 11px;
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .trading-layout {
    grid-template-columns: 1fr;
  }
  
  .overview-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: 80px 1fr 80px 80px 60px 100px 80px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .header-right {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }
  
  .global-indices-ticker {
    min-width: 150px;
    height: 28px;
  }
  
  .ticker-item {
    padding: 0 8px;
    font-size: 11px;
  }
  
  .main-container {
    padding: 16px;
  }
  
  .overview-section {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .header-cell:nth-child(n+5), 
  .cell:nth-child(n+5) {
    display: none;
  }
  
  .holdings-content {
    flex-direction: column;
    gap: 0;
  }
  
  .pie-chart-container {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
  
  .pie-chart {
    height: 200px;
  }
  
  .indices-grid {
    grid-template-columns: 1fr;
  }
  
  .stocks-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header-modern {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-modal {
    width: 95%;
    height: 90%;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .stock-info-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 16px 20px;
  }
  
  .modal-chart {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 16px;
  }
  
  .main-nav {
    gap: 2px;
  }
  
  .nav-item {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .nav-text {
    display: none;
  }
  
  .balance-amount {
    font-size: 14px;
  }
  
  .primary-value {
    font-size: 24px;
  }
  
  .secondary-value {
    font-size: 18px;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

/* Theme Toggle Styles */
.theme-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.theme-toggle:hover {
  background-color: var(--hover-color);
  transform: scale(1.1);
}

/* Theme transition animations */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Scrollbar theming */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
