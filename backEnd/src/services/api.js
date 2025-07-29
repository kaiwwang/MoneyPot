/**
 * API Service for MoneyPot Backend
 * Base URL: http://localhost:3000/api (Local Backend)
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Generic fetch method with error handling
   */
  async fetchData(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.fetchData(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.fetchData(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.fetchData(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.fetchData(endpoint, { method: 'DELETE' });
  }

  // ========== Specific API Methods ==========

  /**
   * Get user account information
   */
  async getAccountInfo() {
    return this.get('/account');
  }

  /**
   * Get user portfolio/holdings
   */
  async getPortfolio() {
    return this.get('/portfolio');
  }

  /**
   * Get specific stock holding
   */
  async getHolding(ticker) {
    return this.get(`/portfolio/${ticker}`);
  }

  /**
   * Get available stocks in market
   */
  async getMarketStocks() {
    return this.get('/market');
  }

  /**
   * Get specific stock market data
   */
  async getStockData(ticker) {
    return this.get(`/market/${ticker}`);
  }

  /**
   * Get stock historical data
   */
  async getStockHistory(ticker, period = '1M') {
    return this.get(`/market/${ticker}/history?period=${period}`);
  }

  /**
   * Execute a trade (buy/sell)
   */
  async executeTrade(tradeData) {
    return this.post('/trade', tradeData);
  }

  /**
   * Get trade history
   */
  async getTradeHistory() {
    return this.get('/trade/history');
  }

  /**
   * Add funds to account
   */
  async addFunds(amount) {
    return this.post('/account/add-funds', { amount });
  }

  /**
   * Get account balance
   */
  async getBalance() {
    return this.get('/account/balance');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for testing purposes
export { ApiService };
