'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { dictionary, locales, type Locale } from '@/lib/i18n';
export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = dictionary(locale); const pathname = usePathname(); const [open, setOpen] = useState(false);
  const nav = [[`/${locale}`, t.home], [`/${locale}/products`, t.products], [`/${locale}#vehicle-search`, t.vehicleSearch], [`/${locale}/contact`, t.contact]];
  function switchLanguage(next: Locale) {
    const path = pathname.replace(/^\/(vi|en|zh)(?=\/|$)/, '/' + next);
    window.location.assign(path + window.location.search + window.location.hash);
  }
  return <header className="border-b border-zinc-800 bg-black text-white">
    <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">{t.skip}</a>
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
      <Link href={`/${locale}`} aria-label="NEVERSTOP Auto Parts"><span className="block text-lg font-black tracking-[.22em] text-orange-500">NEVERSTOP</span><span className="block text-[10px] tracking-[.24em] text-zinc-500">FACTORY STORE</span></Link>
      <nav aria-label={t.menu} className="hidden gap-6 text-sm text-zinc-300 lg:flex">{nav.map(([href,label]) => <Link key={href} href={href} className="hover:text-orange-500">{label}</Link>)}</nav>
      <div className="flex items-center gap-3"><div className="flex gap-2 text-sm" aria-label="Language">{locales.map((lang) => <button key={lang} type="button" onClick={() => switchLanguage(lang)} aria-pressed={lang === locale} lang={lang} className={lang === locale ? 'font-bold text-orange-500' : 'text-zinc-400 hover:text-white'}>{lang === 'zh' ? '中文' : lang.toUpperCase()}</button>)}</div><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm lg:hidden">{t.menu}</button><Link href={`/${locale}/contact`} className="hidden rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black sm:inline-block">{t.quote}</Link></div>
      {open && <nav id="mobile-nav" aria-label={t.menu} className="flex w-full flex-col gap-1 border-t border-zinc-800 pt-3 lg:hidden">{nav.map(([href,label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-zinc-900">{label}</Link>)}</nav>}
    </div>
  </header>;
}
