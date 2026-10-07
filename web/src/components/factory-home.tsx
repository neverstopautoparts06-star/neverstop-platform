import PopularVehicles from './popular-vehicles';
import StoreContact from './store-contact';
import {contentLocale} from '@/lib/i18n';
import SocialStrip from './social-strip';
import {HeroContacts} from './zalo-contact';
import BrandIcon from './brand-icon';
import '@/app/factory.css';
import ProductHighlights from './product-highlights';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Locale } from '@/lib/i18n';
import { homeCopy } from '@/lib/home-copy';
import { contacts } from '@/lib/site-config';
import VehicleSearch from './vehicle-search';
export default function FactoryHome({locale}:{locale:Locale}) {
 const c=homeCopy[contentLocale(locale)];
 return <main id="main" className="factory-home">

 <section className="factory-hero"><div className="hero-copy"><p className="eyebrow">{c.tag}</p><h1>{c.productName}</h1><p className="hero-direct">{c.title}</p><p className="hero-value">{c.accent.split(' · ').map(value=><span key={value}>{value}</span>)}</p><div className="hero-factory-proof"><div className="hero-credentials"><span><small>Since</small><b>1983</b></span><span><small>{c.certification.replace('TS16949','').trim()}</small><b>TS16949</b></span></div><ul><li>{c.customBrand}</li><li>{c.customShock}</li></ul></div></div><div className="hero-photo"><Image src="/images/camry-shocks.jpg" alt={`${c.front} NEVERSTOP Toyota Camry ACV40`} fill priority sizes="(max-width: 760px) 100vw, 55vw"/><span className="photo-label">SHOCK ABSORBERS / NEVERSTOP</span><div className="photo-caption"><span>{c.real}</span><b>01 — 04</b></div></div><HeroContacts locale={locale}/><div className="hero-bottom"><div className="compact-finder hero-finder"><Suspense fallback={<p>…</p>}><VehicleSearch locale={locale} compact/></Suspense></div></div></section>
 <ProductHighlights locale={locale}/>
 <PopularVehicles locale={locale}/>
 <section className="home-section process-section"><div className="section-top"><div><p className="eyebrow">{c.processTag}</p><h2>{c.processTitle}</h2></div><p>{c.processBody}</p></div><div className="process-grid">{['factory','warehouse','quality','shipping'].map((name,i)=><article key={name}><div className="process-image"><Image src={`/images/${name}.jpg`} alt={c.stages[i]} fill sizes="(max-width:760px) 50vw, 25vw"/><span>0{i+1}</span></div><h3>{c.stages[i]}</h3><p>{c.stageBodies[i]}</p></article>)}</div></section>
 <SocialStrip locale={locale}/>
 <StoreContact locale={locale}/>
 <div className="mobile-contact"><a href="#contact"><BrandIcon name="Zalo"/>{contacts[0].audience[contentLocale(locale)]} · {c.call} / Zalo</a><a href={contacts[1].zaloHref} target="_blank" rel="noopener noreferrer"><BrandIcon name="Zalo"/>{contacts[1].audience[contentLocale(locale)]} · Zalo ↗</a></div>
 </main>;
}
