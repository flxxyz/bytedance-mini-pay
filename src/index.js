import { createHash } from 'crypto';
import fetch from 'node-fetch';

export class TTPay {
  API_URL = 'https://developer.toutiao.com/api/apps/ecpay/v1';

  constructor(config) {
    if (!config.appId) { throw Error('config.appId is required'); }
    if (!config.appSecret) { throw Error('config.appSecret is required'); }
    if (!config.SALT) { throw Error('config.SALT is required'); }

    if (!config.notifyURL) { }

    this.config = Object.assign({
      TOKEN: '',
    }, config);
  }

  /**
   * @summary 生成签名
   * @method _genSign
   * @param {object} params 签名的参数们
   * @returns {string} 签名
   */
  _genSign(params) {
    const skipArr = ['app_id', 'thirdparty_id', 'sign'];
    const unsignArr = [];
    for (let key in params) {
      if (skipArr.indexOf(key) != -1) {
        continue;
      }
      unsignArr.push(params[key]);
    }
    unsignArr.push(this.config.SALT);
    return createHash('md5')
      .update(unsignArr.sort().join('&'))
      .digest('hex');
  }


  /**
   * @summary 发送请求
   * @method _request
   * @param {string} uri 请求链接
   * @param {object} body 请求体
   * @returns {Promise} 响应结果
   */
  async _request(uri, body = {}) {
    if (!uri) { throw Error('method is not found'); }

    const opts = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'flxxyz/bytedance-mini-pay',
      },
    };
    return await fetch(`${this.API_URL}${uri}`, opts).then(r => r.json());
  }

  /**
   * @summary 支付下单
   * @method createOrder
   * @param {string} out_order_no 商户内部订单号
   * @param {number} amount 下单金额(单位: 分)
   * @param {string} subject 商品描述
   * @param {string} body 商品详细
   * @param {object} options 额外请求参数
   * @param {number} options.valid_time 过期时间 默认1800s(单位: 秒); 最小 15 分钟，最大两天
   * @param {string} options.cp_extra 开发者自定义字段，回调原样回传
   * @param {string} options.notify_url 商户自定义回调地址
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @param {string} options.disable_msg 是否屏蔽担保支付的推送消息，1-屏蔽 0-非屏蔽，接入 POI 必传
   * @param {string} options.msg_page 担保支付消息跳转页
   * @param {string} options.store_uid 多门店模式下必传，多门店模式下，门店 uid
   * @returns {Promise} -
   */
  async createOrder(out_order_no, amount, subject, body, options = {}) {
    if (!options.valid_time) {
      options.valid_time = 1800;
    }

    const basicParams = {
      app_id: this.config.appId,
      out_order_no,
      total_amount: amount,
      subject,
      body,
      ...options,
    };

    if (!this.config.notifyURL) {
      basicParams.notify_url = this.config.notifyURL;
    }

    const params = {
      ...basicParams,
      sign: this._genSign({ ...basicParams }),
    };

    return this._request('/create_order', params);
  }

  /**
   * @summary 订单查询
   * @method queryOrder
   * @param {string} out_order_no 商户内部订单号
   * @param {object} options 额外请求参数
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @returns {Promise} -
   */
  async queryOrder(out_order_no, options = {}) {
    const basicParams = {
      app_id: this.config.appId,
      out_order_no,
      ...options,
    };

    const params = {
      ...basicParams,
      sign: this._genSign({ ...basicParams }),
    };

    return this._request('/query_order', params);
  }

  /**
   * @summary 退款
   * @method createRefund
   * @param {string} out_order_no 商户内部订单号
   * @param {string} out_refund_no 商户分配的退款号
   * @param {number} amount 退款金额(单位: 分)
   * @param {string} reason 退款理由，长度上限 100
   * @param {object} options 额外请求参数
   * @param {string} options.cp_extra 开发者自定义字段，回调原样回传
   * @param {string} options.notify_url 商户自定义回调地址
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @param {string} options.disable_msg 是否屏蔽担保支付的推送消息，1-屏蔽
   * @param {string} options.msg_page 担保支付消息跳转页
   * @param {string} options.all_settle 是否为分账后退款，1-分账后退款；0-分账前退款。分账后退款会扣减可提现金额，请保证余额充足
   * @returns {Promise} -
   */
  async createRefund(out_order_no, out_refund_no, amount, reason, options = {}) {
    const basicParams = {
      app_id: this.config.appId,
      out_order_no,
      out_refund_no,
      refund_amount: amount,
      reason,
      ...options,
    };

    if (this.config.notifyURL) {
      basicParams.notify_url = this.config.notifyURL;
    }

    const params = {
      ...basicParams,
      sign: this._genSign({ ...basicParams }),
    };

    return this._request('/create_refund', params);
  }

  /**
   * @summary 查询退款
   * @method queryRefund
   * @param {string} out_refund_no 商户分配的退款号
   * @param {object} options 额外请求参数
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @returns {Promise} -
   */
  async queryRefund(out_refund_no, options = {}) {
    const basicParams = {
      app_id: this.config.appId,
      out_refund_no,
      ...options,
    };

    const params = {
      ...basicParams,
      sign: this._genSign({ ...basicParams }),
    };

    return this._request('/query_refund', params);
  }

  /**
   * @summary 检查请求签名
   * @method checkNotifySign
   * @param {object} body 请求体
   * @returns {boolean} -
   */
  checkNotifySign(body = {}) {
    const { msg_signature, timestamp, msg = '', nonce } = body;
    const str = [this.config.TOKEN, timestamp, nonce, msg].sort().join();
    const _signature = createHash('sha1').update(str).digest('hex');
    return msg_signature === _signature;
  }

  /**
   * @summary 回调响应结果
   * @method ackNotify
   * @param {Function} fn 回调处理函数
   * @returns -
   */
  ackNotify = (fn = () => { }) => fn('{"err_no":0,"err_tips":"success"}');
}