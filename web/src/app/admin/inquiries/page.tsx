import Link from 'next/link';
import {guardAdmin} from '@/lib/commerce/admin';
import {prisma} from '@/lib/prisma';
import {decodeContactLead} from '@/lib/contact-leads';
import {customerKindLabel,salesCustomerType,customerKinds} from '@/lib/contact-intake';
import {whatsappNotificationConfig} from '@/lib/contact-notification';
import ContactLeadsRefresh from '@/components/contact-leads-refresh';

export default async function Page({searchParams}:{searchParams:Promise<{type?:string}>}){
 await guardAdmin();const params=await searchParams;
 const type=customerKinds.find(value=>value===params.type);
 const inquiries=await prisma.inquiry.findMany({where:{inquiryNumber:{startsWith:'CTC-'},...(type?{notes:{contains:`"customerKind":"${type}"`}}:{})},select:{id:true,inquiryNumber:true,notes:true,createdAt:true},orderBy:{createdAt:'desc'},take:100});
 return <><h1>客户咨询 / Yêu cầu tư vấn</h1><ContactLeadsRefresh/><p className="muted">客户类型已选择不代表消息已发送。已整理咨询也不代表客户已在 Zalo / WhatsApp / 邮件中发送。<br/>Lựa chọn / chuẩn bị nội dung không xác nhận khách đã gửi tin nhắn.</p>
  {!whatsappNotificationConfig()&&<p className="test">WhatsApp 自动通知尚未接入。线索正常保存；需要配置 Cloud API、接收号码和已审核模板。<br/>Chưa kết nối thông báo WhatsApp tự động.</p>}
  <form className="panel"><label>客户类型 / Nhóm khách hàng<select name="type" defaultValue={type||''}><option value="">全部 / Tất cả</option>{customerKinds.map(kind=><option key={kind} value={kind}>{customerKindLabel(kind,'zh')} / {customerKindLabel(kind,'vi')}</option>)}</select></label><button>筛选 / Lọc</button></form>
  {inquiries.map(inquiry=>{const lead=decodeContactLead(inquiry.notes);if(!lead)return null;return <article className="panel" key={inquiry.id}><h2>{customerKindLabel(lead.customerKind,'zh')} / {customerKindLabel(lead.customerKind,'vi')}</h2><p><bdi>{inquiry.inquiryNumber}</bdi> · {lead.channel} · {inquiry.createdAt.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</p><span className="status">{lead.stage==='SELECTED'?'已选择客户类型 / Đã chọn nhóm':'已整理咨询 / Đã chuẩn bị nội dung'}</span><div className="grid">{Object.entries({姓名:lead.details.name,电话:lead.details.phone,所在区域:lead.details.region,车型:lead.details.vehicle,年份:lead.details.year,所需产品:lead.details.product,数量:lead.details.quantity,产品编号:lead.context.partNumber,'OEM 参考号':lead.context.oeNumber,底盘代号:lead.context.vehicleCode,来源页面:lead.sourcePath}).filter(([,value])=>value).map(([label,value])=><div key={label}><small>{label}</small><p className="readonly">{value}</p></div>)}</div><p className="muted">WhatsApp 通知：{lead.notification.status==='API_ACCEPTED'?'API 已接受（未确认送达）':lead.notification.status==='FAILED'?'推送失败，线索已保存':'未配置'}</p><Link className="action" href={`/admin/quotes/new?customerType=${salesCustomerType(lead.customerKind)}&inquiry=${encodeURIComponent(inquiry.inquiryNumber)}`}>根据此咨询报价 / Tạo báo giá</Link></article>;})}
  {!inquiries.length&&<p>暂无咨询 / Chưa có yêu cầu tư vấn.</p>}
 </>;
}
