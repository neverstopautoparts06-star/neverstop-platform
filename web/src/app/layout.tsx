import {GlobalZalo} from '@/components/zalo-contact';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { localeOf } from '@/lib/i18n';
import './globals.css';
export const metadata: Metadata = { title: { default: 'NEVERSTOP Auto Parts', template: '%s | NEVERSTOP' }, description: 'NEVERSTOP automotive shock absorbers and parts in Vietnam.' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = localeOf((await headers()).get('x-neverstop-locale'));
  return <html lang={locale === 'zh' ? 'zh-CN' : locale} className="antialiased"><body>{process.env.LOCAL_CATALOG_PREVIEW==='1'&&<div role="note" className="bg-zinc-900 px-6 py-2 text-center text-xs text-zinc-400">{locale==='zh'?'本地测试数据 · 非实时库存':locale==='vi'?'Dữ liệu thử nghiệm cục bộ · Không phải tồn kho thực tế':'Local test data · Not live inventory'}</div>}{children}<GlobalZalo/></body></html>;
}
