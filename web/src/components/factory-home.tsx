import StoreContact from './store-contact';
import {contentLocale} from '@/lib/i18n';
import SocialStrip from './social-strip';
import {HeroContacts} from './zalo-contact';
import BrandIcon from './brand-icon';
import '@/app/factory.css';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Locale } from '@/lib/i18n';
import { homeCopy } from '@/lib/home-copy';
import { contacts } from '@/lib/site-config';
import VehicleSearch from './vehicle-search';
const vehicles = ['Toyota Vios','Toyota Camry','Toyota Corolla Altis','Toyota Fortuner','Hyundai Grand i10','Kia Morning'];
export default function FactoryHome({locale}:{locale:Locale}) {
 const c=homeCopy[contentLocale(locale)];
 return <main id="main" className="factory-home">

 <section className="factory-hero"><div className="hero-copy"><p className="eyebrow">{c.tag}</p><h1>{c.title}</h1><p className="hero-value">{c.accent}</p><p className="hero-intro">{c.intro}</p></div><div className="hero-photo"><Image src="/images/camry-shocks.jpg" alt={`${c.front} NEVERSTOP Toyota Camry ACV40`} fill priority sizes="(max-width: 760px) 100vw, 55vw"/><span className="photo-label">SHOCK ABSORBERS / NEVERSTOP</span><div className="photo-caption"><span>{c.real}</span><b>01 — 04</b></div></div><HeroContacts locale={locale}/><div className="hero-bottom"><div className="compact-finder hero-finder"><Suspense fallback={<p>…</p>}><VehicleSearch locale={locale} compact/></Suspense></div></div></section>
 <section className="home-section product-section"><div className="section-top"><div><p className="eyebrow">{c.productTag}</p><h2>{c.productTitle}</h2></div><p>{c.productBody}</p></div><div className="product-editorial"><Link href={`/${locale}/products?axle=FRONT`} className="product-feature"><div className="product-image"><Image src="/images/camry-shocks.jpg" alt={c.front} fill sizes="(max-width:760px) 100vw, 60vw"/></div><div className="product-meta"><div><span>NEVERSTOP / SHOCK ABSORBER</span><h3>{c.front}</h3></div><b>↗</b></div></Link><div className="product-side"><Link href={`/${locale}/products`}><div className="detail-image"><Image src="/images/shock-detail.jpg" alt={c.details} fill sizes="(max-width:760px) 100vw, 35vw"/></div><div className="product-meta"><div><span>NEVERSTOP / COLLECTION</span><h3>{c.details}</h3></div><b>↗</b></div></Link><a className="fitment-note" href="#contact">{c.check}<span>↗</span></a></div></div></section>
 <section className="home-section popular-section"><div className="section-top"><div><p className="eyebrow">{c.popularTag}</p><h2>{c.popularTitle}</h2></div><p>{c.popularBody}</p></div><div className="vehicle-links">{vehicles.map((name,i)=><Link key={name} href={`/${locale}/products?q=${encodeURIComponent(name.replace(/^(Toyota|Hyundai|Kia) /,''))}&search=1`}><small>0{i+1}</small><span>{name}</span><b>↗</b></Link>)}</div></section>
 <section className="road-section"><Image src="/images/camry.jpg" alt="Toyota Camry ACV40" fill sizes="100vw"/><div className="road-shade"/><div className="road-copy"><p className="eyebrow">{c.sceneTag}</p><h2>{c.sceneTitle}</h2><p>{c.sceneBody}</p><a className="button primary" href="#contact">{c.sceneCta} ↗</a></div><small>{c.reference}</small></section>
 <section className="home-section process-section"><div className="section-top"><div><p className="eyebrow">{c.processTag}</p><h2>{c.processTitle}</h2></div><p>{c.processBody}</p></div><div className="process-grid">{['factory','warehouse','quality','shipping'].map((name,i)=><article key={name}><div className="process-image"><Image src={`/images/${name}.jpg`} alt={c.stages[i]} fill sizes="(max-width:760px) 50vw, 25vw"/><span>0{i+1}</span></div><h3>{c.stages[i]}</h3><p>{c.stageBodies[i]}</p></article>)}</div></section>
 <SocialStrip locale={locale}/>
 <StoreContact locale={locale}/>
 <div className="mobile-contact"><a href="#contact"><BrandIcon name="Zalo"/>{contacts[0].audience[contentLocale(locale)]} · {c.call} / Zalo</a><a href={contacts[1].zaloHref} target="_blank" rel="noopener noreferrer"><BrandIcon name="Zalo"/>{contacts[1].audience[contentLocale(locale)]} · Zalo ↗</a></div>
 </main>;
}
