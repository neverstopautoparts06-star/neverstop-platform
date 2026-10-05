import {ZaloChatButton} from './zalo-contact';
import Link from 'next/link';
import { dictionary, type Locale } from '@/lib/i18n';
import { address } from '@/lib/site-config';
export default function SiteFooter({locale}:{locale:Locale}) {
  const t=dictionary(locale);
  return <footer className="bg-black px-6 py-12 text-zinc-400"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4"><div className="md:col-span-2"><Link href={`/${locale}`} className="text-xl font-black tracking-[.22em] text-orange-500">NEVERSTOP</Link><p className="mt-1 text-[10px] tracking-[.25em] text-zinc-500">FACTORY STORE</p><p className="mt-5 max-w-md text-sm leading-6">{t.footerIntro}</p></div><div><h2 className="font-bold text-white">{t.contact}</h2><p className="mt-4 text-sm leading-6">{address}</p><ZaloChatButton/></div><div><h2 className="font-bold text-white">{t.support}</h2><div className="mt-4 flex flex-col gap-3 text-sm"><Link href={`/${locale}#vehicle-search`}>{t.vehicleSearch}</Link><Link href={`/${locale}/products`}>{t.products}</Link><Link href={`/${locale}/contact`}>{t.quote}</Link><Link href={`/${locale}/privacy`}>{t.privacy}</Link></div></div></div><p className="mx-auto mt-10 max-w-7xl border-t border-zinc-800 pt-6 text-xs text-zinc-500">© {new Date().getFullYear()} NEVERSTOP. {t.rights}</p></footer>;
}
