# NEVERSTOP 成交系统 V1 · 本地交付说明

2026-10-05。基于现有 NEVERSTOP 项目增量开发，首页及车型、OEM / Part Number 查询保留。业务顺序是网站发现产品 → 个人 Zalo 人工确认 → 正式报价 → 客户接受 → MOCK QR / COD → 正式订单。没有购物车或产品页直接收款。

## 1–2. 修改和新增文件

完整逐文件清单见同目录 `commerce-files.md`。关键修改：Prisma schema、package.json / pnpm-lock.yaml、首页 / Contact / 产品页 / 搜索结果 / Header / Footer、根布局、proxy 和 robots。新增 commerce 服务、后台页面、公共报价 / 付款 / 订单页面、Zalo 共享组件、API、迁移、本地数据库脚本和验收脚本。

## 3. Prisma Model

新增 `Quote`、`QuoteItem`、`InventoryTask`；新增 `CustomerType`、`QuoteStatus` 枚举。
复用并扩展现有 `Order`、`OrderItem`、`Payment`、`Product` 关联，没有建立第二套同类订单或支付表。
Quote 保存客户类型、车辆、报价有效期、价格明细、保修快照、acceptedAt、COD/QR 开关、内部备注和版本来源。
Order / OrderItem 保存成交产品名称、Part Number、OE、位置、车辆、数量、单价、保修快照；Payment 保存 paidAt 和提供商标识。

## 4. Migration

保留原仓库 `20261003144305_init`，新增 `20261005000100_quote_checkout_v1`。本机演示库使用过的临时 baseline 没有加入此仓库，避免重复创建旧表。没有对远程或生产数据库执行迁移；已有数据库先备份并检查 migration status，再部署增量迁移。

## 5. API

| 方法 | 路径 | 用途 |
|---|---|---|
| POST / DELETE | /api/admin/session | 内部登录 / 退出 |
| GET / POST | /api/admin/quotes | 筛选列表 / 创建报价 |
| POST | /api/admin/quotes/[id] | 发送、取消、生成新版本 |
| POST | /api/quotes/[token]/accept | 接受报价及保修条款 |
| POST | /api/quotes/[token]/cod | 确认 COD 和收货信息 |
| POST | /api/payments/create | 按数据库金额创建付款会话 |
| POST | /api/payments/webhook | 校验签名、金额并幂等结算 |
| GET | /api/payments/[id] | 用随机付款 token 查询状态 |
| POST | /api/payments/[id]/simulate | 仅开发环境模拟成功 |
| GET | /api/zalo/qr/[type] | B2B / B2C 对应 Zalo URL 二维码 |

后台 API 需要登录。报价和订单链接作为私有访问凭证，不要求客户注册。公共返回值不包含 internalNote。
Webhook 测试协议：原始 JSON `{providerPaymentId, amount, status:"PAID"}`，`x-payment-signature` 为 PAYMENT_WEBHOOK_SECRET 对原始请求体计算的 HMAC-SHA256。未来真实提供商须按其官方签名和事件规则实现适配器，不能直接沿用 MOCK 协议。

## 6. 前端页面

- `/admin/login`
- `/admin/quotes`（状态和 B2B/B2C 筛选）
- `/admin/quotes/new`（添加多个产品、手工议价）
- `/admin/quotes/[id]`（明细、复制链接 / Zalo 文案、发送、取消、新版本）
- `/q/[token]`（免登录报价及接受）
- `/payment/[token]`（TEST 付款页）
- `/order/[token]`（订单和成交快照）

内部和私有页面有 noindex、no-store、no-referrer；robots 排除对应路径。保留当前黑金设计和移动端布局。

## 7. 双 Zalo 配置

在项目 `.env.local` 设置；模板为 `.env.example`：

```dotenv
NEXT_PUBLIC_ZALO_B2B_PHONE=0398588703
NEXT_PUBLIC_ZALO_B2B_URL=https://zalo.me/0398588703
NEXT_PUBLIC_ZALO_B2B_QR_IMAGE=
NEXT_PUBLIC_ZALO_B2C_PHONE=0396730160
NEXT_PUBLIC_ZALO_B2C_URL=https://zalo.me/0396730160
NEXT_PUBLIC_ZALO_B2C_QR_IMAGE=
```

统一读取 `src/lib/zalo-config.ts`，统一组件 `src/components/zalo-contact.tsx`。public 配置变更后须重启开发服务；正式构建需重新 build。
QR_IMAGE 留空时生成编码对应个人 Zalo URL 的可扫描二维码；这不是从 Zalo App 导出的原生名片码。若使用原生名片码，把两张图片放到 `public/images/` 并配置对应 `/images/文件名`。
没有接 Zalo OA。系统通过 https://zalo.me/手机号 尝试唤起对应 App / 客户端，是否直接进入聊天取决于设备、登录和 Zalo 行为，不能由网页保证。尚未实机扫描两位销售的 Zalo App。
首页 Contact 同时显示两种身份、聊天按钮和 QR；产品 / 搜索 / 悬浮入口先选身份；点击后可重试并使用 QR。复制产品上下文失败时提供手工复制内容。
已核对并更新 TikTok `@neverstopvietnam`、Facebook `Neverstopautoparts`（profile id 61591415340855），Instagram 保留 `neverstopautoparts06`，统一在 `src/lib/social-config.ts`。YouTube 尚无确认账号，未伪造链接。

## 8. 后台入口与操作

