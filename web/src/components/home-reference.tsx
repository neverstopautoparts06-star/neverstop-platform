'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {dictionary,type Locale} from '@/lib/i18n';
import type {VehicleBrand} from '@/lib/catalog-types';
import {homeReferenceCopy} from '@/lib/home-reference-copy';
import {productCenterCategories,productCenterCopy,productCenterVehicles} from '@/lib/product-center-copy';
import {popularVehicles} from '@/lib/popular-vehicles';
import {brandKey,brandLogoMapping} from '@/lib/vehicle-brand-logos';
import {zaloVideoAccount} from '@/lib/social-config';
import {zaloChannels} from '@/lib/zalo-config';
import {contactEmail} from '@/lib/contact-intake';
import BrandLogoWall from './brand-logo-wall';
import BrandIcon from './brand-icon';
import ContactIntake from './contact-intake';
import './home-reference.css';

const images='/images/home-reference';
const referenceOrder=productCenterVehicles.map(v=>`${v.brand} ${v.model}`);
const vehicles=[...popularVehicles].sort((a,b)=>{
 const ai=referenceOrder.indexOf(`${a.brand} ${a.model}`),bi=referenceOrder.indexOf(`${b.brand} ${b.model}`);
 return (ai===-1?100:ai)-(bi===-1?100:bi);
});
const batches=[vehicles.slice(0,10),vehicles.slice(10,20)];
function Photo({name,alt='',sizes='30vw',priority=false}:{name:string;alt?:string;sizes?:string;priority?:boolean}){
 return <Image unoptimized fill sizes={sizes} preload={priority} src={`${images}/${name}.webp`} alt={alt} style={{objectFit:'contain'}}/>;
}
function Icon({name}:{name:'diamond'|'gear'|'shield'|'truck'|'car'|'search'|'pin'|'clock'|'mail'}){
 const paths={
  diamond:<><path d="m2 9 5-6h10l5 6-10 13L2 9Z"/><path d="M2 9h20M7 3l5 6 5-6M12 9v13"/></>,
  gear:<><path d="m9 2-.6 3-2 .9-2.7-1.2-2 3.5L4 10v3l-2.3 1.8 2 3.5 2.7-1.2 2 .9L9 21h4l.6-3 2-.9 2.7 1.2 2-3.5L18 13v-3l2.3-1.8-2-3.5L15.6 6l-2-.9L13 2Z"/><circle cx="11" cy="11.5" r="3.5"/></>,
  shield:<><path d="m12 2 9 3v7c0 5-9 10-9 10S3 17 3 12V5l9-3Z"/><path d="M12 7v9M8 11h8"/></>,
  truck:<><path d="M2 4h13v13H2V4Zm13 5h4l3 4v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  car:<><path d="m4 9 2-5h12l2 5M3 9h18v8H3V9ZM5 17v3m14-3v3M6 12h2m8 0h2"/></>,
  search:<><circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/></>,
  pin:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  clock:<><circle cx="12" cy="12" r="10"/><path d="M12 5v7h6"/></>,
  mail:<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></>,
 };
 return <svg className="home-ref-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function HomeReference({locale,localPreview,social,storefront,hours}:{locale:Locale;localPreview:boolean;social:ReactNode;storefront?:string;hours?:string}){
 const c=homeReferenceCopy(locale),s=productCenterCopy(locale),t=dictionary(locale),router=useRouter();
 const [brands,setBrands]=useState<VehicleBrand[]>([]),[state,setState]=useState<'loading'|'ready'|'error'>('loading'),[retry,setRetry]=useState(0);
 const [brandId,setBrandId]=useState(''),[modelId,setModelId]=useState(''),[variantId,setVariantId]=useState('');
 const [mode,setMode]=useState<'vehicle'|'oem'>('vehicle'),[code,setCode]=useState(''),[batch,setBatch]=useState(0);
 const models=brands.find(b=>b.id===brandId)?.models||[],variants=models.find(m=>m.id===modelId)?.variants||[];
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/vehicles',{signal:controller.signal}).then(async response=>{const result=await response.json();if(!response.ok||!result.success)throw Error();return result.data as VehicleBrand[];}).then(data=>{setBrands(data);setState('ready');}).catch(()=>{if(!controller.signal.aborted)setState('error');});
  return()=>controller.abort();
 },[retry]);
 useEffect(()=>{
  const sync=()=>{if(window.location.hash==='#oem-search'||window.location.hash==='#oe-search')setMode('oem');else if(window.location.hash==='#vehicle-search')setMode('vehicle');};
  sync();window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
  return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);};
 },[]);
 function chooseMode(value:'vehicle'|'oem'){
  setMode(value);window.history.replaceState(null,'',value==='oem'?'#oem-search':'#vehicle-search');window.dispatchEvent(new Event('hashchange'));
 }
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const query=new URLSearchParams({search:'1',mode});
  if(mode==='vehicle'){
   if(!variants.some(v=>v.id===variantId))return;
   query.set('brandId',brandId);query.set('modelId',modelId);query.set('variantId',variantId);
  }else{if(!code.trim())return;query.set('q',code.trim());}
  router.push(`/${locale}/products?${query}#catalog-results`);
 }
 function selectBrand(id:string){
  setBrandId(id);setModelId('');setVariantId('');chooseMode('vehicle');document.getElementById('vehicle-search')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});requestAnimationFrame(()=>document.getElementById('home-model')?.focus({preventScroll:true}));
 }
 function modelYears(brand:string,model:string){
  const reference=productCenterVehicles.find(v=>v.brand===brand&&v.model===model);
  if(localPreview&&reference)return reference.model==='Fortuner'?'2018 – 2024':reference.referenceYears;
  const found=brands.find(b=>brandKey(b.name)===brandKey(brand))?.models.find(m=>brandKey(m.name)===brandKey(model))?.variants||[];
  return [...new Set(found.map(v=>`${v.yearFrom} – ${v.yearTo??t.present}`))].join(' / ');
 }
 const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('183 Lạc Nghiệp, Bạch Mai, Hà Nội, Vietnam');
 return <main id="main" className="factory-home home-reference" lang={locale}>
  <section className="home-ref-hero" aria-labelledby="home-ref-title">
   <div className="home-ref-hero-photo"><Image unoptimized fill preload src="/images/hero-neverstop-v2.jpg" alt={`NEVERSTOP · ${c.illustration}`} sizes="(max-width:640px) 180vw, (max-width:1500px) 100vw, 1500px"/></div>
   <div className="home-ref-shell home-ref-hero-inner"><div className="home-ref-hero-copy"><p className="home-ref-eyebrow">{c.direct}</p><h1 id="home-ref-title"><span>{c.line1}</span><span><em>{c.highlight}</em> {c.line2}</span></h1><p className="home-ref-hero-intro">{c.intro}</p>
    <div className="home-ref-benefits">{(['diamond','gear','shield','truck'] as const).map((name,i)=><div key={name}><Icon name={name}/><span><strong>{c.benefits[i]}</strong><small>{c.benefitNotes[i]}</small></span></div>)}</div>
   </div></div>
  </section>
  <div className="home-ref-search-band"><div className="home-ref-shell home-ref-finder" id="vehicle-search"><span id="oem-search"/><span id="oe-search"/>
   <div role="tablist" className="home-ref-search-tabs" aria-label={t.vehicleSearch}>{(['vehicle','oem'] as const).map(value=><button key={value} type="button" role="tab" id={`home-tab-${value}`} aria-selected={mode===value} aria-controls="home-search-panel" tabIndex={mode===value?0:-1} onClick={()=>chooseMode(value)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'vehicle':event.key==='End'?'oem':value==='vehicle'?'oem':'vehicle';chooseMode(next);document.getElementById(`home-tab-${next}`)?.focus();}}}><Icon name="car"/>{value==='vehicle'?s.byVehicle:s.byOem}</button>)}</div>
   <div role="tabpanel" id="home-search-panel" aria-labelledby={`home-tab-${mode}`}><form className={`home-ref-search-form${mode==='oem'?' home-ref-code-form':''}`} onSubmit={submit}>
    {mode==='vehicle'?<>
     <label htmlFor="home-brand">{s.brand}<select id="home-brand" required disabled={state!=='ready'} value={brandId} onChange={event=>{setBrandId(event.target.value);setModelId('');setVariantId('');}}><option value="">{s.brandExample}</option>{brands.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></label>
     <label htmlFor="home-model">{s.model}<select id="home-model" required disabled={!brandId} value={modelId} onChange={event=>{setModelId(event.target.value);setVariantId('');}}><option value="">{s.modelExample}</option>{models.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></label>
     <label htmlFor="home-year">{s.year}<select id="home-year" required disabled={!modelId} value={variantId} onChange={event=>setVariantId(event.target.value)}><option value="">{s.yearExample}</option>{variants.map(v=><option value={v.id} key={v.id}>{v.yearFrom} – {v.yearTo??t.present}{variants.length>1&&v.modelCode?` · ${v.modelCode}`:''}</option>)}</select></label>
    </>:<label htmlFor="home-code">{s.oem}<input id="home-code" required type="search" maxLength={100} value={code} onChange={event=>setCode(event.target.value)} placeholder={s.oemExample}/></label>}
    <button type="submit" className="home-ref-yellow home-ref-submit"><Icon name="search"/>{s.search}</button>
   </form></div>
   {state==='error'&&<p className="home-ref-load-error" role="alert">{t.vehicleError} <button type="button" onClick={()=>{setState('loading');setRetry(v=>v+1);}}>{t.retry}</button></p>}
  </div></div>
  <section className="home-ref-categories home-ref-shell" aria-labelledby="home-categories-title"><div className="home-ref-heading"><h2 id="home-categories-title">{c.categories}<small>/ PRODUCT CATEGORIES</small></h2><Link href={`/${locale}/products`}>{c.moreProducts} →</Link></div>
   <div className="home-ref-category-grid">{productCenterCategories.map((category,i)=>{
    const content=<><div className="home-ref-category-photo"><Photo name={`category-${category.id}`} sizes="(max-width:640px) 45vw, 15vw"/></div><div className="home-ref-category-copy"><h3>{s.categoryTitles[i]}</h3><p lang="en">{category.en}</p><p lang="vi">{category.vi}</p>{i===0?<span className="home-ref-round-arrow" aria-hidden="true">→</span>:<span className="home-ref-coming">{s.comingSoon}</span>}</div></>;
    return i===0?<Link className="home-ref-category active" href={`/${locale}/products`} key={category.id}>{content}</Link>:<article className="home-ref-category" data-coming-soon="true" key={category.id}>{content}</article>;
   })}</div>
  </section>
  <div className="home-ref-brands home-ref-shell"><BrandLogoWall reference locale={locale} brands={brands} state={state} selectedId={brandId} onSelect={selectBrand}/></div>
  <section className="home-ref-popular" id="popular-models" aria-labelledby="home-popular-title"><div className="home-ref-shell"><div className="home-ref-heading"><h2 id="home-popular-title">{s.popular}<small>/ POPULAR MODELS</small></h2><Link href={`/${locale}/products`}>{s.moreVehicles} →</Link></div><p className="home-ref-popular-intro">{s.popularIntro}</p>
   {batches.map((list,index)=><div className="home-ref-model-row" hidden={batch!==index} key={index} aria-label={`${index*10+1}–${index*10+10} / 20`}>{list.map(vehicle=>{
    const reference=productCenterVehicles.find(v=>v.brand===vehicle.brand&&v.model===vehicle.model),years=modelYears(vehicle.brand,vehicle.model),logo=brandLogoMapping[brandKey(vehicle.brand)]?.logoUrl;
    return <Link className="home-ref-model-card" key={vehicle.vehicleName} href={`/${locale}${vehicle.href}#catalog-results`}>
     <div className="home-ref-model-photo">{reference?<Photo name={`vehicle-${reference.image}`} alt={vehicle.vehicleName} sizes="(max-width:640px) 65vw, 15vw"/>:<div role="img" aria-label={vehicle.vehicleName} className="home-ref-model-atlas" style={{backgroundImage:`url(${vehicle.vehicleImage})`,backgroundSize:vehicle.vehicleImageSize,backgroundPosition:vehicle.position}}/>}</div>
     <div className="home-ref-model-info"><h3 dir="ltr">{logo&&<span className="home-ref-model-logo"><Image unoptimized fill sizes="28px" src={logo} alt="" style={{objectFit:'contain'}}/></span>}{vehicle.vehicleName}</h3><p>{s.vehicleProduct}</p>{years&&<small dir="ltr" title={years}>{years}</small>}<div className="home-ref-model-shock"><Photo name="product-shocks" sizes="90px"/><span className="home-ref-round-arrow" aria-hidden="true">→</span></div></div>
    </Link>;
   })}</div>)}
   <div className="home-ref-model-controls"><button type="button" disabled={batch===0} aria-label={c.previous} onClick={()=>setBatch(0)}>←</button><span aria-live="polite">{batch*10+1}–{batch*10+10} / 20</span><button type="button" disabled={batch===1} aria-label={c.next} onClick={()=>setBatch(1)}>→</button></div>
  </div></section>
  <section className="home-ref-factory" aria-labelledby="home-factory-title"><div className="home-ref-shell home-ref-factory-grid"><div className="home-ref-factory-copy"><p className="home-ref-eyebrow">NEVERSTOP</p><h2 id="home-factory-title">{c.factoryTitle}</h2><p>{c.factoryBody}</p><a className="home-ref-yellow" href={zaloVideoAccount.href} target="_blank" rel="noopener noreferrer">{c.factoryCta}<span aria-hidden="true">→</span></a></div>
   <div className="home-ref-factory-stages">{['production','testing','warehouse','packing'].map((stage,i)=><article key={stage}><div className="home-ref-factory-photo"><Photo name={`factory-${stage}`} alt={`${c.stages[i]} · ${c.illustration}`} sizes="(max-width:640px) 42vw, 15vw"/></div><span className="home-ref-stage-number">0{i+1}</span><h3>{c.stages[i]}</h3><p>{c.stageNotes[i]}</p></article>)}</div>
  </div></section>
  {social}
  <section id="contact" className="home-ref-store" aria-labelledby="home-store-title"><div className="home-ref-store-photo">{storefront?<Image unoptimized fill src={storefront} sizes="60vw" alt="NEVERSTOP · Hà Nội" style={{objectFit:'cover'}}/>:<Photo name="storefront" alt={`NEVERSTOP · ${c.illustration}`} sizes="60vw"/>}</div><div className="home-ref-shell home-ref-store-content"><div className="home-ref-store-copy"><h2 id="home-store-title">{c.storeTitle}</h2><p>{c.storeBody}<br/>{c.storeContact}</p></div><div className="home-ref-store-bottom"><div className="home-ref-store-facts"><a className="home-ref-store-fact" href={maps} target="_blank" rel="noopener noreferrer"><Icon name="pin"/><span><strong>{c.address}</strong><address>Số 183 Lạc Nghiệp,<br/>Bạch Mai, Hà Nội, Việt Nam</address></span></a><div className="home-ref-store-fact"><Icon name="clock"/><span><strong>{c.hours}</strong>{hours?<p>{hours}</p>:<ContactIntake asLink channel="ZALO" locale={locale}>{c.confirmHours}</ContactIntake>}</span></div><ContactIntake asLink channel="ZALO" locale={locale} className="home-ref-store-qr" label={c.qr}><Image unoptimized width={44} height={44} src={zaloChannels.B2B.qr} alt=""/><span>{c.qr}</span></ContactIntake></div>
   <div className="home-ref-store-actions"><ContactIntake asLink channel="ZALO" locale={locale} className="home-ref-zalo"><BrandIcon name="Zalo" size={26}/>{c.zalo}</ContactIntake><ContactIntake asLink channel="WHATSAPP" locale={locale} className="home-ref-whatsapp"><BrandIcon name="WhatsApp" size={26}/>WhatsApp</ContactIntake><ContactIntake asLink channel="EMAIL" locale={locale} className="home-ref-email"><Icon name="mail"/><span>{c.email}</span><span dir="ltr">{contactEmail}</span></ContactIntake></div>
  </div><p className="home-ref-visual-note">{c.visualNote}</p></div></section>
 </main>;
}
