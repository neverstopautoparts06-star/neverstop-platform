import {ZaloChatButton} from './zalo-contact';
import Link from 'next/link';
import { dictionary, localized, type Locale } from '@/lib/i18n';
import type { CatalogProduct } from '@/lib/catalog-types';
export default function ProductCard({product,locale}:{product:CatalogProduct;locale:Locale}) {
  const t=dictionary(locale);
  return <article className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-black p-6 text-white">
    <p className="break-all text-sm font-bold text-orange-500">{product.partNumber}</p><h3 className="mt-3 text-xl font-black"><Link href={`/${locale}/products/${encodeURIComponent(product.slug)}`} className="hover:text-orange-400">{localized(product,locale)}</Link></h3>
    <p className="mt-3 text-sm text-zinc-400">{product.axle ? t[product.axle] : ''}{product.side ? ' · '+t[product.side] : ''}</p>
    {product.fitments.map((fitment,index)=><p key={index} className="mt-2 text-sm text-zinc-400">{fitment.replace(/–nay$/, '–'+t.present)}</p>)}
    <p className="mt-3 break-words text-sm text-zinc-400">OE: {product.oeNumbers.join(', ') || '—'}</p>
    <p className="mt-4 text-sm font-bold text-orange-500">{product.availableQuantity>0?t.inStock:t.outStock}</p>
    <div className="mt-auto flex flex-wrap gap-4 pt-6 text-sm font-bold"><Link href={`/${locale}/products/${encodeURIComponent(product.slug)}`} className="text-orange-500">{t.viewProduct} →</Link><ZaloChatButton context={{productName:localized(product,locale),partNumber:product.partNumber,oeNumber:product.oeNumbers.join(", "),vehicleModel:product.fitments.join("; "),url:`/${locale}/products/${product.slug}`}}/></div>
  </article>;
}
