# NEVERSTOP Web

Next.js 16 + React 19 + Prisma 7 + PostgreSQL。使用 Node.js 24 和 pnpm 11.19，依赖锁定在 `pnpm-lock.yaml`。原 `package-lock.json` 保留但未更新，不要对本分支运行 `npm ci`。

## 本地演示（新数据库）

在 `web/` 目录执行：

```sh
pnpm install --frozen-lockfile
pnpm setup:local
pnpm exec prisma generate
```

另一个终端运行 `pnpm db:local`，保持开启。随后回到原终端执行：

```sh
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
pnpm dev:local
```

首页 http://127.0.0.1:3006/zh，后台 http://127.0.0.1:3006/admin/quotes。
本机密码在 `.env.local` 的 `ADMIN_PASSWORD`。不要分享或提交此文件。`setup:local` 不覆盖已有配置。
首次 seed 仅用于全新开发库，不能代表正式产品/库存。`.local-commerce-db` 为持久化本地演示数据目录，勿删除或覆盖运行中的数据库。
已有本地演示库可直接 `node scripts/preview-local.mjs` 启动数据库及网站。

## 现有 PostgreSQL / Codespaces

沿用既有 DATABASE_URL 和数据库卷，不运行 seed，不 reset。先备份并检查 `prisma migrate status`，保留 `20261003144305_init`，审核新增的 `20261005000100_quote_checkout_v1` 后再 migrate deploy。原 Docker 配置仍保留。

配置模板为 `.env.example`。默认关闭 MOCK；本地演示需 PAYMENT_PROVIDER=MOCK、ENABLE_MOCK_PAYMENTS=true。生产始终禁止模拟付款。未来真实支付必须实现提供商适配器，不能仅填写密钥就收款。

## 验证

```sh
pnpm typecheck
pnpm lint
pnpm build
# 仅本地测试数据库和已运行的开发服务器：
pnpm test:commerce
```

成交测试会创建标记 TEST 的记录，不用于生产。52 项接口检查、并发幂等、数据库重启持久化和生产 MOCK 禁用已在本机验证；这不是生产收款验收。

完整业务与 API 说明见 [commerce-v1.md](docs/commerce-v1.md)。Zalo 在 `src/lib/zalo-config.ts` 读取配置；社媒账号在 `src/lib/social-config.ts`；图标在 `src/components/social-icon.tsx`。
