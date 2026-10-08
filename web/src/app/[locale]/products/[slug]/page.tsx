import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {isLocale,locales,localized,type Locale} from '@/lib/i18n';
import {getProduct,getRelatedProducts} from '@/lib/product-details';
import {productDetailCopy,type ProductDetailCopy} from '@/lib/product-detail-copy';
import {productDetailView,type DetailRow} from '@/lib/product-detail-view';
import {referenceGallery,referencePackaging,referencePackagingRows,referenceRelatedPhotos} from '@/lib/product-reference-images';
import {siteOrigin} from '@/lib/site-config';
import ProductGallery from '@/components/product-gallery';
import ProductInquiryActions from '@/components/product-inquiry-actions';
import ProductPartNumber from '@/components/product-part-number';
import ProductDetailIcon,{type ProductIconName} from '@/components/product-detail-icon';
import './product-detail.css';

type Props={params:Promise<{locale:string;slug:string}>};
type CopyKey=keyof ProductDetailCopy;
const en=productDetailCopy('en'),vi=productDetailCopy('vi');
function englishLabel(label:string,locale:Locale){
  const copy=productDetailCopy(locale);
  const key=(Object.keys(en) as (keyof typeof en)[]).find(key=>copy[key]===label);
  return key?en[key]:label;
}
function BilingualLabel({label,english,stack=false}:{label:string;english:string;stack?:boolean}){
  return <>{label}{label!==english&&<small className={stack?'pdp-label-secondary stacked':'pdp-label-secondary'}><span aria-hidden="true">{stack?'':' / '}</span><bdi lang="en">{english}</bdi></small>}</>;
}
function Parameters({rows,locale}:{rows:DetailRow[];locale:Locale}){
  return <dl className="pdp-parameters">{rows.map(row=><div key={row.label}><dt><BilingualLabel label={row.label} english={englishLabel(row.label,locale)}/></dt><dd>{row.value}</dd></div>)}</dl>;
}
function DetailSection({number,sectionKey,locale,children,id,extra}:{number:string;sectionKey:CopyKey;locale:Locale;children:ReactNode;id:string;extra?:ReactNode}){
  const t=productDetailCopy(locale);
  return <section className="pdp-section" aria-labelledby={id}><div className="pdp-section-heading"><h2 id={id}><span className="pdp-section-number" aria-hidden="true">{number}</span><span><BilingualLabel label={locale==='en'?en[sectionKey].toUpperCase():t[sectionKey]} english={en[sectionKey].toUpperCase()}/></span></h2>{locale!=='vi'&&<span className="pdp-section-caption" lang="vi">{vi[sectionKey].toUpperCase()}</span>}{extra}</div>{children}</section>;
}
function safeImage(url:string){return (url.startsWith('/')&&!url.startsWith('//'))||url.startsWith('https://');}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale,slug}=await params;if(!isLocale(locale))return {};
  const p=await getProduct(slug);if(!p)return {};
  const t=productDetailCopy(locale),view=productDetailView(p,locale),origin=siteOrigin();
  const vehicle=view.vehicleTitles.join(' / ');
  const title=[vehicle||view.name,vehicle?t.shockAbsorber:null,p.partNumber].filter(Boolean).join(' ');
  const description=p.seoDescription?.trim()||[view.name,vehicle,view.years,p.partNumber,view.oem.length?`${t.referenceOem}: ${view.oem.join(', ')}`:null,t.oemNote].filter(Boolean).join(' · ');
  const path=`/${locale}/products/${encodeURIComponent(slug)}`;
  return {title,description,keywords:[...view.vehicleTitles,p.partNumber,...view.oem],
    ...(origin?{alternates:{canonical:origin+path,languages:Object.fromEntries(locales.map(l=>[l==='zh'?'zh-CN':l,`${origin}/${l}/products/${encodeURIComponent(slug)}`]))}}:{}),
  };
}

