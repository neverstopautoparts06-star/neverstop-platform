import ZaloContact from '@/components/zalo-contact';
import { notFound } from 'next/navigation';
import { dictionary,isLocale } from '@/lib/i18n';
import { address } from '@/lib/site-config';
import { prisma } from '@/lib/prisma';
import InquiryForm from '@/components/inquiry-form';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?{title:dictionary(locale).contactTitle}:{};}
export default async function Contact({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{product?:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const t=dictionary(locale),{product:id}=await searchParams;
 const product=typeof id==='string'&&id.length<=100?await prisma.product.findFirst({where:{id,status:'ACTIVE'},select:{id:true,partNumber:true,nameVi:true,nameEn:true,nameZh:true}}):null;
 return <main id="main" className="mx-auto max-w-7xl px-6 py-16"><p className="text-sm font-bold tracking-[.22em] text-orange-500">NEVERSTOP</p><h1 className="mt-4 text-4xl font-black">{t.contactTitle}</h1><p className="mt-4 max-w-2xl leading-7 text-zinc-400">{t.contactIntro}</p><div className="mt-10 grid gap-10 md:grid-cols-[.8fr_1.2fr]"><section><h2 className="text-xl font-black">{t.contact}</h2><ZaloContact/><h2 className="mt-8 text-xl font-black">{t.address}</h2><p className="mt-3 leading-7 text-zinc-400">{address}</p></section><div>{id&&!product&&<p role="status" className="mb-4 text-orange-400">{t.productUnavailable}</p>}<InquiryForm locale={locale} product={product}/></div></div></main>;
}
