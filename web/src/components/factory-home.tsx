import type {Locale} from '@/lib/i18n';
import HomeReference from './home-reference';
import SocialStrip from './social-strip';

export default function FactoryHome({locale}:{locale:Locale}){
 return <HomeReference locale={locale} localPreview={process.env.LOCAL_CATALOG_PREVIEW==='1'} storefront={process.env.NEXT_PUBLIC_HANOI_STOREFRONT_IMAGE} hours={process.env.NEXT_PUBLIC_HANOI_OPENING_HOURS} social={<SocialStrip locale={locale}/>}/>;
}
