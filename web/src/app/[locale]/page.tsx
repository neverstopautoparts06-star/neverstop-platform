import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { homeCopy } from '@/lib/home-copy';
import { siteOrigin } from '@/lib/site-config';
import FactoryHome from '@/components/factory-home';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))return {};
 const origin=siteOrigin();return {title:'NEVERSTOP Factory Store · Hà Nội',description:homeCopy[locale].intro,...(origin?{alternates:{canonical:origin+'/'+locale,languages:{vi:origin+'/vi',en:origin+'/en','zh-CN':origin+'/zh'}}}:{})};
}
export default async function Home({params}:{params:Promise<{locale:string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();return <FactoryHome locale={locale}/>;}
