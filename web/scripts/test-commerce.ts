import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {prisma} from '../src/lib/prisma';
const base=process.env.CATALOG_TEST_URL||'http://127.0.0.1:3006';
let cookie='';let count=0;
async function call(path:string,data?:unknown,expected=200,auth=true,headers:Record<string,string>={}){const r=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{Origin:base,'Content-Type':'application/json',...(auth&&cookie?{Cookie:cookie}:{}),...headers},...(data===undefined?{}:{body:JSON.stringify(data)})});const result=await r.json();assert.equal(r.status,expected,`${path}: ${JSON.stringify(result)}`);count++;return {r,result};}
async function main(){
 await call('/api/admin/quotes',undefined,401,false);
 const login=await call('/api/admin/session',{password:process.env.ADMIN_PASSWORD});cookie=login.r.headers.get('set-cookie')!.split(';')[0];
 const catalog=(await call('/api/products?q=Vios',undefined)).result;assert.ok(catalog.data.length>=2);assert.ok((await call('/api/products?q=2025-D641-302F')).result.data.length);assert.ok((await call('/api/vehicles')).result);
 const products=catalog.data.slice(0,2);const initialStock=await prisma.inventoryBalance.findMany({orderBy:{id:'asc'}});
 const input={customerType:'B2B',customerName:'TEST · Garage Demo',phone:'0398588703',vehicleBrand:'Toyota',vehicleModel:'Vios',vehicleYear:'2015',vehicleCode:'NCP150',shippingFee:100000,discount:50000,validUntil:new Date(Date.now()+48*3600000).toISOString(),warrantyTermsSnapshot:'TEST WARRANTY A — Điều kiện mẫu để kiểm thử; không phải chính sách bán hàng chính thức.',internalNote:'PRIVATE-NEVER-PUBLIC-SECRET',codEligible:true,onlinePaymentEnabled:true,items:products.map((p:{id:string},i:number)=>({productId:p.id,quantity:i+1,unitPrice:1000000+i*200000})),totalAmount:1};
 const create=async(overrides:Record<string,unknown>={})=>(await call('/api/admin/quotes',{...input,...overrides})).result;
 const send=async(q:{id:string})=>call('/api/admin/quotes/'+q.id,{action:'send'});
 const accept=async(q:{publicToken:string})=>call(`/api/quotes/${q.publicToken}/accept`,{consent:true});
 const q=await create();assert.equal(Number(q.totalAmount),3450000);assert.ok(q.publicToken.length>=40);assert.equal(await prisma.order.count({where:{quoteId:q.id}}),0);
 assert.equal((await fetch(base+'/q/'+q.publicToken)).status,404);await send(q);
 const publicHtml=await (await fetch(base+'/q/'+q.publicToken)).text();assert.ok(!publicHtml.includes(input.internalNote));assert.ok(publicHtml.includes('TEST WARRANTY A'));
 await call(`/api/quotes/${q.publicToken}/accept`,{consent:false},400);await accept(q);assert.equal(await prisma.order.count({where:{quoteId:q.id}}),0);
 await call('/api/payments/create',{token:q.publicToken},403,true,{Origin:'https://wrong.example'});
 const payment=(await call('/api/payments/create',{token:q.publicToken})).result;assert.equal((await call('/api/payments/create',{token:q.publicToken})).result.paymentToken,payment.paymentToken);
 const p=await prisma.payment.findUniqueOrThrow({where:{quoteId:q.id}});const event={providerPaymentId:p.providerPaymentId,status:'PAID',amount:3450000};
 await call('/api/payments/webhook',event,401,false,{'x-payment-signature':'bad'});
 const signature=(v:unknown)=>createHmac('sha256',process.env.PAYMENT_WEBHOOK_SECRET!).update(JSON.stringify(v)).digest('hex');
 await call('/api/payments/webhook',{...event,amount:1},409,false,{'x-payment-signature':signature({...event,amount:1})});
 const results=await Promise.all([1,2,3].map(()=>call('/api/payments/webhook',event,200,false,{'x-payment-signature':signature(event)})));assert.equal(new Set(results.map(v=>v.result.orderToken)).size,1);assert.equal(await prisma.order.count({where:{quoteId:q.id}}),1);
 const paid=await prisma.quote.findUniqueOrThrow({where:{id:q.id},include:{payment:true,order:{include:{items:true,inventoryTask:true}}}});assert.equal(paid.status,'PAID');assert.ok(paid.payment?.paidAt);assert.equal(paid.order?.warrantyTermsSnapshot,input.warrantyTermsSnapshot);assert.equal(paid.order?.items.length,2);assert.equal(paid.order?.inventoryTask?.status,'PENDING_REVIEW');
 await call('/api/payments/create',{token:q.publicToken},409);await call(`/api/quotes/${q.publicToken}/cod`,{name:'Test',phone:'0396730160',city:'Ha Noi',address:'183 Lac Nghiep'},409);
 const revision=(await call('/api/admin/quotes/'+q.id,{action:'revise',quote:{...input,warrantyTermsSnapshot:'TEST WARRANTY B'}})).result;assert.equal(revision.revisionOfId,q.id);assert.equal((await prisma.quote.findUniqueOrThrow({where:{id:q.id}})).warrantyTermsSnapshot,input.warrantyTermsSnapshot);
 const cod=await create({customerType:'B2C',customerName:'TEST · Chủ xe Demo'});await send(cod);await accept(cod);await call('/api/payments/create',{token:cod.publicToken});
 const shipping={name:'TEST Chủ xe',phone:'0396730160',city:'Hà Nội',address:'TEST 183 Lạc Nghiệp',note:'Synthetic test only'};
 const orders=await Promise.all([1,2].map(()=>call(`/api/quotes/${cod.publicToken}/cod`,shipping)));assert.equal(orders[0].result.orderToken,orders[1].result.orderToken);assert.equal(await prisma.order.count({where:{quoteId:cod.id}}),1);assert.equal((await prisma.quote.findUniqueOrThrow({where:{id:cod.id}})).status,'COD_CONFIRMED');
 const disabled=await create({codEligible:false});await send(disabled);await accept(disabled);await call(`/api/quotes/${disabled.publicToken}/cod`,shipping,409);
 const expired=await create();await send(expired);await accept(expired);const expPayment=(await call('/api/payments/create',{token:expired.publicToken})).result;await prisma.quote.update({where:{id:expired.id},data:{validUntil:new Date(Date.now()-1000)}});await call('/api/payments/create',{token:expired.publicToken},410);await call(`/api/payments/${expPayment.paymentToken}/simulate`,{},410);await call(`/api/quotes/${expired.publicToken}/cod`,shipping,410);
 const cancelled=await create();await send(cancelled);await accept(cancelled);const cp=(await call('/api/payments/create',{token:cancelled.publicToken})).result;await call('/api/admin/quotes/'+cancelled.id,{action:'cancel'});await call(`/api/payments/${cp.paymentToken}/simulate`,{},410);
 const simulate=await create({customerName:'TEST · QR Demo'});await send(simulate);await accept(simulate);const sp=(await call('/api/payments/create',{token:simulate.publicToken})).result;const simOrder=(await call(`/api/payments/${sp.paymentToken}/simulate`,{})).result;await call(`/api/payments/${sp.paymentToken}/simulate`,{});
 assert.equal(await prisma.order.count({where:{quoteId:simulate.id}}),1);
 assert.deepEqual(await prisma.inventoryBalance.findMany({orderBy:{id:'asc'}}),initialStock);
 for(const path of ['/zh','/vi','/en','/admin/quotes','/admin/quotes/'+q.id,'/q/'+q.publicToken,'/order/'+orders[0].result.orderToken,'/order/'+simOrder.orderToken,'/payment/'+sp.paymentToken]){const r=await fetch(base+path,{headers:{Cookie:cookie}});assert.equal(r.status,200,path);const html=await r.text();assert.ok(!html.includes('Application error'));}
 for(const type of ['B2B','B2C']){const r=await fetch(base+'/api/zalo/qr/'+type);assert.equal(r.status,200);assert.ok((await r.text()).includes('<svg'));}
 const filter=(await call('/api/admin/quotes?customerType=B2C&status=COD_CONFIRMED')).result;assert.ok(filter.some((v:{id:string})=>v.id===cod.id));assert.ok(filter.every((v:{customerType:string;status:string})=>v.customerType==='B2C'&&v.status==='COD_CONFIRMED'));
 const demo=await create({customerType:'B2C',customerName:'DEMO · Chủ xe',internalNote:'Local demo only'});await send(demo);
 writeFileSync('docs/local-demo.json',JSON.stringify({quote:'/q/'+demo.publicToken,admin:'/admin/quotes/'+demo.id,paidOrder:'/order/'+simOrder.orderToken,codOrder:'/order/'+orders[0].result.orderToken,payment:'/payment/'+sp.paymentToken},null,2));
 console.log(`PASS: ${count} HTTP checks; server totals, authorization, CSRF, quote acceptance, signed/idempotent webhooks, COD concurrency, immutable revisions, snapshots, expiry/cancellation, stock preservation, catalog, pages and QR endpoints.`);
}
main().catch(e=>{console.error(e instanceof Error?e.message:'Commerce test failed');process.exitCode=1;}).finally(()=>prisma.$disconnect());
