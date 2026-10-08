import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/i18n';
import {productCenterCopy} from '@/lib/product-center-copy';
import ProductCenter,{type ProductCenterQuery} from '@/components/product-center';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;
 return isLocale(locale)?{title:productCenterCopy(locale).title,description:productCenterCopy(locale).intro}:{};
}
export default async function Products({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();
 const values=await searchParams,query:ProductCenterQuery={};
 for(const key of ['q','brandId','modelId','variantId','year','axle','page','search','mode'] as const){const value=values[key];if(typeof value==='string')query[key]=value;}
 return <ProductCenter key={JSON.stringify(query)} locale={locale} query={query} localPreview={process.env.LOCAL_CATALOG_PREVIEW==='1'}/>;
}
