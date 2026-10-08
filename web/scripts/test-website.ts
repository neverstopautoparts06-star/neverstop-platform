import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../src/lib/prisma';
import { dictionary,locales,localized } from '../src/lib/i18n';
import {productCenterCopy,productCenterVehicles} from '../src/lib/product-center-copy';
import {homeReferenceCopy} from '../src/lib/home-reference-copy';
import {popularVehicles} from '../src/lib/popular-vehicles';
const base=process.env.CATALOG_TEST_URL??'http://localhost:3000';
const requestId=randomUUID(),reference='INQ-'+requestId.toUpperCase();
async function post(body:unknown,origin=base){return fetch(base+'/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'X-Forwarded-For':'website-test-'+requestId},body:JSON.stringify(body)});}
async function run(){try{
 const list=await (await fetch(base+'/api/products?q=2025-D641-302F')).json();const product=list.data[0];assert.ok(product.slug&&product.nameZh&&product.nameEn);
 for(const locale of locales){
  const t=dictionary(locale);
  for(const [path,expected] of [['',homeReferenceCopy(locale).line1],['/products',productCenterCopy(locale).title],['/contact',t.contactTitle],['/privacy',t.privacy],['/products/'+product.slug,localized(product,locale)]]){
   const response=await fetch(base+'/'+locale+path);assert.equal(response.status,200,path);const html=await response.text();assert.ok(html.replaceAll('&amp;','&').includes(expected),locale+path);assert.ok(html.includes('lang="'+(locale==='zh'?'zh-CN':locale)+'"'));assert.ok(!html.includes('Create Next App'));
   if(path==='/products'){
    assert.ok(html.includes('site-header--product-center'));assert.ok(html.includes('class="product-center"'));
    assert.equal((html.match(/data-coming-soon="true"/g)||[]).length,5);
    assert.equal((html.match(/class="catalog-vehicle-card"/g)||[]).length,6);
    assert.equal((html.match(/<select id="catalog-/g)||[]).length,3);
    for(const vehicle of productCenterVehicles)assert.ok(html.includes(`vehicle-${vehicle.image}.webp`));
    for(const mode of ['vehicle','oem','part'])assert.ok(html.includes(`id="catalog-tab-${mode}"`));
   }else assert.ok(!html.includes('site-header--product-center'),'The product center header must be limited to its route.');
   if(path===''){
    assert.ok(html.includes('class="factory-home home-reference"'));
    assert.ok(html.includes('site-header--home-reference'));
    assert.equal((html.match(/class="home-ref-model-card"/g)||[]).length,20);
    for(const vehicle of popularVehicles)assert.ok(html.includes(vehicle.vehicleName));
    assert.equal(new Set(popularVehicles.map(v=>v.vehicleName)).size,20);
    assert.ok(html.includes('aria-label="1–10 / 20"'));assert.ok(html.includes('aria-label="11–20 / 20"'));
    assert.equal((html.match(/data-coming-soon="true"/g)||[]).length,5);
    assert.equal((html.match(/<select id="home-/g)||[]).length,3);
    for(const channel of ['ZALO','WHATSAPP','EMAIL'])assert.ok(html.includes(`data-contact-intake="${channel}"`));
    assert.ok(html.includes('id="social"'));assert.ok(html.includes('id="oem-search"'));
    assert.ok(html.includes('class="language-flag"'));
   }
  }
 }
 const oldHomeQuery=await fetch(`${base}/zh?q=${encodeURIComponent(product.partNumber)}&search=1`);assert.equal(oldHomeQuery.status,200);assert.ok(new URL(oldHomeQuery.url).pathname==='/zh/products');
 for(const mode of ['oem','part']){
  const searched=await fetch(`${base}/zh/products?q=${encodeURIComponent(product.partNumber)}&search=1&mode=${mode}`);assert.equal(searched.status,200);const html=await searched.text();
  assert.ok(html.includes('id="catalog-code"'));assert.ok(html.includes(`value="${product.partNumber}"`));assert.ok(html.includes('id="catalog-results"'));
  assert.ok(html.includes(`id="catalog-tab-${mode}" role="tab" aria-selected="true"`));
 }
 for(const asset of ['hero','shock-range','wordmark','category-shocks','category-suspension','category-steering','category-brakes','category-rubber','category-other','icon-diamond','icon-gear','icon-truck','icon-search','vehicle-vios','vehicle-xpander','vehicle-ranger','vehicle-fortuner','vehicle-innova','vehicle-i10']){
  const response=await fetch(`${base}/images/product-center/${asset}.webp`);assert.equal(response.status,200);assert.ok(response.headers.get('content-type')?.includes('image/webp'));
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
