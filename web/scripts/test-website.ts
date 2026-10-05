import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../src/lib/prisma';
import { dictionary,locales } from '../src/lib/i18n';
const base=process.env.CATALOG_TEST_URL??'http://localhost:3000';
const requestId=randomUUID(),reference='INQ-'+requestId.toUpperCase();
async function post(body:unknown,origin=base){return fetch(base+'/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'X-Forwarded-For':'website-test-'+requestId},body:JSON.stringify(body)});}
async function run(){try{
 const list=await (await fetch(base+'/api/products?q=2025-D641-302F')).json();const product=list.data[0];assert.ok(product.slug&&product.nameZh&&product.nameEn);
 for(const locale of locales){
  const t=dictionary(locale);
  for(const [path,expected] of [['',t.hero],['/products',t.productHeading],['/contact',t.contactTitle],['/privacy',t.privacy],['/products/'+product.slug,locale==='en'?product.nameEn:locale==='zh'?product.nameZh:product.nameVi]]){
   const response=await fetch(base+'/'+locale+path);assert.equal(response.status,200,path);const html=await response.text();assert.ok(html.includes(expected),locale+path);assert.ok(html.includes('lang="'+(locale==='zh'?'zh-CN':locale)+'"'));assert.ok(!html.includes('Create Next App'));
  }
 }
 assert.equal((await fetch(base+'/en/products/no-such-product')).status,404);
 assert.equal((await fetch(base+'/fr')).status,404);
 const front=await(await fetch(base+'/api/products?axle=FRONT')).json();assert.ok(front.data.length);assert.ok(front.data.every((p:{axle:string})=>p.axle==='FRONT'));
 assert.equal((await fetch(base+'/api/products?axle=INVALID')).status,400);
 const body={requestId,name:'NEVERSTOP automated test',phone:'0000000000',vehicle:'Test vehicle',message:'Synthetic integration test; no customer request.',quantity:2,consent:true,website:'',productId:product.id};
 assert.equal((await post(body,'https://untrusted.example')).status,403);
 assert.equal((await post({...body,consent:false})).status,400);
 assert.equal((await post({...body,phone:'bad'})).status,400);
 assert.equal((await post({...body,quantity:-1})).status,400);
 assert.equal((await post({...body,productId:'does-not-exist'})).status,409);
 assert.equal((await post({...body,message:'x'.repeat(14000)})).status,400);
 const first=await post(body);assert.equal(first.status,201);assert.equal((await first.json()).reference,reference);
 const repeated=await post(body);assert.equal(repeated.status,200);assert.equal((await repeated.json()).reference,reference);
 assert.equal(await prisma.inquiry.count({where:{inquiryNumber:reference}}),1);
 const saved=await prisma.inquiry.findUniqueOrThrow({where:{inquiryNumber:reference},include:{items:true}});assert.equal(saved.items[0].quantity,2);assert.equal(saved.items[0].productId,product.id);assert.equal(saved.status,'NEW');
 assert.equal((await fetch(base+'/api/inquiries')).status,405);
 console.log('PASS: VI/EN/中文 pages and HTML language, product details, 404s, position filters, quote validation, origin protection, persistence and idempotency');
}finally{await prisma.inquiry.deleteMany({where:{inquiryNumber:reference}});await prisma.$disconnect();}}
run().catch(error=>{console.error(error instanceof assert.AssertionError?error.message:'Website integration check failed');process.exitCode=1;});
