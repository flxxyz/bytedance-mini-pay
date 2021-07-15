import { createHash } from 'crypto';
import fetch from 'node-fetch';

export {
  TTPay
};

/**
 * TTPay
 * @constructor
 * @class
 * @public
 */
export default class TTPay {
  API_URL = 'https://developer.toutiao.com/api/apps/ecpay/v1';

  skipArr = ['app_id', 'thirdparty_id', 'sign'];

  /**
   * @property {object} config
   * @property {string} config.appId 字节小程序AppId
   * @property {string} config.appSecret 字节小程序秘钥
   * @property {string} config.[mchId] 商户号
   * @property {string} config.TOKEN 担保交易的令牌
   * @property {string} config.SALT 担保交易的SALT
   * @property {string} config.[notifyURL] 支付回调URL
   */
  config = {
    appId: '',
    appSecret: '',
    mchId: '',
    SALT: '',
    TOKEN: '',
    notifyURL: ''
  };

  /**
   * @constructor
   * @param {object} config 初始化配置
   * @param {string} config.appId 字节小程序AppId
   * @param {string} config.appSecret 字节小程序秘钥
   * @param {string} config.[mchId] 商户号
   * @param {string} config.TOKEN 担保交易的令牌
   * @param {string} config.SALT 担保交易的SALT
   * @param {string} config.[notifyURL] 支付回调URL
   */
  constructor(config) {
    if (!config.appId) { throw Error('config.appId is required'); }
    if (!config.appSecret) { throw Error('config.appSecret is required'); }
    if (!config.SALT) { throw Error('config.SALT is required'); }

    this.config = {
      TOKEN: '',
      ...config
    };
  }

  /**
   * @summary 生成签名
   * @method _genSign
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/UR#%E8%AF%B7%E6%B1%82%E7%AD%BE%E5%90%8D%E7%AE%97%E6%B3%95
   * @param {object} params 签名的参数们
   * @returns {string} 签名
   */
  _genSign(params) {
    const unsignArr = [];
    for (const key in params) {
      if (this.skipArr.indexOf(key) !== -1) {
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
   * @returns {Promise<any>} 响应结果
   */
  async _request(uri, body = {}) {
    if (!uri) { throw Error('uri is not found'); }

    const options = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'flxxyz/bytedance-mini-pay'
      }
    };
    const res = await fetch(`${this.API_URL}${uri}`, options).then(r => r.json());

    return res;
  }

  /**
   * @summary 构造通用参数的函数
   * @method _genParams
   * @param {string} action 操作 create, query
   * @param {object} options 额外请求参数
   * @param {string} options.out_order_no 商户内部订单号
   * @param {number} options.amount 下单金额(单位: 分)
   * @param {string} options.subject 商品描述
   * @param {string} options.body 商品详细
   * @param {number} options.valid_time 过期时间 默认1800s(单位: 秒); 最小 15 分钟，最大两天
   * @param {string} options.cp_extra 开发者自定义字段，回调原样回传
   * @param {string} options.notify_url 商户自定义回调地址
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @param {string} options.disable_msg 是否屏蔽担保支付的推送消息，1-屏蔽 0-非屏蔽，接入 POI 必传
   * @param {string} options.msg_page 担保支付消息跳转页
   * @param {string} options.store_uid 多门店模式下必传，多门店模式下，门店 uid
   * @param {string} options.all_settle 是否为分账后退款，1-分账后退款；0-分账前退款。分账后退款会扣减可提现金额，请保证余额充足
   * @param {string} options.out_refund_no 商户分配的退款号
   * @param {number} options.amount 退款金额(单位: 分)
   * @param {string} options.reason 退款理由，长度上限 100
   * @returns {object} 包含签名的所有参数
   */
  _genParams(action, options = {}) {
    const basicParams = {
      app_id: this.config.appId,
      ...options
    };

    if (action === 'create') {
      if (options.notifyURL) {
        basicParams.notify_url = this.config.notifyURL;
      } else if (this.config.notifyURL) {
        basicParams.notify_url = this.config.notifyURL;
      }
    }

    // 删除空字符串参数
    Object.entries(basicParams)
      .forEach(([key, val]) => {
        if (val === '') delete basicParams[key];
      });

    return {
      ...basicParams,
      sign: this._genSign({ ...basicParams })
    };
  }

  /**
   * @summary 支付下单
   * @method createOrder
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/YE#%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%A2%84%E4%B8%8B%E5%8D%95
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
   * @returns {Promise<any>} 响应结果
   */
  createOrder(out_order_no, amount, subject, body, options = {}) {
    if (!options.valid_time) {
      options.valid_time = 1800;
    }

    const params = this._genParams('create', {
      out_order_no,
      total_amount: amount,
      subject,
      body,
      ...options
    });

    return this._request('/create_order', params);
  }

  /**
   * @summary 订单查询
   * @method queryOrder
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/YE#%E8%AE%A2%E5%8D%95%E6%9F%A5%E8%AF%A2
   * @param {string} out_order_no 商户内部订单号
   * @param {object} options 额外请求参数
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @returns {Promise<any>} 响应结果
   */
  queryOrder(out_order_no, options = {}) {
    const params = this._genParams('query', {
      out_order_no,
      ...options
    });

    return this._request('/query_order', params);
  }

  /**
   * @summary 退款
   * @method createRefund
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/YE#%E9%80%80%E6%AC%BE%E8%AF%B7%E6%B1%82
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
   * @returns {Promise<any>} 响应结果
   */
  createRefund(out_order_no, out_refund_no, amount, reason, options = {}) {
    const params = this._genParams('create', {
      out_order_no,
      out_refund_no,
      refund_amount: amount,
      reason,
      ...options
    });

    return this._request('/create_refund', params);
  }

  /**
   * @summary 查询退款
   * @method queryRefund
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/YE#%E6%9F%A5%E8%AF%A2%E9%80%80%E6%AC%BE
   * @param {string} out_refund_no 商户分配的退款号
   * @param {object} options 额外请求参数
   * @param {string} options.thirdparty_id 服务商模式接入必传，第三方平台服务商 id，非服务商模式留空
   * @returns {Promise<any>} 响应结果
   */
  queryRefund(out_refund_no, options = {}) {
    const params = this._genParams('create', {
      out_refund_no,
      ...options
    });

    return this._request('/query_refund', params);
  }

  /**
   * @summary 检查请求签名
   * @method checkNotifySign
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/UR#%E5%9B%9E%E8%B0%83%E7%AD%BE%E5%90%8D%E7%AE%97%E6%B3%95
   * @param {object} body 请求体
   * @returns {boolean} 验证请求来源正确
   */
  checkNotifySign(body = {}) {
    const { msg_signature = '', timestamp = '', msg = '', nonce = '' } = body;
    const str = [this.config.TOKEN, timestamp, nonce, msg].sort().join('');
    const _signature = createHash('sha1').update(str).digest('hex');
    return msg_signature === _signature;
  }

  /**
   * @summary 回调响应结果
   * @method ackNotify
   * @link https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/UR#%E5%9B%9E%E8%B0%83%E5%93%8D%E5%BA%94
   * @param {Function} fn 回调处理函数
   * @returns 收到回调且处理成功
   */
  ackNotify = (fn = () => { }) => fn('{"err_no":0,"err_tips":"success"}');
}
