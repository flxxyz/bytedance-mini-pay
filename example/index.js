const express = require('express');
const { TTPay } = require('bytedance-mini-pay');

const app = express();
const port = 8800;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ttpay = new TTPay({
  appId: '你的AppId',
  appSecret: '你的AppSecret',
  SALT: '你的SALT',
  // TOKEN: '你的TOKEN', // 可选
  // mchId: '你的商户号', // 可选
  // notifyURL: '你的支付回调URL', // 可选
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

app.get('/refund/:id', async (req, res) => {
  const { id: orderNo } = req.params;
  const refundNo = `${orderNo}-${Number((Math.random() % 1000) * 10000).toFixed(0)}`;
  console.log('refundNo:', refundNo);

  ttpay.createRefund(orderNo, refundNo, 1, 'RNM, 退钱!')
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
