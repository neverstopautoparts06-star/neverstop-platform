import {randomBytes} from 'node:crypto';
import {prisma} from '@/lib/prisma';
import {Prisma} from '@/generated/prisma/client';
import {quoteInput,shippingInput,totals,CommerceError} from './validation';
import {paymentProvider} from './provider';
type Tx=Prisma.TransactionClient;
const include={items:true,payment:true,order:{select:{id:true,publicToken:true,orderNumber:true}}} as const;
type Q=Prisma.QuoteGetPayload<{include:typeof include}>;
const token=()=>randomBytes(32).toString('base64url');
const number=(prefix:string)=>`${prefix}-${new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replaceAll('-','')}-${randomBytes(5).toString('hex').toUpperCase()}`;
function active(q:Q){if(q.status==='CANCELLED'||q.status==='EXPIRED'||q.validUntil.getTime()<=Date.now())throw new CommerceError(410,'Báo giá đã hết hạn hoặc đã hủy. Vui lòng liên hệ NEVERSTOP.');}
async function locked<T>(publicToken:string,fn:(tx:Tx,q:Q)=>Promise<T>){
 return prisma.$transaction(async tx=>{
  const rows=await tx.$queryRaw<{id:string}[]>`SELECT id FROM "Quote" WHERE "publicToken"=${publicToken} FOR UPDATE`;
  if(!rows.length)throw new CommerceError(404,'Không tìm thấy báo giá.');
  const q=await tx.quote.findUniqueOrThrow({where:{id:rows[0].id},include});return fn(tx,q);
 },{maxWait:15000,timeout:20000});
}
export async function createQuote(input:unknown,revisionOfId?:string){const v=quoteInput.parse(input);
 if(new Date(v.validUntil).getTime()<=Date.now()||new Date(v.validUntil).getTime()>Date.now()+90*86400000)throw new CommerceError(400,'Thời hạn phải trong 90 ngày tới.');
 const products=await prisma.product.findMany({where:{id:{in:v.items.map(i=>i.productId)},status:'ACTIVE'},include:{oeNumbers:{include:{oeNumber:true}}}});
 const items=v.items.map(i=>{const p=products.find(p=>p.id===i.productId);if(!p)throw new CommerceError(400,'Sản phẩm không còn khả dụng.');return {...i,partNumber:p.partNumber,productName:p.nameVi,oeNumber:p.oeNumbers.map(o=>o.oeNumber.number).join(', '),vehicleInfo:[v.vehicleBrand,v.vehicleModel,v.vehicleYear,v.vehicleCode].filter(Boolean).join(' · '),axle:p.axle,side:p.side,lineTotal:i.quantity*i.unitPrice};});
 const calculated=totals(items,v.shippingFee,v.discount);const {items:_,...fields}=v;void _;
 return prisma.quote.create({data:{...fields,validUntil:new Date(v.validUntil),...calculated,quoteNumber:number('NSQ'),publicToken:token(),revisionOfId,items:{create:items}},include});
}
export async function editDraft(id:string,input:unknown){const old=await prisma.quote.findUnique({where:{id}});if(!old)throw new CommerceError(404,'Không tìm thấy báo giá.');
 // Build a revision instead of mutating commercial terms. This also avoids
 // lost-update races and preserves all previous versions for audit.
 return createQuote(input,id);
}
export async function adminAction(id:string,action:string){const q=await prisma.quote.findUnique({where:{id}});if(!q)throw new CommerceError(404,'Không tìm thấy báo giá.');
 return locked(q.publicToken,async(tx,current)=>{if(action==='send'){active(current);if(current.status!=='DRAFT')throw new CommerceError(409,'Chỉ gửi bản nháp.');return tx.quote.update({where:{id},data:{status:'SENT'}});}
 if(action==='cancel'){if(current.order||['PAID','COD_CONFIRMED'].includes(current.status))throw new CommerceError(409,'Đơn hàng đã được xác nhận.');if(current.payment)await tx.payment.update({where:{id:current.payment.id},data:{status:'CANCELLED'}});return tx.quote.update({where:{id},data:{status:'CANCELLED'}});}
 throw new CommerceError(400,'Thao tác không hợp lệ.');});}
