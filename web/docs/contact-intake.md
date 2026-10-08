# 客户分类、询价交接与聊天欢迎语

## 已实现的网站流程

所有销售 Zalo、WhatsApp、邮箱入口先打开同一个客户类型弹窗，必须在“汽配商家、汽修店、个人车主”三项中选择。覆盖首页 Hero、门店联系方式、产品列表/详情、询价按钮、浮动联系按钮，以及报价、付款、订单页复用的联系按钮。Zalo Video 是查看内容的社交入口，仍直接进入账号页面。

选择后立即调用 `/api/contact-leads` 保存一条咨询线索，状态为 `SELECTED`。客户可以补充所在区域、车型、生产年份、所需产品，以及选填姓名、电话、数量。准备咨询后更新为 `PREPARED`。这两种状态均不表示客户已在聊天应用中发送了消息。

- Zalo：商家和汽修店使用原 B2B 号码；个人车主使用原 B2C 号码。准备带客户类型、咨询编号、产品和车型信息的消息，客户复制/粘贴并发送。不会假称个人 Zalo 链接可以自动填写或发送消息。
- WhatsApp：原号码不变；使用官方 click-to-chat 的 `text` 参数准备草稿，客户确认后发送。
- 邮件：原邮箱不变；邮件客户端打开带主题和正文的草稿，客户确认后发送。空格使用 `%20` 编码。
- 六种网站语言均有对应的客户类型、信息提示和询价消息。

## 团队查看与报价

登录后台后进入 `/admin/inquiries`。可以按三类客户筛选；页面每 30 秒在前台可见时刷新，也可以手动刷新。

线索记录客户类型、联系渠道、来源页面、客户填写的信息，以及来自页面的产品编号/OEM/底盘信息。未提供姓名/号码时只是一条匿名联系意向，不能据此确定具体客户身份；聊天中的咨询编号可用于匹配同一条记录。

“根据此咨询报价”会带入原报价编辑器：商家/汽修店对应原 B2B，个人车主对应原 B2C，并预填客户姓名、电话、地区、车型、年份等。准确的三类客户标签保留在内部备注中。价格和产品明细仍由员工核对填写，不自动生成价格或订单。

无需修改 Prisma Schema。复用现有 `Inquiry` 字段，扩展信息写入有版本标识的 `notes`。不修改产品、车型、OEM、库存数据。接口限制请求大小、检查同源请求、限制请求频率，并使用随机咨询编号避免网络重试产生重复记录。来源页面中订单/报价/付款访问令牌被移除。

## WhatsApp 团队自动通知接口：已准备，未启用

仅支持官方 WhatsApp Cloud API。当前只有个人 Zalo 号码配置，不能通过官方接口自动向个人 Zalo 推送。

启用 WhatsApp 通知需要：Cloud API 已绑定发送号码、服务器访问令牌、销售团队接收号码、已审核消息模板及其语言/API 版本。只使用 Business 手机 App 不等于具备 Cloud API。

服务器环境变量见 `.env.example`：

```
CONTACT_WHATSAPP_NOTIFICATIONS=true
WHATSAPP_CLOUD_ACCESS_TOKEN=
WHATSAPP_CLOUD_PHONE_NUMBER_ID=
WHATSAPP_TEAM_RECIPIENT=
WHATSAPP_LEAD_TEMPLATE_NAME=
WHATSAPP_LEAD_TEMPLATE_LANGUAGE=
WHATSAPP_GRAPH_VERSION=
```

访问令牌只能放在服务器的安全环境变量中，不放在聊天记录、Git 文件或 `NEXT_PUBLIC_` 配置中。不要直接把空示例当作启用成功。

消息模板正文需有四个文本变量，依次为：咨询编号、客户类型、联系渠道、咨询摘要。首次客户选择会通知一次；准备咨询后会通知一次更新。同一请求的重复重试不会再次通知。

配置缺失时状态为 `NOT_CONFIGURED`，线索照常保存；API 拒绝或网络失败为 `FAILED`；API 返回消息 ID 为 `API_ACCEPTED`。后者仅代表平台已接受请求，不代表已确认送达。当前没有接入送达状态 webhook，也没有自动重试失败推送。需要账号配置完成后进行实际发送验收；本轮没有发送真实通知。

官方参考：[Meta WhatsApp Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api)。

## 首次聊天欢迎语：平台内仍需配置

网站无法检测用户是否第一次打开外部聊天窗口，也无法冒充商家发送消息。已在网站弹窗中提供相同的信息提示；外部聊天自动欢迎语未启用。

### WhatsApp Business 手机 App

在商业工具中打开“欢迎消息”，启用后粘贴下列文案并选定接收范围。官方规则是客户首次发消息或闲置 14 天后再次发消息时触发，并非仅打开聊天窗口就发送。

中文：

> 欢迎咨询 NEVERSTOP！为了准确推荐产品并报价，请提供：
> 1. 您所在的区域 / 城市
> 2. 客户类型：汽配商家、汽修店或个人车主
> 3. 车辆品牌及车型
> 4. 生产年份
> 5. 需要的产品及数量
> 如有 OEM 参考号或配件照片，也请一并发送。谢谢！

越南语：

> Chào mừng anh/chị đến với NEVERSTOP! Để tư vấn sản phẩm và báo giá chính xác, vui lòng gửi:
> 1. Khu vực / tỉnh, thành phố
> 2. Nhóm khách hàng: cửa hàng phụ tùng, gara sửa chữa hoặc chủ xe cá nhân
> 3. Hãng xe và dòng xe
> 4. Năm sản xuất
> 5. Sản phẩm và số lượng cần mua
> Nếu có mã OEM tham khảo hoặc ảnh phụ tùng, vui lòng gửi kèm. Xin cảm ơn!

英语：

> Welcome to NEVERSTOP! For accurate product advice and a quotation, please send your region/city, customer type (auto parts business, repair workshop or private car owner), vehicle make/model, production year, and the product and quantity needed. Please also include a reference OEM number or a part photo if available. Thank you!

官方参考：[WhatsApp 欢迎消息说明](https://faq.whatsapp.com/501866148528310/?cms_platform=android&locale=en_US)、[Click-to-chat 说明](https://faq.whatsapp.com/5913398998672934)。

### Zalo 个人号

目前保留原个人号联系方式及消息复制功能。若需要官方支持的自动欢迎消息，应开通并授权 Zalo OA，使用 OA 欢迎语/Chatbot 功能，届时需明确确认接入 OA 的入口与原个人号如何并存。

官方参考：[Zalo OA 消息与交互规则](https://oa.zalo.me/home/documents/vie/guides/tong-quan-cac-loai-tin-nhan-tren-zalo-official-account-_3651713298729094511)。

## 验证

`scripts/test-contact-intake.ts` 使用标注为测试的临时咨询数据，结束后清理；通知适配器测试使用隔离的模拟 HTTP，不发送真实消息。覆盖三类客户、六种语言、原号码不变、WhatsApp/邮件草稿、来源链接令牌隐藏、接口校验、同源限制、记录更新及并发去重、后台权限和报价预填。

本轮浏览器工具此前被安全策略禁止读取本地网页，因此没有绕过该限制进行真实浏览器点击、桌面/手机截图或聊天应用发送验收。预览路由与返回 HTML 通过程序检查，外部账号接入仍需完成。
