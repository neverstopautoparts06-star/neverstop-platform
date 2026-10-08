'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {dictionary,type Locale} from '@/lib/i18n';
import type {ProductResults,VehicleBrand} from '@/lib/catalog-types';
import {productCenterCopy,productCenterCategories,productCenterVehicles} from '@/lib/product-center-copy';
import {zaloVideoAccount} from '@/lib/social-config';
import ProductCard from './product-card';
import './product-center.css';

export type ProductCenterQuery=Partial<Record<'q'|'brandId'|'modelId'|'variantId'|'year'|'axle'|'page'|'search'|'mode',string>>;
type SearchMode='vehicle'|'oem'|'part';
const images='/images/product-center';
function Icon({name}:{name:'diamond'|'gear'|'truck'|'search'}) {
 return <Image unoptimized className="catalog-icon" src={`${images}/icon-${name}.webp`} alt="" width={32} height={32}/>;
}

export default function ProductCenter({locale,query,localPreview}:{locale:Locale;query:ProductCenterQuery;localPreview:boolean}) {
 const c=productCenterCopy(locale),t=dictionary(locale),router=useRouter();
 const [mode,setMode]=useState<SearchMode>(query.mode==='part'?'part':query.mode==='oem'||query.q?'oem':'vehicle');
 const [brands,setBrands]=useState<VehicleBrand[]>([]),[vehicleState,setVehicleState]=useState<'loading'|'ready'|'error'>('loading');
 const [retryVehicles,setRetryVehicles]=useState(0),[retryResults,setRetryResults]=useState(0);
 const [brandId,setBrandId]=useState(query.brandId||''),[modelId,setModelId]=useState(query.modelId||''),[variantId,setVariantId]=useState(query.variantId||'');
 const [code,setCode]=useState(query.q||'');
 const [response,setResponse]=useState<{key:string;data:ProductResults|null;error:boolean}|null>(null);
 const models=brands.find(b=>b.id===brandId)?.models||[];
 const variants=models.find(m=>m.id===modelId)?.variants||[];
 const submitted=query.search==='1'||!!query.q||!!query.variantId;
 const apiParams=new URLSearchParams();
 for(const key of ['q','variantId','year','axle','page'] as const)if(query[key])apiParams.set(key,query[key]!);
 const requestKey=submitted?apiParams.toString():null;
 const loading=requestKey!==null&&response?.key!==requestKey+'#'+retryResults;
 const results=!loading&&requestKey!==null?response?.data:null;
 const resultError=!loading&&requestKey!==null&&response?.error;
 useEffect(()=>{
  const abort=new AbortController();
  fetch('/api/vehicles',{signal:abort.signal}).then(async r=>{const result=await r.json();if(!r.ok||!result.success)throw Error();return result;}).then(result=>{setBrands(result.data);setVehicleState('ready');}).catch(()=>{if(!abort.signal.aborted)setVehicleState('error');});
  return()=>abort.abort();
 },[retryVehicles]);
 useEffect(()=>{
  if(requestKey===null)return;
  const abort=new AbortController(),key=requestKey+'#'+retryResults;
  fetch('/api/products?'+requestKey,{signal:abort.signal}).then(async r=>{const result=await r.json();if(!r.ok||!result.success)throw Error();return result;}).then(result=>{if(!abort.signal.aborted)setResponse({key,data:result,error:false});}).catch(()=>{if(!abort.signal.aborted)setResponse({key,data:null,error:true});});
  return()=>abort.abort();
 },[requestKey,retryResults]);
 function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const next=new URLSearchParams({search:'1',mode});
  if(mode==='vehicle'){
   if(!variants.some(v=>v.id===variantId))return;
   // The three-field reference design selects a real generation's year range.
   // The existing variant filter handles its full range without inventing a chassis or year.
   next.set('brandId',brandId);next.set('modelId',modelId);next.set('variantId',variantId);
  }else{
   if(!code.trim())return;
   next.set('q',code.trim());
  }
  router.push(`/${locale}/products?${next}#catalog-results`);
 }
 function paginate(page:number) {
  const next=new URLSearchParams();
  for(const [key,value] of Object.entries(query))if(value)next.set(key,value);
  next.set('page',String(page));next.set('search','1');
  router.push(`/${locale}/products?${next}#catalog-results`);
 }
 function modelYears(brand:string,model:string,referenceYears:string) {
  if(localPreview)return referenceYears;
  const variants=brands.find(b=>b.name.toLowerCase()===brand.toLowerCase())?.models.find(m=>m.name.toLowerCase()===model.toLowerCase())?.variants||[];
  return [...new Set(variants.map(v=>`${v.yearFrom} – ${v.yearTo??t.present}`))].join(' / ');
 }
 return <main id="main" className="product-center">
  <section className="catalog-hero" aria-labelledby="catalog-title"><div className="catalog-shell catalog-hero-content">
   <h1 id="catalog-title">{c.title}</h1><p className="catalog-hero-intro">{c.intro}</p><p className="catalog-hero-secondary">{c.introSecondary}</p>
   <div className="catalog-promises">{([{icon:'diamond',primary:c.quality,secondary:c.qualitySecondary},{icon:'gear',primary:c.fitment,secondary:c.fitmentSecondary},{icon:'truck',primary:c.expansion,secondary:c.expansionSecondary}] as const).map(item=><div key={item.icon}><Icon name={item.icon}/><span><strong>{item.primary}</strong><small>{item.secondary}</small></span></div>)}</div>
  </div></section>
  <section className="catalog-category-band" aria-label={c.moreCategories}><div className="catalog-shell catalog-categories">{productCenterCategories.map((category,index)=>{
   const content=<><span className="catalog-category-image"><Image unoptimized fill sizes="96px" style={{objectFit:'contain'}} src={`${images}/category-${category.id}.webp`} alt=""/></span><span className="catalog-category-copy"><strong>{c.categoryTitles[index]}</strong><small lang="en">{category.en}</small><small lang="vi">{category.vi}</small></span>{index===0?<span className="catalog-category-arrow" aria-hidden="true">→</span>:<span className="catalog-soon">{c.comingSoon}</span>}</>;
   return index===0?<a key={category.id} href="#catalog-search" className="catalog-category active" aria-current="true">{content}</a>:<div key={category.id} className="catalog-category" data-coming-soon="true">{content}</div>;
  })}</div></section>
  <section className="catalog-shock-section" aria-labelledby="catalog-shock-title"><div className="catalog-shell catalog-shock-inner">
   <div className="catalog-shock-photo"><Image unoptimized fill sizes="(max-width:640px) 90vw, 416px" style={{objectFit:'contain'}} src={`${images}/shock-range.webp`} alt="NEVERSTOP Shock Absorbers"/></div>
   <div className="catalog-shock-copy"><h2 id="catalog-shock-title"><span className="catalog-slash" aria-hidden="true"/>{c.shockTitle}<small>{c.shockSubtitle}</small></h2><p>{c.shockDescription}</p><p className="catalog-description-secondary">{c.shockSecondary}</p></div>
   <div id="catalog-search" className="catalog-finder"><div className="catalog-search-tabs" role="tablist" aria-label={t.vehicleSearch}>{(['vehicle','oem','part'] as const).map(value=><button key={value} type="button" id={`catalog-tab-${value}`} role="tab" aria-selected={mode===value} aria-controls="catalog-search-panel" onClick={()=>setMode(value)} onKeyDown={event=>{
     const modes:SearchMode[]=['vehicle','oem','part'],current=modes.indexOf(value);
     const next=event.key==='ArrowRight'?modes[(current+1)%3]:event.key==='ArrowLeft'?modes[(current+2)%3]:event.key==='Home'?'vehicle':event.key==='End'?'part':null;
     if(next){event.preventDefault();setMode(next);document.getElementById(`catalog-tab-${next}`)?.focus();}
    }} tabIndex={mode===value?0:-1}>{value==='vehicle'?c.byVehicle:value==='oem'?c.byOem:c.byPart}</button>)}</div>
    <div id="catalog-search-panel" role="tabpanel" aria-labelledby={`catalog-tab-${mode}`}><form className={`catalog-search-form${mode!=='vehicle'?' catalog-code-form':''}`} onSubmit={submit}>
     {mode==='vehicle'?<>
      <label htmlFor="catalog-brand">{c.brand}<select id="catalog-brand" value={brandId} disabled={vehicleState!=='ready'} required onChange={event=>{setBrandId(event.target.value);setModelId('');setVariantId('');}}><option value="">{c.brandExample}</option>{brands.map(brand=><option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
      <label htmlFor="catalog-model">{c.model}<select id="catalog-model" value={modelId} disabled={!brandId} required onChange={event=>{setModelId(event.target.value);setVariantId('');}}><option value="">{c.modelExample}</option>{models.map(model=><option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
      <label htmlFor="catalog-year">{c.year}<select id="catalog-year" value={variantId} disabled={!modelId} required onChange={event=>setVariantId(event.target.value)}><option value="">{c.yearExample}</option>{variants.map(variant=><option key={variant.id} value={variant.id}>{variant.yearFrom} – {variant.yearTo??t.present}{variants.length>1&&variant.modelCode?` · ${variant.modelCode}`:''}</option>)}</select></label>
     </>:<label htmlFor="catalog-code">{mode==='oem'?c.oem:c.part}<input id="catalog-code" type="search" required maxLength={100} value={code} onChange={event=>setCode(event.target.value)} placeholder={mode==='oem'?c.oemExample:c.partExample}/></label>}
     <button type="submit" className="catalog-search-submit"><Icon name="search"/>{c.search}</button>
    </form></div>
    {vehicleState==='error'&&<p className="catalog-load-error" role="alert">{t.vehicleError} <button type="button" onClick={()=>{setVehicleState('loading');setRetryVehicles(value=>value+1);}}>{t.retry}</button></p>}
   </div>
  </div></section>
  {submitted&&<section id="catalog-results" className="catalog-shell catalog-results" aria-live="polite" aria-busy={loading}>
   {loading&&<p role="status">{t.loadingProducts}</p>}{resultError&&<p role="alert">{t.productError} <button type="button" onClick={()=>setRetryResults(value=>value+1)}>{t.retry}</button></p>}
   {results&&<><h2>{t.results}</h2>{!results.data.length?<p>{t.noResults}</p>:<div className="catalog-results-grid">{results.data.map(product=><ProductCard key={product.id} locale={locale} product={product}/>)}</div>}{(results.page>1||results.hasMore)&&<div className="catalog-pagination"><button disabled={results.page===1} onClick={()=>paginate(results.page-1)}>{t.previous}</button><span>{t.page} {results.page}</span><button disabled={!results.hasMore} onClick={()=>paginate(results.page+1)}>{t.next}</button></div>}</>}
  </section>}
  <section className="catalog-popular catalog-shell" aria-labelledby="catalog-popular-title"><div className="catalog-popular-heading"><h2 id="catalog-popular-title">{c.popular}</h2><p>{c.popularIntro}</p><Link href={`/${locale}#vehicle-search`}>{c.moreVehicles}<span aria-hidden="true">→</span></Link></div>
   <div className="catalog-vehicle-grid">{productCenterVehicles.map(vehicle=>{
    const years=modelYears(vehicle.brand,vehicle.model,vehicle.referenceYears);
    const logo=vehicle.brand==='Toyota'?'toyota':vehicle.brand==='Mitsubishi'?'mitsubishi':vehicle.brand==='Ford'?'ford':'hyundai';
    return <Link key={vehicle.model} className="catalog-vehicle-card" href={`/${locale}/products?q=${encodeURIComponent(vehicle.model)}&search=1#catalog-results`}>
     <div className="catalog-vehicle-photo"><Image unoptimized fill sizes="(max-width:640px) 45vw, 193px" style={{objectFit:'contain'}} src={`${images}/vehicle-${vehicle.image}.webp`} alt={`${vehicle.brand} ${vehicle.model}`}/></div>
     <div className="catalog-vehicle-info"><span className="catalog-vehicle-logo"><Image unoptimized fill sizes="40px" style={{objectFit:'contain'}} src={`${images}/logo-${logo}.webp`} alt={vehicle.brand}/></span><h3 dir="ltr">{vehicle.brand} {vehicle.model}</h3><p>{c.vehicleProduct}</p>{years&&<small className="catalog-vehicle-years" dir="ltr" title={years}>{years}</small>}<span className="catalog-vehicle-arrow" aria-hidden="true">→</span></div>
    </Link>;
   })}</div>
  </section>
  <section className="catalog-shell catalog-more"><Image unoptimized src={`${images}/coming-cube.webp`} alt="" width={67} height={74}/><span className="catalog-slash" aria-hidden="true"/><div><h2>{c.moreCategories}</h2><p>{c.moreIntro}</p><p>{c.moreSecondary}</p></div><a href={zaloVideoAccount.href} target="_blank" rel="noopener noreferrer">{c.follow}<span aria-hidden="true">→</span></a></section>
 </main>;
}