export default async function ProductPage({params}:Props){
  const {locale,slug}=await params;if(!isLocale(locale))notFound();
  const p=await getProduct(slug);if(!p)notFound();
  const localPreview=process.env.LOCAL_CATALOG_PREVIEW==='1';
  const t=productDetailCopy(locale),view=productDetailView(p,locale,localPreview);
  const related=await getRelatedProducts(p);
  const realImages=p.images.filter(image=>safeImage(image.url));
  const gallery=realImages.length?realImages:referenceGallery(p.partNumber);
  const temporaryImages=!realImages.length&&gallery.length>0;
  const packagingImages=view.packagingImages.filter(image=>safeImage(image.url));
  const referencePack=referencePackaging(p.partNumber);
  const packPhotos=packagingImages.length?packagingImages:referencePack;
  const temporaryPack=!packagingImages.length&&referencePack.length>0;
  const packagingExample=localPreview&&view.packaging.length===0&&temporaryPack;
  const packagingRows=packagingExample?referencePackagingRows(t,localPreview):view.packaging;
  const relatedPlaceholders=localPreview&&related.length>0?referenceRelatedPhotos.slice(0,Math.max(0,3-related.length)):[];
  const showGeneration=view.fitments.some(f=>f.generation);
  const showEngine=view.fitments.some(f=>f.engine);
  const fitmentColumns:CopyKey[]=['brand','model',...(showGeneration?['generation' as const]:[]),'year',...(showEngine?['engine' as const]:[]),...(view.axle?['axle' as const]:[]),...(view.position?['position' as const]:[]),...(view.oem.length?['referenceOem' as const]:[]),'partNumber'];
  const icons:Partial<Record<CopyKey,ProductIconName>>={brand:'brand',model:'model',generation:'generation',year:'year',position:'position',productType:'productType',unit:'unit',axle:'axle',stock:'stock'};
  const coreLeft=view.core.filter(row=>[t.brand,t.model,t.generation,t.year].includes(row.label));
  const coreRight=view.core.filter(row=>!coreLeft.includes(row));
  const subtitleKey=p.axle==='FRONT'?'frontShock':p.axle==='REAR'?'rearShock':'shockAbsorber';
  const subtitle=[...new Set([t[subtitleKey],en[subtitleKey],vi[subtitleKey]])].join(' / ');
  return <main id="main" className="product-detail">
    <div className="pdp-container">
      <nav className="pdp-breadcrumb" aria-label={t.products}><Link href={`/${locale}`}>{t.home}</Link><span aria-hidden="true">›</span><Link href={`/${locale}/products`}>{t.products}</Link>{view.brands&&<><span aria-hidden="true">›</span><Link href={`/${locale}/products?q=${encodeURIComponent(view.brands)}`}>{view.brands}</Link></>}{view.models&&<><span aria-hidden="true">›</span><Link href={`/${locale}/products?q=${encodeURIComponent(view.models)}`}>{view.models}</Link></>}<span aria-hidden="true">›</span><span dir="ltr">{p.partNumber}</span></nav>
      <div className="pdp-first-screen">
        <ProductGallery key={p.id} images={gallery} name={view.name} empty={t.photoPending} labels={t} temporary={temporaryImages}/>
        <div className="pdp-summary">
          <h1>{view.vehicleTitles[0]||view.name}</h1>
          <p className="pdp-product-name">{subtitle}</p>
          {view.fitments.length>1&&<a className="pdp-fitment-jump" href="#vehicle-fitment">{t.moreFitments} ({view.fitments.length}) ↓</a>}
          <ProductPartNumber value={p.partNumber} label={locale==='en'?en.partNumber.toUpperCase():t.partNumber} copy={t.copyPartNumber} copied={t.copied} unavailable={t.copyUnavailable}/>
          {view.oem.length>0&&<div className="pdp-oem"><h2><BilingualLabel label={t.referenceOem} english={en.referenceOem}/></h2><ul>{view.oem.map(number=><li key={number} dir="ltr">{number}</li>)}</ul><p className="pdp-note">{[...new Set([t.oemNote,en.oemNote,vi.oemNote])].join(' / ')}</p></div>}
          <div className="pdp-core-columns">{[coreLeft,coreRight].map((column,i)=><dl className="pdp-core" key={i}>{column.map(row=>{
            const key=(Object.keys(icons) as CopyKey[]).find(key=>t[key]===row.label),stock=key==='stock';
            return <div key={row.label}><span className="pdp-core-icon"><ProductDetailIcon name={key&&icons[key]||'unit'} size={18}/></span><dt><BilingualLabel label={row.label} english={englishLabel(row.label,locale)}/></dt><dd className={stock?'pdp-stock':undefined}>{stock&&<span className={`pdp-stock-dot${view.inStock?' available':''}`} aria-hidden="true"/>}{row.value}</dd></div>;
          })}</dl>)}</div>
          <ProductInquiryActions context={view.context} labels={t}/>
        </div>
      </div>
      <div className={`pdp-specification-grid${view.technical.length?' has-technical':''}`}>
        <DetailSection id="product-information" number="01" sectionKey="productInformation" locale={locale}><Parameters rows={view.information} locale={locale}/>{view.description?.trim()&&<div className="pdp-description"><h3>{t.description}</h3><p>{view.description}</p></div>}</DetailSection>
        {view.technical.length>0&&<DetailSection id="technical-data" number="02" sectionKey="technicalData" locale={locale}><Parameters rows={view.technical} locale={locale}/></DetailSection>}
      </div>
      {view.fitments.length>0&&<DetailSection id="vehicle-fitment" number="03" sectionKey="vehicleFitment" locale={locale}>
        <div className="pdp-fitment-scroll" tabIndex={0} role="region" aria-label={t.vehicleFitment}><table className="pdp-fitment-table"><thead><tr>{fitmentColumns.map(key=><th key={key} scope="col"><BilingualLabel label={t[key]} english={en[key]} stack/></th>)}</tr></thead><tbody>{view.fitments.map(f=><tr key={f.id}><td>{f.brand}</td><td>{f.model}</td>{showGeneration&&<td>{f.generation}</td>}<td>{f.year}</td>{showEngine&&<td>{f.engine}</td>}{view.axle&&<td>{view.axle}</td>}{view.position&&<td>{view.position}</td>}{view.oem.length>0&&<td><span className="pdp-table-oem" dir="ltr">{view.oem.join(' / ')}</span></td>}<td><strong dir="ltr">{p.partNumber}</strong></td></tr>)}</tbody></table></div>
        {view.oem.length>0&&<p className="pdp-note">{t.oemNote} {t.oemScope}</p>}
      </DetailSection>}
      {(packagingRows.length>0||packPhotos.length>0)&&<DetailSection id="packaging-logistics" number="04" sectionKey="packaging" locale={locale}><div className={`pdp-packaging${packPhotos.length?' has-image':''}${packagingRows.length?' has-data':''}`} data-reference-example={packagingExample||undefined}>
        {packPhotos.slice(0,1).map(image=><div key={image.id} className="pdp-packaging-image"><Image src={image.url} alt={image.altText||t.packagingPhoto} fill sizes="(max-width:800px) 100vw, 35vw" className="pdp-contain" unoptimized/></div>)}
        {packagingRows.length>0&&<Parameters rows={packagingRows} locale={locale}/>}
        {packPhotos.slice(1,2).map(image=><div key={image.id} className="pdp-packaging-image"><Image src={image.url} alt={image.altText||t.packagingPhoto} fill sizes="(max-width:800px) 100vw, 25vw" className="pdp-contain" unoptimized/></div>)}
      </div>{packagingExample?<p className="pdp-image-caption">{t.packagingExample}</p>:temporaryPack&&<p className="pdp-image-caption">{t.temporaryPackaging}</p>}</DetailSection>}
      {related.length>0&&<DetailSection id="related-products" number="05" sectionKey="relatedProducts" locale={locale} extra={<Link className="pdp-related-more" href={`/${locale}/products?q=${encodeURIComponent(view.models||p.partNumber)}`}>{t.viewProduct} <span aria-hidden="true">→</span></Link>}><div className="pdp-related">{related.map(product=>{
        const name=localized(product,locale),image=product.images.find(image=>safeImage(image.url))||referenceGallery(product.partNumber)[0];
        const axle=product.axle?{FRONT:t.front,REAR:t.rear,OTHER:t.other}[product.axle]:null;
        const side=product.side&&product.side!=='NA'?{LEFT:t.left,RIGHT:t.right,BOTH:t.both}[product.side]:null;
        return <Link key={product.id} href={`/${locale}/products/${encodeURIComponent(product.slug)}`} className="pdp-related-card"><div className="pdp-related-image">{image?<Image src={image.url} alt={image.altText||name} fill sizes="150px" className="pdp-contain" unoptimized/>:<span>{t.photoPending}</span>}</div><div><strong dir="ltr">{product.partNumber}</strong><h3>{name}</h3>{(axle||side)&&<p>{[axle,side].filter(Boolean).join(' · ')}</p>}<span className="pdp-related-arrow" aria-hidden="true">→</span></div></Link>;
      })}{relatedPlaceholders.map((url,index)=><article className="pdp-related-card pdp-related-placeholder" key={url} aria-label={t.relatedPending} data-reference-example="true"><div className="pdp-related-image"><Image src={url} alt={t.relatedExample} fill sizes="(max-width:800px) 110px, 15vw" className="pdp-contain" unoptimized/></div><div><strong>{t.relatedPending}</strong><h3>{t.relatedExample}</h3><p>{String(index+2).padStart(2,'0')}</p></div></article>)}</div>{relatedPlaceholders.length>0&&<p className="pdp-image-caption">{t.relatedPreviewNote}</p>}</DetailSection>}
    </div>
  </main>;
}
