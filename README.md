# NEVERSTOP Platform

NEVERSTOP Factory Store 独立站，保留车型、OEM / Part Number 查询，以个人 Zalo 人工咨询为成交入口。

网站发现产品 → B2B / B2C Zalo → 销售确认 → 正式报价 → 客户接受报价和保修条款 → MOCK QR / COD → 正式订单。

当前版本包含三语言首页、产品查询及详情、双 Zalo 分流、社媒品牌色图标、报价后台、随机专属链接、条款快照、测试支付和 COD。真实收款未接入，没有公网部署。库存仅生成待处理任务，尚未自动预留或扣减。

代码位于 `web/`。启动步骤见 [web/README.md](web/README.md)，完整说明见 [成交系统 V1](web/docs/commerce-v1.md)。

原提交及数据库迁移保留；只在现有 schema 上增加成交系统。不要提交本地环境文件或数据库。
