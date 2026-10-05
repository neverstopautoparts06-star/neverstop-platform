import { notFound } from 'next/navigation';
import { isLocale, dictionary } from '@/lib/i18n';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {const {locale}=await params;return isLocale(locale)?{description:dictionary(locale).heroBody}:{};}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale}=await params; if(!isLocale(locale))notFound();
  return <><SiteHeader locale={locale}/>{children}<SiteFooter locale={locale}/></>;
}
