const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config.env') });

class DatabaseService {
  constructor() {
    // 使用本地数据库URL连接
    const connectionString = process.env.DB_LOCAL_URL || 'postgresql://walker:@localhost:5432/moneypot_db';
    
    this.pool = new Pool({
      connectionString,
      // 本地数据库不需要SSL
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('数据库连接成功:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('数据库连接失败:', error);
      return false;
    }
  }

  /**
   * 获取持仓数据
   */
  async getHoldings() {
    try {
      const query = `
        SELECT 
          stock_code,
          stock_name,
          shares,
          cost_price,
          current_price,
          profit_loss_amount,
          profit_loss_percent,
          investment_status
        FROM holdings
        ORDER BY stock_code
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('获取持仓数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取特定股票持仓
   */
  async getHolding(stockCode) {
    try {
      const query = `
        SELECT 
          stock_code,
          stock_name,
          shares,
          cost_price,
          current_price,
          profit_loss_amount,
          profit_loss_percent,
          investment_status
        FROM holdings
        WHERE stock_code = $1
      `;
      
      const result = await this.pool.query(query, [stockCode]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('获取股票持仓失败:', error);
      throw error;
    }
  }

  /**
   * 获取股票市场数据
   */
  async getStockData(ticker, limit = 1) {
    try {
      const query = `
        SELECT 
          ticker,
          date,
          close,
          raw_close,
          high,
          low,
          open,
          volume
        FROM stocks
        WHERE ticker = $1
        ORDER BY date DESC
        LIMIT $2
      `;
      
      const result = await this.pool.query(query, [ticker, limit]);
      return result.rows;
    } catch (error) {
      console.error('获取股票数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有股票的最新数据
   */
  async getAllLatestStockData() {
    try {
      const query = `
        SELECT DISTINCT ON (ticker)
          ticker,
          date,
          close,
          raw_close,
          high,
          low,
          open,
          volume
        FROM stocks
        ORDER BY ticker, date DESC
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('获取所有股票数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取股票历史数据
   */
  async getStockHistory(ticker, days = 30) {
    try {
      const query = `
        SELECT 
          ticker,
          date,
          close,
          raw_close,
          high,
          low,
          open,
          volume
        FROM stocks
        WHERE ticker = $1
        ORDER BY date DESC
        LIMIT $2
      `;
      
      const result = await this.pool.query(query, [ticker, days]);
      return result.rows;
    } catch (error) {
      console.error('获取股票历史数据失败:', error);
      throw error;
    }
  }

  /**
   * 更新持仓信息
   */
  async updateHolding(stockCode, data) {
    try {
      const query = `
        UPDATE holdings
        SET 
          shares = $1,
          cost_price = $2,
          current_price = $3,
          profit_loss_amount = $4,
          profit_loss_percent = $5,
          investment_status = $6
        WHERE stock_code = $7
      `;
      
      const values = [
        data.shares,
        data.cost_price,
        data.current_price,
        data.profit_loss_amount,
        data.profit_loss_percent,
        data.investment_status,
        stockCode
      ];
      
      const result = await this.pool.query(query, values);
      return result.rowCount > 0;
    } catch (error) {
      console.error('更新持仓失败:', error);
      throw error;
    }
  }

  /**
   * 插入新持仓
   */
  async insertHolding(data) {
    try {
      const query = `
        INSERT INTO holdings (
          stock_code,
          stock_name,
          shares,
          cost_price,
          current_price,
          profit_loss_amount,
          profit_loss_percent,
          investment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      const values = [
        data.stock_code,
        data.stock_name,
        data.shares,
        data.cost_price,
        data.current_price,
        data.profit_loss_amount,
        data.profit_loss_percent,
        data.investment_status
      ];
      
      const result = await this.pool.query(query, values);
      return result.rowCount > 0;
    } catch (error) {
      console.error('插入持仓失败:', error);
      throw error;
    }
  }

  /**
   * 删除持仓
   */
  async deleteHolding(stockCode) {
    try {
      const query = 'DELETE FROM holdings WHERE stock_code = $1';
      const result = await this.pool.query(query, [stockCode]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('删除持仓失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有股票代码
   */
  async getAllTickers() {
    try {
      const query = 'SELECT DISTINCT ticker FROM stocks ORDER BY ticker';
      const result = await this.pool.query(query);
      return result.rows.map(row => row.ticker);
    } catch (error) {
      console.error('获取股票代码失败:', error);
      throw error;
    }
  }

  /**
   * 获取交易历史
   */
  async getTrades() {
    try {
      const query = `
        SELECT 
          stock_code,
          stock_name,
          trade_date,
          trade_type,
          trade_volume,
          trade_price,
          trade_amount,
          total_holdings,
          avg_cost
        FROM trade_records
        ORDER BY trade_date DESC
        LIMIT 100
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      // 如果表不存在，返回空数组而不是抛出错误
      if (error.code === '42P01') {
        console.log('trade_records表不存在，返回空数组');
        return [];
      }
      console.error('获取交易历史失败:', error);
      throw error;
    }
  }

  /**
   * 插入交易记录
   */
  async insertTrade(tradeData) {
    try {
      const query = `
        INSERT INTO trade_records (
          stock_code,
          stock_name,
          trade_date,
          trade_type,
          trade_volume,
          trade_price,
          trade_amount,
          total_holdings,
          avg_cost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING stock_code
      `;
      
      const values = [
        tradeData.ticker,
        tradeData.stockName,
        tradeData.timestamp,
        tradeData.type,
        tradeData.quantity,
        tradeData.price,
        tradeData.totalAmount,
        tradeData.totalHoldings || 0,
        tradeData.avgCost || tradeData.price
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0].stock_code;
    } catch (error) {
      // 如果表不存在，记录错误但不抛出异常
      if (error.code === '42P01') {
        console.log('trade_records表不存在，跳过保存交易记录');
        return null;
      }
      console.error('插入交易记录失败:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = DatabaseService; 