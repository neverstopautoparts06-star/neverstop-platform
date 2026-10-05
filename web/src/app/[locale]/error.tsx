'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { dictionary,localeOf } from '@/lib/i18n';
export default function ErrorPage({reset}:{reset:()=>void}){const locale=localeOf(usePathname().split('/')[1]),t=dictionary(locale);return <main id="main" className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-3xl font-black">{t.errorTitle}</h1><p className="mt-4 text-zinc-400">{t.errorBody}</p><button onClick={reset} className="mt-8 rounded-xl bg-orange-500 px-6 py-3 font-bold text-black">{t.retry}</button><Link href={`/${locale}`} className="ml-6 text-orange-500">{t.home}</Link></main>;}
