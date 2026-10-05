import Link from 'next/link';
import { headers } from 'next/headers';
import { dictionary,localeOf } from '@/lib/i18n';
export default async function NotFound(){const locale=localeOf((await headers()).get('x-neverstop-locale')),t=dictionary(locale);return <main id="main" className="mx-auto max-w-3xl px-6 py-24"><p className="font-black text-orange-500">NEVERSTOP · 404</p><h1 className="mt-4 text-4xl font-black">{t.notFound}</h1><p className="mt-5 text-zinc-400">{t.notFoundBody}</p><Link href={`/${locale}`} className="mt-8 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-black">{t.home}</Link></main>;}
