const express = require('express');
const { TTPay } = require('bytedance-mini-pay');

const app = express();
const port = 8800;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ttpay = new TTPay({
  appId: process.env.TT_APPID ?? '你的AppId',
  appSecret: process.env.TT_SECRET ?? '你的AppSecret',
  SALT: process.env.TT_SALT ?? '你的SALT',
  TOKEN: process.env.TT_TOKEN ?? '你的TOKEN', // 可选 (为了安全起见，最好是配置上)
  mchId: process.env.TT_MCHID ?? '你的商户号', // 可选
  notifyURL: process.env.TT_NOTIFY_URL ?? '你的支付回调URL', // 可选
});

app.post('/order', async (req, res) => {
  const { orderNo, amount, subject, body } = req.body;

  const options = {
    valid_time: 60 * 60 * 24, // 订单支付的有效时间 (单位: 秒)
  };
  ttpay.createOrder(orderNo, amount, subject, body, options)
    .then(resp => res.send(resp))
    .catch(err => res.send(err))
    .finally(() => res.end());
});

app.post('/refund', async (req, res) => {
  const { orderNo, refundNo, amount, reason = 'RNM, 退钱!' } = req.body;

  ttpay.createRefund(orderNo, refundNo, amount, reason)
    .then(resp => res.send(resp))
    .catch(err => res.send(err))
    .finally(() => res.end());
});

app.get('/query/order/:id', async (req, res) => {
  ttpay.queryOrder(req.params.id)
    .then(resp => res.send(resp))
    .catch(err => res.send(err))
    .finally(() => res.end());
});

app.get('/query/refund/:id', async (req, res) => {
  ttpay.queryRefund(req.params.id)
    .then(resp => res.send(resp))
    .catch(err => res.send(err))
    .finally(() => res.end());
});

app.use('/callback', (req, res) => {
  // 下单回调的处理
  if (req.body.type === 'payment') {
    const msg = JSON.parse(req.body.msg);
    console.log('msg.cp_orderno ------', msg.cp_orderno);
  }

  ttpay.ackNotify(body => res.json(body).end());
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
