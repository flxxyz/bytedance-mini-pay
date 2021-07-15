# bytedance-mini-pay 示例代码

## 安装依赖

```bash
pnpm install

or 

yarn install

or

npm i
```

## 跑起来

```bash
node index.js
```

看到如下输出即可使用

```bash
$ node index.js
Example app listening at http://localhost:8800
```

## 接口

| 请求方法 |       路由        | 请求头                         | 参数                                                                                      |
|:--------:|:-----------------:|:-------------------------------|:------------------------------------------------------------------------------------------|
|   POST   |      /order       | Content-Type: application/json | {"orderNo": "内部订单号", "amount": 1, "subject": "这是商品描述", "body": "这是商品详情"} |
|   POST   |      /refund      | Content-Type: application/json | {"orderNo": "内部订单号", "refundNo": "内部退款单号", "amount": 1, "reason": "退款理由"}  |
|   GET    | /query/order/:id  | 无                             | `:id` 替换成 ***内部订单号***                                                             |
|   GET    | /query/refund/:id | 无                             | `:id` 替换成 ***内部退款单号***                                                           |
