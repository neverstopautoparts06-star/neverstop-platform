import {ZaloChatButton} from '@/components/zalo-contact';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dictionary, isLocale, localized } from '@/lib/i18n';
import { getProduct } from '@/lib/product-details';
import ProductGallery from '@/components/product-gallery';
import { siteOrigin } from '@/lib/site-config';
type Props={params:Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Props) {
 const {locale,slug}=await params;if(!isLocale(locale))return{};const p=await getProduct(slug);if(!p)return{};const origin=siteOrigin();
 return {title:localized(p,locale),description:localized(p,locale)+' · '+p.partNumber,...(origin?{alternates:{canonical:`${origin}/${locale}/products/${slug}`,languages:{vi:`${origin}/vi/products/${slug}`,en:`${origin}/en/products/${slug}`,'zh-CN':`${origin}/zh/products/${slug}`}}}:{})};
}
export default async function ProductPage({params}:Props) {
 const {locale,slug}=await params;if(!isLocale(locale))notFound();const p=await getProduct(slug);if(!p)notFound();const t=dictionary(locale);
 const name=localized(p,locale),description=(locale==='en'?p.descriptionEn:locale==='zh'?p.descriptionZh:p.descriptionVi)||p.descriptionVi;
 const fallback=locale!=='vi'&&(!(locale==='en'?p.nameEn:p.nameZh)||(p.descriptionVi&&!(locale==='en'?p.descriptionEn:p.descriptionZh)));
 const stock=p.inventory.reduce((sum,row)=>sum+Math.max(0,row.quantity-row.reservedQuantity),0);
 const specs=[[t.position,p.axle?t[p.axle]:null],[t.netWeight,p.netWeightKg?.toString()],[t.grossWeight,p.grossWeightKg?.toString()],[t.piecesCarton,p.piecesPerCarton?.toString()],[t.carton,p.cartonLengthCm&&p.cartonWidthCm&&p.cartonHeightCm?[p.cartonLengthCm,p.cartonWidthCm,p.cartonHeightCm].join(' × '):null]].filter(([,v])=>v);
 return <main id="main" className="mx-auto max-w-7xl px-6 py-12 text-white"><Link href={`/${locale}/products`} className="text-sm text-orange-500">{t.backProducts}</Link><div className="mt-8 grid gap-10 md:grid-cols-2"><ProductGallery images={p.images} name={name} empty={t.noImage}/><div><p className="break-all text-sm font-bold text-orange-500">{p.partNumber}</p><h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">{name}</h1><p className="mt-5 text-orange-400">{stock>0?t.inStock:t.outStock}</p><p className="mt-3 text-lg font-bold">{t.priceQuote}</p><p className="mt-5 whitespace-pre-wrap leading-7 text-zinc-400">{description||t.noDescription}</p>{fallback&&<p className="mt-3 text-xs text-zinc-500">{t.translationFallback}</p>}<ZaloChatButton context={{productName:name,partNumber:p.partNumber,oeNumber:p.oeNumbers.map(o=>o.oeNumber.number).join(', '),vehicleBrand:p.fitments[0]?.vehicleVariant.vehicleModel.brand.name,vehicleModel:p.fitments[0]?.vehicleVariant.vehicleModel.name,vehicleYear:p.fitments[0]?`${p.fitments[0].vehicleVariant.yearFrom}–${p.fitments[0].vehicleVariant.yearTo??'nay'}`:'',vehicleCode:p.fitments[0]?.vehicleVariant.modelCode??''}}/><p className="mt-4 text-sm leading-6 text-zinc-400">{t.confirmFit}</p></div></div>
 <div className="mt-12 grid gap-8 md:grid-cols-2"><section className="rounded-2xl border border-zinc-800 p-6"><h2 className="text-xl font-black">{t.fitments}</h2>{p.fitments.length?<ul className="mt-4 space-y-3 text-zinc-400">{p.fitments.map(({id,vehicleVariant:v})=><li key={id}>{v.vehicleModel.brand.name} {v.vehicleModel.name} {v.modelCode} · {v.yearFrom}–{v.yearTo??t.present}</li>)}</ul>:<p className="mt-4 text-zinc-400">{t.noFitments}</p>}</section><section className="rounded-2xl border border-zinc-800 p-6"><h2 className="text-xl font-black">{t.oeNumbers}</h2><p className="mt-4 break-words text-zinc-400">{p.oeNumbers.map(o=>o.oeNumber.number).join(' · ')||'—'}</p>{specs.length>0&&<><h2 className="mt-8 text-xl font-black">{t.specs}</h2><dl className="mt-4 space-y-3">{specs.map(([k,v])=><div key={k} className="flex justify-between gap-5 text-sm"><dt className="text-zinc-400">{k}</dt><dd>{v}</dd></div>)}</dl></>}</section></div></main>;
}
