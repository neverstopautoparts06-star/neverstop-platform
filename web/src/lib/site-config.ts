import {zaloChannels} from './zalo-config';
// Public business contact details supplied by NEVERSTOP.
export const contacts = [
 {audience:{zh:'商家',en:'Businesses',vi:'Gara / Cửa hàng / Đại lý'},callEnabled:true,phone:zaloChannels.B2B.phone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3'),phoneHref:`tel:+84${zaloChannels.B2B.phone.replace(/^0/,'')}`,zaloHref:zaloChannels.B2B.url},
 {audience:{zh:'个人车主',en:'Car owners',vi:'Chủ xe'},callEnabled:false,phone:zaloChannels.B2C.phone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3'),phoneHref:`tel:+84${zaloChannels.B2C.phone.replace(/^0/,'')}`,zaloHref:zaloChannels.B2C.url}
];
export const address = 'Số 183 Lạc Nghiệp, Bạch Mai, HN, Viet Nam';
export function siteOrigin() {
  try { const url = new URL(process.env.SITE_URL ?? ''); return url.protocol === 'https:' ? url.origin : undefined; } catch { return undefined; }
}
