const Controller = require('./Controller');
const logger = require('../logger');

class TestController extends Controller {
  /**
   * 测试GET接口
   * @param {Object} request - Express请求对象
   * @param {Object} response - Express响应对象
   */
  static async testGet(request, response) {
    try {
      logger.info('测试GET接口被调用');
      
      const result = {
        message: 'API测试成功',
        timestamp: new Date().toISOString(),
        method: 'GET',
        status: 'success',
        requestInfo: {
          headers: request.headers,
          query: request.query,
          params: request.params
        }
      };

      Controller.sendResponse(response, result);
    } catch (error) {
      logger.error('测试GET接口出错:', error);
      Controller.sendError(response, {
        code: 500,
        error: '服务器内部错误'
      });
    }
  }

  /**
   * 测试POST接口
   * @param {Object} request - Express请求对象
   * @param {Object} response - Express响应对象
   */
  static async testPost(request, response) {
    try {
      logger.info('测试POST接口被调用', { body: request.body });
      
      // 验证请求数据
      if (!request.body) {
        return Controller.sendError(response, {
          code: 400,
          error: '请求数据无效'
        });
      }

      const result = {
        message: '数据接收成功',
        receivedData: request.body,
        timestamp: new Date().toISOString(),
        method: 'POST',
        status: 'success',
        requestInfo: {
          headers: request.headers,
          contentType: request.headers['content-type']
        }
      };

      Controller.sendResponse(response, result);
    } catch (error) {
      logger.error('测试POST接口出错:', error);
      Controller.sendError(response, {
        code: 500,
        error: '服务器内部错误'
      });
    }
  }
}

module.exports = TestController;