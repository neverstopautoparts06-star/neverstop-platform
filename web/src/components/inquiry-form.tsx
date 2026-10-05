'use client';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { dictionary, localized, type Locale } from '@/lib/i18n';
type Product={id:string;partNumber:string;nameVi:string;nameEn:string|null;nameZh:string|null};
export default function InquiryForm({locale,product}:{locale:Locale;product:Product|null}){
 const t=dictionary(locale),[sending,setSending]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState('');
 const requestId=useRef(''),previousPayload=useRef('');
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(sending)return;const form=new FormData(event.currentTarget);
  const payload={name:form.get('name'),phone:form.get('phone'),vehicle:form.get('vehicle'),message:form.get('message'),quantity:Number(form.get('quantity')),consent:form.get('consent')==='on',website:form.get('website'),productId:product?.id??''};
  const serialized=JSON.stringify(payload);if(!requestId.current||previousPayload.current!==serialized){requestId.current=crypto.randomUUID();previousPayload.current=serialized;}
  setSending(true);setError('');
  try{
   const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId:requestId.current})});
   const body=await response.json();
   if(!response.ok||!body.success){setError(body.error==='rateLimit'?t.rateLimit:body.error==='invalid'?t.invalidInquiry:body.error==='productUnavailable'?t.productUnavailable:t.inquiryError);return;}
   setReference(body.reference);
  }catch{setError(t.inquiryError);}finally{setSending(false);}
 }
 const field='mt-2 w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white';
 if(reference)return <section role="status" className="rounded-2xl border border-orange-500 p-6"><h2 className="text-2xl font-black">{t.saved}</h2><p className="mt-4 text-zinc-400">{t.reference}</p><p className="mt-2 break-all font-mono text-sm text-orange-500">{reference}</p><p className="mt-4 leading-7 text-zinc-400">{t.savedNote}</p><div className="mt-6 flex flex-wrap gap-4"><a href={`/${locale}/contact`}  className="rounded-lg bg-orange-500 px-5 py-3 font-bold text-black">{t.zalo} ↗</a><button type="button" onClick={()=>{setReference('');requestId.current='';previousPayload.current='';}} className="rounded-lg border border-zinc-700 px-5 py-3">{t.newInquiry}</button></div></section>;
 return <form onSubmit={submit} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
 {product&&<div className="mb-6 border-b border-zinc-800 pb-6"><p className="text-sm font-bold text-orange-500">{product.partNumber}</p><p className="mt-2 font-bold">{localized(product,locale)}</p></div>}
 <fieldset disabled={sending} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm">{t.name}<input name="name" autoComplete="name" minLength={2} maxLength={100} required className={field}/></label><label className="block text-sm">{t.phone}<input name="phone" type="tel" autoComplete="tel" maxLength={25} required pattern="[+0-9() -]{9,25}" className={field}/></label></div>
 <div className="grid gap-5 sm:grid-cols-[1fr_130px]"><label className="block text-sm">{t.vehicleInfo}<input name="vehicle" maxLength={200} placeholder={t.vehiclePlaceholder} className={field}/></label><label className="block text-sm">{t.quantity}<input name="quantity" type="number" min={1} max={999} defaultValue={1} required className={field}/></label></div>
 <label className="block text-sm">{t.message}<textarea name="message" rows={5} minLength={5} maxLength={2000} required placeholder={t.messageHint} className={field}/></label>
 <div aria-hidden="true" className="hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
 <label className="flex items-start gap-3 text-sm leading-6 text-zinc-400"><input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0 accent-orange-500"/>{t.consent}</label><Link href={`/${locale}/privacy`} className="inline-block text-sm text-orange-500 underline">{t.privacy}</Link>
 {error&&<p role="alert" className="text-sm text-orange-400">{error}</p>}<button type="submit" className="block w-full rounded-xl bg-orange-500 px-6 py-4 font-black text-black disabled:opacity-50">{sending?t.sending:t.sendInquiry}</button>
 </fieldset></form>;
}
