import { dictionary, type Locale } from '@/lib/i18n';
export default function SiteFooter({locale}:{locale:Locale}) {
  const t=dictionary(locale);
  return <footer className="bg-black px-6 py-7 text-center text-zinc-300"><p className="mx-auto max-w-7xl text-sm leading-7 md:text-base">{t.footerIntro}</p></footer>;
}
