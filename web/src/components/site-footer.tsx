import { dictionary, type Locale } from '@/lib/i18n';
export default function SiteFooter({locale}:{locale:Locale}) {
  const t=dictionary(locale);
  const intro=t.footerIntro.replace(/^Neverstop/i,'');
  return <footer className="bg-black px-6 py-7 text-center text-zinc-300"><p className="mx-auto max-w-7xl text-sm leading-7 md:text-base"><strong className="footer-wordmark" dir="ltr">NEVERSTOP</strong>{intro}</p></footer>;
}
