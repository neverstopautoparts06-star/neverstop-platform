'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { dictionary, type Locale } from '@/lib/i18n';
import type { ProductResults, VehicleBrand } from '@/lib/catalog-types';
import ProductCard from './product-card';
import {ZaloChatButton} from './zalo-contact';
const field='w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white disabled:opacity-40';
export default function VehicleSearch({locale,showAll=false,compact=false}:{locale:Locale;showAll?:boolean;compact?:boolean}) {
  const t=dictionary(locale), router=useRouter(), pathname=usePathname(), params=useSearchParams();
  const [searchMode,setSearchMode]=useState<'vehicle'|'code'>(params.has('q')?'code':'vehicle');
  const [brands,setBrands]=useState<VehicleBrand[]>([]),[vehicleState,setVehicleState]=useState<'loading'|'ready'|'error'>('loading');
  const [retryVehicles,setRetryVehicles]=useState(0),[retryProducts,setRetryProducts]=useState(0);
  const [brandId,setBrandId]=useState(params.get('brandId')??''),[modelId,setModelId]=useState(params.get('modelId')??'');
  const [year,setYear]=useState(params.get('year')??''),[variantId,setVariantId]=useState(params.get('variantId')??'');
  const [query,setQuery]=useState(params.get('q')??''),[axle,setAxle]=useState(params.get('axle')??'');
  const [response,setResponse]=useState<{key:string;data:ProductResults|null;error:boolean}|null>(null);
  const submitted = showAll || params.get('search') === '1';
  const apiParams=new URLSearchParams();
  for(const key of ['variantId','year','q','axle','page']){const value=params.get(key);if(value)apiParams.set(key,value);}
  const requestKey=submitted?apiParams.toString():null;
  const loading=requestKey!==null && response?.key!==requestKey+'#'+retryProducts;
  const results=!loading&&requestKey!==null?response?.data:null;
  const productError=!loading&&requestKey!==null&&response?.error;
  useEffect(()=>{
    const abort=new AbortController();
    fetch('/api/vehicles',{signal:abort.signal}).then(async r=>{const b=await r.json();if(!r.ok||!b.success)throw Error();return b;}).then(b=>{setBrands(b.data);setVehicleState('ready');}).catch(()=>{if(!abort.signal.aborted)setVehicleState('error');});
    return ()=>abort.abort();
  },[retryVehicles]);
  useEffect(()=>{
    if(requestKey===null)return;
    const abort=new AbortController(),key=requestKey+'#'+retryProducts;
    fetch('/api/products?'+requestKey,{signal:abort.signal}).then(async r=>{const b=await r.json();if(!r.ok||!b.success)throw Error();return b;}).then(data=>{if(!abort.signal.aborted)setResponse({key,data,error:false});}).catch(()=>{if(!abort.signal.aborted)setResponse({key,data:null,error:true});});
    return ()=>abort.abort();
  },[requestKey,retryProducts]);
  const models=brands.find(b=>b.id===brandId)?.models??[];
  const variants=models.find(m=>m.id===modelId)?.variants??[];
  const years=[...new Set(variants.flatMap(v=>Array.from({length:Math.max(0,(v.yearTo??Math.max(new Date().getFullYear(),v.yearFrom))-v.yearFrom+1)},(_,i)=>v.yearFrom+i)))].sort((a,b)=>b-a);
  const matches=variants.filter(v=>year&&v.yearFrom<=Number(year)&&(v.yearTo===null||v.yearTo>=Number(year)));
  function submit(next:URLSearchParams){next.set('search','1');router.push(pathname+'?'+next.toString()+'#results',{scroll:false});}
  function reset(){setBrandId('');setModelId('');setYear('');setVariantId('');setQuery('');setAxle('');router.push(pathname,{scroll:false});}
  function paginate(page:number){const next=new URLSearchParams(params);next.set('page',String(page));submit(next);}
  const searchByVehicle=(event:React.FormEvent)=>{event.preventDefault();if(!matches.some(v=>v.id===variantId))return;submit(new URLSearchParams({brandId,modelId,year,variantId,...(axle?{axle}:{})}));};
  return <>
    <section id="vehicle-search" className="border-t border-zinc-800 bg-zinc-950 px-6 py-16 text-white md:py-20"><div className="mx-auto max-w-7xl">
      <div className="mb-10 finder-heading"><p className="text-sm font-bold tracking-[.22em] text-orange-500">{t.vehicleSearch}</p><h2 className="mt-3 text-3xl font-black md:text-4xl">{t.findFit}</h2><p className="mt-3 text-zinc-400">{t.chooseVehicle}</p></div>
      {compact&&<div className="finder-tabs" aria-label={t.vehicleSearch}><button type="button" aria-pressed={searchMode==='vehicle'} onClick={()=>setSearchMode('vehicle')}>{t.vehicleSearch}</button><button type="button" aria-pressed={searchMode==='code'} onClick={()=>setSearchMode('code')}>OEM / NEVERSTOP Part Number</button></div>}
      <div hidden={compact&&searchMode!=='vehicle'}>
      {vehicleState==='loading'&&<p role="status" className="mb-4 text-zinc-400">{t.loadingVehicles}</p>}
      {vehicleState==='error'&&<div role="alert" className="mb-4 text-orange-400">{t.vehicleError} <button onClick={()=>{setVehicleState('loading');setRetryVehicles(v=>v+1);}} className="underline">{t.retry}</button> <ZaloChatButton/></div>}
      {vehicleState==='ready'&&!brands.length&&<p>{t.noVehicles}</p>}
      <form onSubmit={searchByVehicle}><div className="grid gap-4 md:grid-cols-4">
        <div><label htmlFor="vehicle-brand" className="mb-2 block text-sm text-zinc-400">{t.brand}</label><select id="vehicle-brand" className={field} value={brandId} disabled={vehicleState!=='ready'} required onChange={e=>{setBrandId(e.target.value);setModelId('');setYear('');setVariantId('');}}><option value="">{t.chooseBrand}</option>{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div><label htmlFor="vehicle-model" className="mb-2 block text-sm text-zinc-400">{t.model}</label><select id="vehicle-model" className={field} value={modelId} disabled={!brandId} required onChange={e=>{setModelId(e.target.value);setYear('');setVariantId('');}}><option value="">{t.chooseModel}</option>{models.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
        <div><label htmlFor="vehicle-year" className="mb-2 block text-sm text-zinc-400">{t.year}</label><select id="vehicle-year" className={field} value={year} disabled={!modelId} required onChange={e=>{setYear(e.target.value);setVariantId('');}}><option value="">{t.chooseYear}</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
        <div><label htmlFor="vehicle-variant" className="mb-2 block text-sm text-zinc-400">{t.code}</label><select id="vehicle-variant" className={field} value={variantId} disabled={!year} required onChange={e=>setVariantId(e.target.value)}><option value="">{t.chooseCode}</option>{matches.map(v=><option key={v.id} value={v.id}>{v.modelCode??v.displayName??t.variant} · {v.yearFrom}–{v.yearTo??t.present}</option>)}</select></div>
      </div><button disabled={!matches.some(v=>v.id===variantId)||loading} className="mt-6 rounded-xl bg-orange-500 px-8 py-4 font-black text-black disabled:opacity-40">{t.findProducts}</button></form></div>
      <div hidden={compact&&searchMode!=='code'} id="oe-search" className="mt-12 rounded-2xl border border-zinc-800 bg-black p-6 md:p-8"><div className="grid gap-6 md:grid-cols-[1fr_1.5fr] md:items-center"><div><p className="text-sm font-bold text-orange-500">{t.byCode}</p><h3 className="mt-2 text-2xl font-black">{t.searchLabel}</h3><p className="mt-2 text-sm text-zinc-400">{t.searchHint}</p></div><form className="flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();submit(new URLSearchParams({...(query.trim()?{q:query.trim()}:{}),...(axle?{axle}:{})}));}}><input aria-label={t.searchLabel} type="search" maxLength={100} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.searchPlaceholder} className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4"/><button className="rounded-xl bg-orange-500 px-6 py-3 font-black text-black">{t.search}</button></form></div></div>
      {!compact&&<div className="finder-controls mt-6 flex flex-wrap items-end gap-4"><button onClick={reset} className="rounded-lg border border-zinc-700 px-4 py-3 text-sm">{t.reset}</button><Link href={`/${locale}/products`} className="px-2 py-3 text-sm text-orange-500">{t.allProducts} →</Link></div>}
      <div id="results" aria-live="polite" aria-busy={loading} className="scroll-mt-6">
        {loading&&<p role="status" className="mt-10 text-zinc-400">{t.loadingProducts}</p>}
        {productError&&<div role="alert" className="mt-10 text-orange-400">{t.productError} <button className="underline" onClick={()=>setRetryProducts(v=>v+1)}>{t.retry}</button></div>}
        {results&&<div className="mt-10"><h2 className="text-2xl font-black">{t.results}</h2>{!results.data.length?<p className="mt-4 text-zinc-400">{t.noResults}</p>:<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.data.map(product=><ProductCard key={product.id} product={product} locale={locale}/>)}</div>}{(results.page>1||results.hasMore)&&<div className="mt-6 flex items-center gap-4"><button className="rounded-lg border border-zinc-700 px-4 py-2 disabled:opacity-40" disabled={results.page===1} onClick={()=>paginate(results.page-1)}>{t.previous}</button><span>{t.page} {results.page}</span><button className="rounded-lg border border-zinc-700 px-4 py-2 disabled:opacity-40" disabled={!results.hasMore} onClick={()=>paginate(results.page+1)}>{t.next}</button></div>}</div>}
      </div>
    </div></section>
    {!showAll&&!compact&&<section className="bg-white px-6 py-20 text-black"><div className="mx-auto max-w-7xl"><div className="mb-10"><p className="text-sm font-bold tracking-[.22em] text-orange-500">{t.popular}</p><h2 className="mt-3 text-3xl font-black md:text-4xl">{t.quickLookup}</h2><p className="mt-3 text-zinc-500">{t.quickHint}</p></div><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{brands.flatMap(b=>b.models.filter(m=>m.variants.length).map(m=><button key={m.id} onClick={()=>{setBrandId(b.id);setModelId(m.id);setYear('');setVariantId('');document.getElementById('vehicle-search')?.scrollIntoView({behavior:'smooth'});}} className="rounded-2xl border border-zinc-200 bg-white p-6 text-left hover:border-orange-500"><div className="text-xs font-bold tracking-[.18em] text-zinc-400">{t.model}</div><div className="mt-8 text-lg font-black">{b.name} {m.name}</div><div className="mt-3 text-sm font-bold text-orange-500">{t.selectYearCode}</div></button>))}</div></div></section>}
  </>;
}
