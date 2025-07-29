<!-- 
  This is an example of how to integrate the API services into your existing portfolio.vue
  You can replace the script section in your portfolio.vue with this code
-->

<script>
import * as echarts from 'echarts'
import { usePortfolio } from './composables/usePortfolio.js'
import apiService from './services/api.js'
import dataService from './services/dataService.js'

export default {
  name: 'Portfolio',
  setup() {
    // Use the portfolio composable for all data management
    const portfolioComposable = usePortfolio();
    
    return {
      ...portfolioComposable
    };
  },
  data() {
    return {
      // UI state
      activeTab: 'portfolio',
      showChart: false,
      selectedChartStock: {},
      selectedStock: null,
      selectedTimeRange: 'Today',
      lastUpdateTime: null,
      updateInterval: null,
      
      // Form data
      tradeForm: {
        code: '',
        type: 'buy',
        quantity: 0
      },
      
      // Chart references
      assetChart: null,
      klineChart: null,
      
      // UI data that doesn't come from API
      tabs: [
        { id: 'portfolio', name: 'Holdings' },
        { id: 'trading', name: 'Trading' },
        { id: 'profile', name: 'Profile' }
      ],
      
      timeRanges: [
        { id: 'Today', name: 'Today' },
        { id: '5D', name: '5D' },
        { id: '1M', name: '1M' },
        { id: 'YTD', name: 'YTD' },
        { id: 'Custom', name: 'Custom' }
      ],
      
      // Sample trading history (you can also fetch this from API)
      tradingHistory: [
        {
          id: 1,
          stockCode: 'AAPL',
          stockName: 'Apple Inc.',
          type: 'buy',
          quantity: 50,
          price: 170.25,
          date: '2024-01-15'
        },
        {
          id: 2,
          stockCode: 'MSFT',
          stockName: 'Microsoft Corporation',
          type: 'buy',
          quantity: 30,
          price: 330.80,
          date: '2024-01-14'
        }
      ]
    }
  },
  
  computed: {
    canTrade() {
      if (!this.selectedStock || !this.tradeForm.quantity || this.tradeForm.quantity <= 0) {
        return false;
      }
      
      if (this.tradeForm.type === 'buy') {
        const totalCost = this.selectedStock.price * this.tradeForm.quantity;
        return this.userInfo.balance >= totalCost;
      }
      
      if (this.tradeForm.type === 'sell') {
        const holding = this.portfolio.find(stock => stock.code === this.selectedStock.code);
        return holding && holding.shares >= this.tradeForm.quantity;
      }
      
      return false;
    }
  },
  
  methods: {
    // ========== API Integration Methods ==========
    
    /**
     * Execute trade using the API service
     */
    async executeTrade() {
      if (!this.canTrade) return;
      
      try {
        const tradeData = {
          symbol: this.selectedStock.code,
          type: this.tradeForm.type,
          quantity: this.tradeForm.quantity,
          price: this.selectedStock.price
        };
        
        // Use the composable method which handles API call and data refresh
        await this.executeTrade(tradeData);
        
        // Reset form
        this.tradeForm = {
          code: '',
          type: 'buy',
          quantity: 0
        };
        this.selectedStock = null;
        
        alert(`${this.tradeForm.type === 'buy' ? 'Purchase' : 'Sale'} successful!`);
        
      } catch (error) {
        alert(`Trade failed: ${error.message}`);
      }
    },
    
    /**
     * Search and select stock
     */
    searchStock() {
      const stock = this.availableStocks.find(s => 
        s.code.toLowerCase() === this.tradeForm.code.toLowerCase()
      );
      this.selectedStock = stock || null;
    },
    
    /**
     * Select stock from available stocks list
     */
    selectStock(stock) {
      this.selectedStock = stock;
      this.tradeForm.code = stock.code;
    },
    
    // ========== Chart Methods (Enhanced with API) ==========
    
    /**
     * Show K-line chart with real API data
     */
    async showKlineChart(stock) {
      this.selectedChartStock = stock;
      this.showChart = true;
      
      this.$nextTick(async () => {
        if (this.$refs.chartRef) {
          // Get real stock history data
          try {
            const historyData = await this.getStockHistory(stock.code, '1Y');
            this.initKlineChart(historyData);
          } catch (error) {
            console.error('Failed to load stock history:', error);
            // Fallback to sample data
            this.initKlineChart([]);
          }
        }
      });
    },
    
    /**
     * Initialize K-line chart with real data
     */
    initKlineChart(historyData = []) {
      if (this.klineChart) {
        this.klineChart.dispose();
      }
      
      this.klineChart = echarts.init(this.$refs.chartRef);
      
      // Use real data if available, otherwise use sample data
      const chartData = historyData.length > 0 ? historyData : this.generateSampleKlineData();
      
      const option = {
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: chartData.map(item => item[0]),
          scale: true,
          splitLine: { show: false },
          axisLabel: {
            formatter: function (value) {
              return echarts.format.formatTime('MM-dd', value);
            }
          }
        },
        yAxis: {
          scale: true,
          splitLine: { show: true }
        },
        series: [
          {
            name: 'K线',
            type: 'candlestick',
            data: chartData.map(item => [item[1], item[2], item[3], item[4]]),
            itemStyle: {
              color: '#ef4444',
              color0: '#22c55e',
              borderColor: '#ef4444',
              borderColor0: '#22c55e'
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function (params) {
            const data = params[0];
            const values = data.data;
            return `
              Date: ${data.name}<br/>
              Open: $${values[0]}<br/>
              Close: $${values[1]}<br/>
              Low: $${values[2]}<br/>
              High: $${values[3]}
            `;
          }
        }
      };
      
      this.klineChart.setOption(option);
    },
    
    /**
     * Initialize asset trend chart with real API data
     */
    async initAssetChart() {
      if (this.assetChart) {
        this.assetChart.dispose();
      }
      
      this.assetChart = echarts.init(this.$refs.assetChartRef);
      
      try {
        // Get real asset trend data
        const trendData = await this.getAssetTrend(this.selectedTimeRange);
        
        const option = {
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: trendData.map(item => item.name),
            axisLine: { show: false },
            axisTick: { show: false }
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: {
              lineStyle: {
                color: '#f0f0f0'
              }
            }
          },
          series: [{
            name: 'Net Assets',
            type: 'line',
            smooth: true,
            data: trendData.map(item => item.value),
            lineStyle: {
              color: '#ff9500',
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 149, 0, 0.3)' },
                { offset: 1, color: 'rgba(255, 149, 0, 0.05)' }
              ])
            }
          }],
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              const data = params[0];
              return `<span style="color: #ff9500;">Net Assets: $${data.value.toLocaleString()}</span>`;
            }
          }
        };
        
        this.assetChart.setOption(option);
      } catch (error) {
        console.error('Failed to load asset trend:', error);
        // Initialize with sample data as fallback
        this.initAssetChartWithSampleData();
      }
    },
    
    /**
     * Change time range and refresh chart
     */
    async changeTimeRange(range) {
      this.selectedTimeRange = range;
      await this.initAssetChart();
    },
    
    /**
     * Close chart modal
     */
    closeChart() {
      this.showChart = false;
      this.selectedChartStock = {};
      if (this.klineChart) {
        this.klineChart.dispose();
        this.klineChart = null;
      }
    },
    
    /**
     * Go to trading tab with pre-filled data
     */
    goToTrading(type) {
      this.activeTab = 'trading';
      this.tradeForm.type = type;
      this.tradeForm.code = this.selectedChartStock.code;
      this.selectedStock = this.availableStocks.find(s => s.code === this.selectedChartStock.code);
      this.closeChart();
    },
    
    // ========== Fallback Methods ==========
    
    /**
     * Generate sample K-line data (fallback when API fails)
     */
    generateSampleKlineData() {
      const data = [];
      const basePrice = this.selectedChartStock.currentPrice || 100;
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      for (let i = 0; i < 250; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const variation = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + variation);
        const open = price * (1 + (Math.random() - 0.5) * 0.02);
        const close = price * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        
        data.push([
          echarts.format.formatTime('yyyy-MM-dd', date),
          open.toFixed(2),
          close.toFixed(2),
          low.toFixed(2),
          high.toFixed(2)
        ]);
      }
      
      return data;
    },
    
    /**
     * Initialize asset chart with sample data (fallback)
     */
    initAssetChartWithSampleData() {
      // This method contains the original sample chart initialization code
      // You can keep your existing implementation here
    }
  },
  
  mounted() {
    // The composable handles data initialization
    // Just initialize the asset chart
    this.$nextTick(() => {
      if (this.$refs.assetChartRef) {
        this.initAssetChart();
      }
    });
  },
  
  beforeUnmount() {
    // Cleanup charts
    if (this.assetChart) {
      this.assetChart.dispose();
    }
    if (this.klineChart) {
      this.klineChart.dispose();
    }
    
    // The composable handles cleanup of intervals and API calls
  }
}
</script>

<!-- Your existing template and styles remain the same -->