export async function expireQuotes(){await prisma.quote.updateMany({where:{validUntil:{lte:new Date()},status:{in:['DRAFT','SENT','ACCEPTED','PAYMENT_PENDING']}},data:{status:'EXPIRED'}});}
export async function getPublicQuote(publicToken:string){await expireQuotes();const q=await prisma.quote.findUnique({where:{publicToken},include});if(!q||q.status==='DRAFT')throw new CommerceError(404,'Không tìm thấy báo giá.');
 // Explicit allowlist: internal notes and database IDs never enter public DTOs.
 return {quoteNumber:q.quoteNumber,customerType:q.customerType,customerName:q.customerName,phone:q.phone,city:q.city,address:q.address,vehicleBrand:q.vehicleBrand,vehicleModel:q.vehicleModel,vehicleYear:q.vehicleYear,vehicleCode:q.vehicleCode,status:q.status,validUntil:q.validUntil.toISOString(),acceptedAt:q.acceptedAt?.toISOString(),warrantyTermsSnapshot:q.warrantyTermsSnapshot,customerNote:q.customerNote,codEligible:q.codEligible,onlinePaymentEnabled:q.onlinePaymentEnabled,subtotal:Number(q.subtotal),shippingFee:Number(q.shippingFee),discount:Number(q.discount),totalAmount:Number(q.totalAmount),items:q.items.map(i=>({partNumber:i.partNumber,productName:i.productName,oeNumber:i.oeNumber,vehicleInfo:i.vehicleInfo,axle:i.axle,side:i.side,quantity:i.quantity,unitPrice:Number(i.unitPrice),lineTotal:Number(i.lineTotal)})),isMockPayment:q.payment?.provider==='MOCK',paymentToken:q.payment?.publicToken,orderToken:q.order?.publicToken,orderNumber:q.order?.orderNumber};}
export async function acceptQuote(publicToken:string,consent:unknown){if(consent!==true)throw new CommerceError(400,'Vui lòng đồng ý báo giá và chính sách bảo hành.');return locked(publicToken,async(tx,q)=>{active(q);if(q.acceptedAt)return {accepted:true};if(q.status!=='SENT')throw new CommerceError(409,'Báo giá chưa sẵn sàng.');await tx.quote.update({where:{id:q.id},data:{status:'ACCEPTED',acceptedAt:new Date()}});return {accepted:true};});}
export async function createPayment(publicToken:string){return locked(publicToken,async(tx,q)=>{active(q);if(!q.acceptedAt||!['ACCEPTED','PAYMENT_PENDING'].includes(q.status)||q.order)throw new CommerceError(409,'Báo giá không thể thanh toán.');if(!q.onlinePaymentEnabled)throw new CommerceError(403,'Thanh toán trực tuyến không khả dụng.');if(q.payment?.status==='PENDING')return {paymentToken:q.payment.publicToken};if(q.payment)throw new CommerceError(409,'Vui lòng tạo báo giá mới.');const provider=paymentProvider();const intent=await provider.create(Number(q.totalAmount));const p=await tx.payment.create({data:{quoteId:q.id,publicToken:token(),provider:provider.name,providerPaymentId:intent.providerPaymentId,method:'MOCK_QR',amount:q.totalAmount}});await tx.quote.update({where:{id:q.id},data:{status:'PAYMENT_PENDING'}});return {paymentToken:p.publicToken};});}
async function orderFrom(tx:Tx,q:Q,method:'COD'|'MOCK_QR',shipping?:ReturnType<typeof shippingInput.parse>){
 const existing=await tx.order.findUnique({where:{quoteId:q.id}});if(existing)return existing;
 return tx.order.create({data:{quoteId:q.id,orderNumber:number('NS'),publicToken:token(),customerType:q.customerType,customerName:shipping?.name??q.customerName,phone:shipping?.phone??q.phone,zalo:q.zalo,city:shipping?.city??q.city,shippingAddress:shipping?.address??q.address,vehicleInfo:[q.vehicleBrand,q.vehicleModel,q.vehicleYear,q.vehicleCode].filter(Boolean).join(' · '),customerNote:shipping?.note??q.customerNote,warrantyTermsSnapshot:q.warrantyTermsSnapshot,subtotal:q.subtotal,shippingFee:q.shippingFee,discount:q.discount,totalAmount:q.totalAmount,status:'CONFIRMED',paymentMethod:method,paymentStatus:method==='COD'?'PENDING':'PAID',items:{create:q.items.map(i=>({productId:i.productId,partNumber:i.partNumber,productName:i.productName,oeNumber:i.oeNumber,vehicleInfo:i.vehicleInfo,axle:i.axle,side:i.side,quantity:i.quantity,unitPrice:i.unitPrice,lineTotal:i.lineTotal}))},inventoryTask:{create:{}}}});
}
export async function confirmCod(publicToken:string,input:unknown){const shipping=shippingInput.parse(input);return locked(publicToken,async(tx,q)=>{
 if(q.status==='COD_CONFIRMED'&&q.order)return {orderToken:q.order.publicToken};active(q);
 if(!q.codEligible||!q.acceptedAt||!['ACCEPTED','PAYMENT_PENDING'].includes(q.status)||q.order)throw new CommerceError(409,'COD không khả dụng cho báo giá này.');
 const order=await orderFrom(tx,q,'COD',shipping);if(q.payment)await tx.payment.update({where:{id:q.payment.id},data:{orderId:order.id,method:'COD',provider:'COD',providerPaymentId:null,status:'PENDING'}});else await tx.payment.create({data:{quoteId:q.id,orderId:order.id,publicToken:token(),provider:'COD',amount:q.totalAmount,method:'COD'}});
 await tx.quote.update({where:{id:q.id},data:{status:'COD_CONFIRMED'}});return {orderToken:order.publicToken};});}
