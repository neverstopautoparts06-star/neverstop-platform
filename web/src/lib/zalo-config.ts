export type CustomerType='B2B'|'B2C';
function zaloUrl(value:string|undefined,phone:string){try{const u=new URL(value||`https://zalo.me/${phone}`);if(u.protocol==='https:'&&u.hostname==='zalo.me')return u.href;}catch{}return `https://zalo.me/${phone}`;}
const b2bPhone=process.env.NEXT_PUBLIC_ZALO_B2B_PHONE||'0398588703';
const b2cPhone=process.env.NEXT_PUBLIC_ZALO_B2C_PHONE||'0396730160';
export const zaloChannels={
 B2B:{phone:b2bPhone,url:zaloUrl(process.env.NEXT_PUBLIC_ZALO_B2B_URL,b2bPhone),qr:process.env.NEXT_PUBLIC_ZALO_B2B_QR_IMAGE||'/api/zalo/qr/B2B',title:'Gara / Cửa hàng / Đại lý',description:'Dành cho gara, cửa hàng phụ tùng, đại lý và khách hàng mua số lượng.',button:'Liên hệ Zalo doanh nghiệp'},
 B2C:{phone:b2cPhone,url:zaloUrl(process.env.NEXT_PUBLIC_ZALO_B2C_URL,b2cPhone),qr:process.env.NEXT_PUBLIC_ZALO_B2C_QR_IMAGE||'/api/zalo/qr/B2C',title:'Chủ xe / Khách hàng cá nhân',description:'Dành cho khách hàng cá nhân cần tư vấn giảm xóc cho xe của mình.',button:'Liên hệ Zalo chủ xe'}
} as const;
export type ProductContext={vehicleBrand?:string;vehicleModel?:string;vehicleYear?:string;vehicleCode?:string;partNumber?:string;oeNumber?:string;productName?:string;quantity?:string;url?:string};
export function inquiryText(type:CustomerType,c:ProductContext,url:string){return `Xin chào NEVERSTOP,\n\n${type==='B2B'?'Công ty / Gara / Cửa hàng:\nNgười liên hệ:\nTôi muốn hỏi mua sản phẩm:':'Tôi muốn hỏi sản phẩm cho xe của mình:'}\n\nSản phẩm: ${c.productName||''}\nXe: ${[c.vehicleBrand,c.vehicleModel].filter(Boolean).join(' ')}\nNăm sản xuất: ${c.vehicleYear||''}\nMã xe: ${c.vehicleCode||''}\nMã NEVERSTOP: ${c.partNumber||''}\nMã OE: ${c.oeNumber||''}\nSố lượng${type==='B2B'?' cần mua':''}: ${c.quantity||''}\n\nLink sản phẩm: ${c.url?new URL(c.url,url).href:url}`;}
