import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { dictionary, isLocale } from '@/lib/i18n';
import VehicleSearch from '@/components/vehicle-search';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?{title:dictionary(locale).products}:{};}
export default async function Products({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();const t=dictionary(locale);
 return <main id="main"><div className="mx-auto max-w-7xl px-6 py-14"><p className="text-sm font-bold tracking-widest text-orange-500">NEVERSTOP</p><h1 className="mt-3 text-4xl font-black">{t.productHeading}</h1><p className="mt-4 max-w-2xl text-zinc-400">{t.productIntro}</p></div><Suspense fallback={<p className="p-6">{t.loadingProducts}</p>}><VehicleSearch locale={locale} showAll/></Suspense></main>;
}
