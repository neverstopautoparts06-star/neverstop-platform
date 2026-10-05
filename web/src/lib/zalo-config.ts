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

export const whatsappChannel={phone:process.env.NEXT_PUBLIC_WHATSAPP_PHONE||'84396730160',get url(){const fallback=`https://wa.me/${this.phone.replace(/\D/g,'')}`;try{const u=new URL(process.env.NEXT_PUBLIC_WHATSAPP_URL||fallback);if(u.protocol==='https:'&&u.hostname==='wa.me')return u.href;}catch{}return fallback;}};
export const contactCopy={
 zh:{business:'越南商家',owner:'越南个人车主',overseas:'海外客户 · 工厂直连',choose:'请选择客户类型',hint:'请选择适合您的联系渠道',contact:'联系销售',inquire:'询价 / 咨询',retry:'无法打开 Zalo？点击重试',qr:'使用 Zalo 或手机相机扫码联系',copied:'产品信息已复制，请粘贴到 Zalo。'},
 en:{business:'Vietnam businesses',owner:'Vietnam car owners',overseas:'Overseas Customers · Direct Factory Contact',choose:'Choose your customer type',hint:'Choose the right contact channel for you.',contact:'Contact sales',inquire:'Ask about this product',retry:'Cannot open Zalo? Try again',qr:'Scan with Zalo or your phone camera',copied:'Product details copied. Please paste them into Zalo.'},
 vi:{business:'Đối tác tại Việt Nam',owner:'Chủ xe tại Việt Nam',overseas:'Khách hàng quốc tế · Liên hệ nhà máy',choose:'Bạn là khách hàng nào?',hint:'Vui lòng chọn kênh tư vấn phù hợp.',contact:'Liên hệ tư vấn',inquire:'Hỏi giá / Tư vấn',retry:'Không mở được Zalo? Thử lại',qr:'Quét mã bằng Zalo hoặc camera điện thoại',copied:'Thông tin sản phẩm đã được sao chép. Vui lòng dán vào Zalo.'}
} as const;
export function overseasInquiry(c:ProductContext,url:string){return `Hello NEVERSTOP,\nI would like to enquire about:\nProduct: ${c.productName||''}\nVehicle: ${[c.vehicleBrand,c.vehicleModel].filter(Boolean).join(' ')}\nYear: ${c.vehicleYear||''}\nVehicle code: ${c.vehicleCode||''}\nNEVERSTOP Part Number: ${c.partNumber||''}\nOE Number: ${c.oeNumber||''}\nQuantity: ${c.quantity||''}\nProduct link: ${c.url?new URL(c.url,url).href:url}`;}
