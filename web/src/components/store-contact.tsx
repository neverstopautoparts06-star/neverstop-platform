import type {Locale} from '@/lib/i18n';
import {contentLocale} from '@/lib/i18n';
import {homeCopy} from '@/lib/home-copy';
import ZaloContact from './zalo-contact';
import BrandIcon from './brand-icon';
import './store-contact.css';
const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('183 Lạc Nghiệp, Bạch Mai, Hà Nội, Vietnam');
export default function StoreContact({locale}:{locale:Locale}){
 const c=homeCopy[contentLocale(locale)];
 // Set only when the real, unaltered Hanoi storefront photo is supplied.
 const storefront=process.env.NEXT_PUBLIC_HANOI_STOREFRONT_IMAGE;
 const pending=locale==='zh'?'河内门店门头实拍 · 待补充':locale==='vi'?'Ảnh mặt tiền cửa hàng Hà Nội · Đang cập nhật':'Hanoi storefront photograph · Coming soon';
 return <section id="contact" className="home-section visit-section store-contact"><div className="store-top"><div className="store-welcome"><p className="eyebrow">HÀ NỘI / VIETNAM</p><h2>{c.contactTitle}</h2><p>{c.contactBody}</p></div><div className="storefront-photo">{storefront?<img src={storefront} alt="NEVERSTOP Factory-direct · Hà Nội" width="640" height="360"/>:<div className="storefront-placeholder" role="img" aria-label={pending}><span aria-hidden="true">▧</span><p>{pending}</p></div>}</div><div className="store-address"><h3>NEVERSTOP<span>FACTORY-DIRECT</span></h3><address>Số 183 Lạc Nghiệp,<br/>Bạch Mai, Hà Nội, Việt Nam</address><a className="button dark" href={maps} target="_blank" rel="noopener noreferrer" aria-label={`${c.directions} · Google Maps`}><BrandIcon name="Google Maps" size={24}/>{c.directions} / Google Maps →</a></div></div><ZaloContact locale={locale} store/></section>;
}
