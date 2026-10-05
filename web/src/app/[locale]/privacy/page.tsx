import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dictionary,isLocale } from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?{title:dictionary(locale).privacy}:{};}
export default async function Privacy({params}:{params:Promise<{locale:string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();const t=dictionary(locale);return <main id="main" className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-4xl font-black">{t.privacy}</h1><div className="mt-8 space-y-6 leading-8 text-zinc-400">{[t.privacyIntro,t.privacyData,t.privacyUse,t.privacyPayment].map(text=><p key={text}>{text}</p>)}</div><Link href={`/${locale}/contact`} className="mt-8 inline-block text-orange-500">{t.contact} →</Link></main>;}
