import { notFound,redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { homeReferenceCopy } from '@/lib/home-reference-copy';
import { siteOrigin } from '@/lib/site-config';
import FactoryHome from '@/components/factory-home';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))return {};
 const origin=siteOrigin();return {title:'NEVERSTOP Factory-direct · Hà Nội',description:homeReferenceCopy(locale).intro,...(origin?{alternates:{canonical:origin+'/'+locale,languages:{vi:origin+'/vi',en:origin+'/en','zh-CN':origin+'/zh',ar:origin+'/ar',es:origin+'/es',pt:origin+'/pt'}}}:{})};
}
export default async function Home({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();
 // Preserve saved homepage queries by handing the original filters to the catalog route.
 const input=await searchParams,query=new URLSearchParams();
 for(const key of ['q','brandId','modelId','variantId','year','axle','page','search','mode']){
  const value=input[key];if(typeof value==='string'&&value.length<=200)query.set(key,value);
 }
 if(query.get('q')||query.get('variantId')||query.get('search')==='1')redirect(`/${locale}/products?${query}#catalog-results`);
 return <FactoryHome locale={locale}/>;
}