export async function settlePayment(providerPaymentId:string,amount:number){const p=await prisma.payment.findUnique({where:{providerPaymentId},include:{quote:true}});if(!p?.quote)throw new CommerceError(404,'Payment not found.');return locked(p.quote.publicToken,async(tx,q)=>{
 const current=await tx.payment.findUniqueOrThrow({where:{id:p.id}});if(current.providerPaymentId!==providerPaymentId||current.provider!=='MOCK'||current.method!=='MOCK_QR'||Number(current.amount)!==amount||Number(q.totalAmount)!==amount)throw new CommerceError(409,'Payment mismatch.');
 if(q.status==='PAID'&&q.order&&current.status==='PAID')return {orderToken:q.order.publicToken};active(q);
 if(q.status!=='PAYMENT_PENDING'||current.status!=='PENDING'||!q.acceptedAt||q.order)throw new CommerceError(409,'Payment state conflict.');
 const order=await orderFrom(tx,q,'MOCK_QR');await tx.payment.update({where:{id:p.id},data:{status:'PAID',paidAt:new Date(),confirmedAt:new Date(),orderId:order.id}});await tx.quote.update({where:{id:q.id},data:{status:'PAID'}});return {orderToken:order.publicToken};});}
export async function getPayment(publicToken:string){await expireQuotes();const p=await prisma.payment.findUnique({where:{publicToken},include:{quote:true,order:{select:{publicToken:true}}}});if(!p?.quote)throw new CommerceError(404,'Không tìm thấy thanh toán.');return {paymentToken:publicToken,quoteToken:p.quote.publicToken,quoteNumber:p.quote.quoteNumber,customerType:p.quote.customerType,amount:Number(p.amount),status:p.status,quoteStatus:p.quote.status,orderToken:p.order?.publicToken,provider:p.provider};}
export async function getOrder(publicToken:string){const o=await prisma.order.findUnique({where:{publicToken},select:{orderNumber:true,customerName:true,phone:true,city:true,shippingAddress:true,customerType:true,vehicleInfo:true,paymentMethod:true,paymentStatus:true,totalAmount:true,warrantyTermsSnapshot:true,customerNote:true,items:{select:{productName:true,partNumber:true,oeNumber:true,quantity:true,unitPrice:true,lineTotal:true,vehicleInfo:true,axle:true,side:true}}}});if(!o)throw new CommerceError(404,'Không tìm thấy đơn hàng.');return o;}