本机后台：http://127.0.0.1:3006/admin/quotes
登录密码保存在本机 `.env.local` 的 ADMIN_PASSWORD；不要上传 `.env.local` 或任何登录凭据。
新建报价 → 选择 B2B/B2C → 搜索并加入产品 → 数量与实际单价 → 客户、车型、运费、优惠、有效期、保修条款 → 按需勾选 COD / QR → 保存草稿 → 标记 SENT → 复制链接 / Zalo 文案。
`/admin/quotes/new?customerType=B2B` 可预选商家；B2C 同理。个人 Zalo 没有 API 回传客户身份，销售按来询渠道确认选择，不自动套价格。
任何编辑都创建新版本并保留旧记录，已接受报价的金额及保修条款不会改写。若旧版本不应再被使用，销售需明确取消旧报价。

## 9. 专属链接

`/q/<43位随机base64url token>`，来自32字节加密随机数。价格与客户信息不放 URL 参数；数据库 ID 不作为公共访问凭证。报价编号为 NSQ-日期-随机唯一后缀，订单编号为 NS-日期-随机唯一后缀。

## 10. MOCK QR 测试

运行开发环境，配置 `PAYMENT_PROVIDER=MOCK`、`ENABLE_MOCK_PAYMENTS=true`。
后台创建并发送支持在线支付的报价 → 客户勾选条款并接受 → THANH TOÁN QR · TEST → 查看准确金额与 TEST MODE 提示 → SIMULATE PAYMENT SUCCESS → 测试订单成功页。
没有真实支付二维码，只有明确标注的占位区域。生产模式无模拟按钮，模拟接口返回503。禁止拿当前 MOCK 实现收款。

## 11. COD 测试

另建一份 `codEligible=true` 的报价 → SENT → 接受 → COD → 填收件人、电话、省市、详细地址、备注 → 确认 → COD_CONFIRMED 和唯一订单。默认不开 COD，销售决定。已付款报价不能再生成 COD 订单。

## 12. Order 与库存条件

只在付款成功回调（当前为 MOCK）或 COD 确认时生成 Order。
创建、发送、接受 Quote 都不创建 Order、不扣库存。
同一报价的并发或重复通知只创建一张订单：行锁 + 数据库唯一约束 + 幂等服务。
下单时建立持久化 `InventoryTask(PENDING_REVIEW)` 作为库存处理入口；尚未实现库存自动预留 / 扣减、发货执行器。本次没有重构 Inventory，也没有修改原库存余额。

## 13. 后续上线工作

真实服务器 / HTTPS 域名、稳定 PostgreSQL 与备份、支付商户审核及凭证、一个真实 Payment Provider 适配器、公网签名 webhook、真实设备端 Zalo / QR 和移动浏览器联调。真实收款还需提供商沙箱验证、对账与退款处理。
上线前需确认正式产品 / 库存数据、实际保修条款、库存预留及发货处理，并加强多员工权限与跨实例登录限流。目前内部后台为单一管理员密码，登录限流保存在进程内，适用于 V1 本地验证。

## 14. 未来环境变量

现有服务端变量：DATABASE_URL、SITE_URL、ADMIN_PASSWORD、ADMIN_SESSION_SECRET、PAYMENT_PROVIDER、PAYMENT_WEBHOOK_SECRET、ENABLE_MOCK_PAYMENTS。
预留 payOS 变量：PAYOS_CLIENT_ID、PAYOS_API_KEY、PAYOS_CHECKSUM_KEY、PAYMENT_RETURN_URL、PAYMENT_CANCEL_URL、PAYMENT_WEBHOOK_URL。尚未实现 payOS，配置变量本身不会启用真实收款。其他提供商按以后选定渠道增加其服务端凭证。
所有商户密钥只放服务端，绝不使用 NEXT_PUBLIC_。生产设置 ENABLE_MOCK_PAYMENTS=false，LOCAL_CATALOG_PREVIEW=0。

## 15. 本地运行与保存

项目在本仓库 `web/` 目录。请阅读 `web/README.md` 的启动步骤。默认首页 http://127.0.0.1:3006/zh，后台 /admin/quotes。
源码不含 `.env.local`、数据库、管理员密码、会话密钥、付款密钥或用户机器路径。管理员密码由 `setup:local` 在本机生成，保存在忽略提交的 `.env.local`。

## 验收记录

- 52 项 HTTP / 数据库验收通过：后台认证、CSRF、服务端金额、防篡改、条款接受、锁价及版本、过期 / 取消、COD、支付签名、金额不符、并发幂等、快照、库存不变、车型 / 产品查询、页面与 QR。
- 三轮各8个并发结算请求均成功复用唯一订单。
- 生产构建及 TypeScript 通过；ESLint error 检查通过。
- 生产模拟付款接口返回503，付款页无模拟按钮。
- 重启本地数据库 / 应用后，报价、MOCK订单、COD订单、Payment 页面均200且记录保留。
- 浏览器验证：同意前按钮禁用，勾选后可接受，出现 QR / COD 选择，测试支付生成订单并显示保修快照。测试报价接受曾被自动审批要求确认；用户明确授权后已成功完成。
- 演示中的姓名、价格、保修是 TEST 数据，样例产品库存为0；不表示真实库存或实际报价。


## 后台可用性补充

报价详情新增运费 / 优惠 / 商品金额、收货人及地址、客户备注、付款方式与状态 / 时间、库存待处理状态。登录后增加退出按钮，调用已有退出 API 清除登录 cookie。模拟付款后的公共报价页也明确标示 TEST MODE 和未收到真实款项。此次补充不改变报价金额、订单记录或数据库结构。

## 社媒展示更新

社媒卡片统一为上方平台图标、下方平台名称及账号。Facebook 蓝白、TikTok 黑白青红、Instagram 渐变、YouTube 红白、Zalo 蓝白。商家与车主 Zalo 分开标注。YouTube 仍为账号待补充，不生成未经确认的链接。桌面六列，中等宽度三列，手机两列。
