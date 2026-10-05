import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/i18n';
import {headerCopy} from '@/lib/header-copy';
export default async function Orders({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const t=headerCopy[locale];return <main id="main" className="mx-auto max-w-4xl px-6 py-16"><h1 className="text-3xl font-bold">{t.orders}</h1><section className="mt-8 rounded-lg border border-zinc-700 p-8"><h2 className="text-xl font-semibold">{t.empty}</h2><p className="mt-4 leading-7 text-zinc-400">{t.orderHint}</p></section></main>;}
