# bytedance-mini-pay
字节跳动小程序支付SDK

## 使用

```javascript
const { TTPay } = require('bytedance-mini-pay');

const ttpay = new TTPay({
  appId: '',  // 必须
  appSecret: '',  // 必须
  SALT: '',  // 必须
  TOKEN: '',  // 可选 为了安全性请务必填写！
  mchId: '',  // 可选 商户号
  notifyURL: 'https://example.com/webhook/payments/toutiao/callback',  // 可选 支付回调URL
});

// 下单的回调消息
const orderNotify = {
  msg: '{"appid":"tt84cdf2701bf7f8ed","cp_orderno":"t000004","cp_extra":"","way":"1","channel_no":"","channel_gateway_no":"12106090149746618265","payment_order_no":"4346300973202106091611552039","out_channel_order_no":"","total_amount":1,"status":"SUCCESS","seller_uid":"69664700453838051970"}',
  msg_signature: 'b6fd60b92b9e3502cab6e1e505a91ebaedc8a6d0',
  type: 'payment',
  timestamp: '1623235256',
  nonce: '2281'
};
if (ttpay.checkNotifySign(orderNotify)) {
  console.log('下单验证成功');
}

// 退款的回调消息
const refundNotify = {
  msg: '{"appid":"tt84cdf2701bf7f8ed","cp_refundno":"t343413r","cp_extra":"","status":"SUCCESS","refund_amount":1}',
  msg_signature: '9f7e0f8ac2bd0436ee2ca56f273bebfee4a5a37a',
  type: 'refund',
  timestamp: '1623239959',
  nonce: '2103',
};

if (ttpay.checkNotifySign(refundNotify)) {
  console.log('退款验证成功');
}
```

完整Web示例可以看 [example](https://github.com/flxxyz/bytedance-mini-pay/tree/master/example)

## Reference

- [字节小程序担保支付简介](https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/RE)
- [接口定义](https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/YE)
- [附录](https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/api/open-interface/payment/secure/UR)

## License

采用[MIT](./LICENSE)许可证
