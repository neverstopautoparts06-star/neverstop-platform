import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getOrder} from '@/lib/commerce/service';
import {CommerceError} from '@/lib/commerce/validation';
import {ZaloChatButton} from '@/components/zalo-contact';
import '../../commerce.css';
export const dynamic='force-dynamic';
export const metadata={title:'NEVERSTOP · Đơn hàng',robots:{index:false,follow:false},referrer:'no-referrer' as const};
async function load(token:string){try{return await getOrder(token);}catch(e){if(e instanceof CommerceError&&e.status===404)notFound();throw e;}}
export default async function Page({params}:{params:Promise<{token:string}>}){const o=await load((await params).token);const cod=o.paymentMethod==='COD';return <main className="commerce"><header><Link href="/vi">NEVERSTOP FACTORY STORE</Link></header>{!cod&&<div className="test">TEST MODE · Thanh toán mô phỏng. Không có tiền thật được nhận.</div>}<h1>{cod?'ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN':'THANH TOÁN THÀNH CÔNG · TEST'}</h1><p>{cod?'NEVERSTOP sẽ xử lý đơn hàng của anh/chị.':'Đã ghi nhận thanh toán thử nghiệm.'}</p><section className="panel"><h2>{o.orderNumber}</h2><p>Phương thức: {cod?'COD':'QR TEST'}</p><p className="total">{Number(o.totalAmount).toLocaleString('vi-VN')}₫</p><p>{o.customerName} · {o.phone}</p><p>{o.city} · {o.shippingAddress}</p>{o.items.map((i,j)=><div key={j} className="item"><h3>{i.productName}</h3><p>{i.partNumber} · OE {i.oeNumber}</p><p>{i.vehicleInfo}</p><p>{i.quantity} × {Number(i.unitPrice).toLocaleString('vi-VN')}₫</p></div>)}<h2>CHÍNH SÁCH BẢO HÀNH</h2><div className="warranty">{o.warrantyTermsSnapshot}</div></section><ZaloChatButton customerType={o.customerType||undefined} label="Liên hệ lại qua Zalo"/></main>;}
