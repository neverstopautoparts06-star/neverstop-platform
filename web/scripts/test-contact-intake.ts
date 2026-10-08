import assert from 'node:assert/strict';
import {randomUUID,createHmac} from 'node:crypto';
import {locales} from '../src/lib/i18n';
import {contactIntakeCopy} from '../src/lib/contact-intake-copy';
import {contactMessage,contactDestination,customerKindLabel,customerKinds,salesCustomerType,publicSourcePath} from '../src/lib/contact-intake';
import {contactLeadSchema,contactReference,decodeContactLead,encodeContactLead,type ContactLeadInput} from '../src/lib/contact-leads';
import {notifyContactLead,whatsappNotificationConfig} from '../src/lib/contact-notification';
import {zaloChannels,whatsappChannel} from '../src/lib/zalo-config';
import {prisma} from '../src/lib/prisma';

const empty={region:'',vehicle:'',year:'',product:'',name:'',phone:'',quantity:''};
const base=process.env.CATALOG_TEST_URL||'http://127.0.0.1:3006';
const references:string[]=[];
function fixture(kind:'DEALER'|'GARAGE'|'OWNER'='DEALER'):ContactLeadInput{return contactLeadSchema.parse({requestId:randomUUID(),customerKind:kind,channel:'ZALO',locale:'zh',stage:'SELECTED',sourcePath:'/zh',details:empty,context:{}});}
async function post(input:unknown,origin=base,ip:string=randomUUID()){return fetch(base+'/api/contact-leads',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'X-Forwarded-For':'contact-test-'+ip},body:JSON.stringify(input)});}
async function notificationChecks(){
 const keys=['CONTACT_WHATSAPP_NOTIFICATIONS','WHATSAPP_CLOUD_ACCESS_TOKEN','WHATSAPP_CLOUD_PHONE_NUMBER_ID','WHATSAPP_TEAM_RECIPIENT','WHATSAPP_LEAD_TEMPLATE_NAME','WHATSAPP_LEAD_TEMPLATE_LANGUAGE','WHATSAPP_GRAPH_VERSION'];
 const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]])),originalFetch=globalThis.fetch;
 try{
  process.env.CONTACT_WHATSAPP_NOTIFICATIONS='false';assert.equal(whatsappNotificationConfig(),null);assert.deepEqual(await notifyContactLead(fixture(),'TEST-ONLY'),{status:'NOT_CONFIGURED'});
  Object.assign(process.env,{CONTACT_WHATSAPP_NOTIFICATIONS:'true',WHATSAPP_CLOUD_ACCESS_TOKEN:'TEST-ONLY-NO-REAL-TOKEN',WHATSAPP_CLOUD_PHONE_NUMBER_ID:'123456789',WHATSAPP_TEAM_RECIPIENT:'12345678901',WHATSAPP_LEAD_TEMPLATE_NAME:'test_only',WHATSAPP_LEAD_TEMPLATE_LANGUAGE:'en',WHATSAPP_GRAPH_VERSION:'v99.0'});
  let requests=0;
  globalThis.fetch=async (url,options)=>{requests++;assert.equal(String(url),'https://graph.facebook.com/v99.0/123456789/messages');const payload=JSON.parse(String(options?.body));assert.equal(payload.to,'12345678901');assert.equal(payload.type,'template');assert.equal(payload.template.components[0].parameters.length,4);return Response.json({messages:[{id:'TEST-ONLY-MESSAGE'}]});};
  assert.equal((await notifyContactLead(fixture(),'TEST-ONLY')).status,'API_ACCEPTED');assert.equal(requests,1);
  globalThis.fetch=async()=>new Response('',{status:401});assert.equal((await notifyContactLead(fixture(),'TEST-ONLY')).status,'FAILED');
 }finally{globalThis.fetch=originalFetch;for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
}
async function run(){
 for(const locale of locales){
  const t=contactIntakeCopy(locale);for(const value of Object.values(t))assert.ok(value.trim());
  for(const kind of customerKinds){
   const input=fixture(kind),message=contactMessage(kind,'WHATSAPP',locale,empty,{partNumber:'TEST-ONLY'},'CTC-TEST','/zh/products/test-only');
   for(const label of [customerKindLabel(kind,locale),t.region,t.vehicle,t.year,t.product,'CTC-TEST','TEST-ONLY'])assert.ok(message.includes(label));
   const whatsapp=new URL(contactDestination('WHATSAPP',kind,message,'CTC-TEST'));
   assert.equal(whatsapp.searchParams.get('text'),message);
   const configuredWhatsapp=new URL(whatsappChannel.url);
   assert.equal(whatsapp.origin+whatsapp.pathname,configuredWhatsapp.origin+configuredWhatsapp.pathname,'All customer types must open the same WhatsApp account.');
   assert.equal(contactDestination('ZALO',kind,message,'CTC-TEST'),zaloChannels[salesCustomerType(kind)].url);
   const email=new URL(contactDestination('EMAIL',kind,message,'CTC-TEST'));assert.equal(email.protocol,'mailto:');assert.equal(email.searchParams.get('body'),message);assert.ok(!email.href.includes('+'),'Mailto spaces must be encoded as %20, not form-style plus signs.');
   assert.equal(decodeContactLead(encodeContactLead(input,{status:'NOT_CONFIGURED'}))?.customerKind,kind);
  }
 }
 assert.equal(salesCustomerType('DEALER'),'B2B');assert.equal(salesCustomerType('GARAGE'),'B2B');assert.equal(salesCustomerType('OWNER'),'B2C');
 assert.equal(publicSourcePath('/order/private-access-token?x=1'),'/order');assert.equal(publicSourcePath('/q/private-access-token'),'/q');assert.equal(publicSourcePath('//evil.example'),'/');assert.equal(publicSourcePath('/zh/products/test?token=private'),'/zh/products/test');
 assert.equal(decodeContactLead('regular inquiry notes'),null);
 assert.ok(!contactLeadSchema.safeParse({...fixture(),details:{...empty,phone:'-------'}}).success);
 await notificationChecks();console.log('PASS: three customer types, six languages, original contact destinations, encoded drafts, private link redaction and isolated official notification adapter');
 if(!process.env.DATABASE_URL)return;
 if(process.env.CONTACT_WHATSAPP_NOTIFICATIONS==='true')throw Error('Integration tests require notifications to be disabled; no real messages will be sent.');
 try{
  for(const kind of customerKinds){
   const input=fixture(kind),reference=contactReference(input.requestId),ip=input.requestId;references.push(reference);
   assert.equal((await post(input,'https://untrusted.example',ip)).status,403);
   assert.equal((await post({...input,customerKind:'B2B'},base,ip)).status,400);
   assert.equal((await post({...input,details:{...empty,year:'2014 onward'}},base,ip)).status,400);
   assert.equal((await post({...input,website:'spam'},base,ip)).status,400);
   assert.equal((await post({...input,details:{...empty,product:'x'.repeat(14000)}},base,ip)).status,400);
   const responses=await Promise.all([post(input,base,ip),post(input,base,ip)]);assert.ok(responses.every(r=>[200,201].includes(r.status)));
   assert.equal(await prisma.inquiry.count({where:{inquiryNumber:reference}}),1);
   const details={region:'TEST REGION',vehicle:'TEST VEHICLE',year:'2001',product:'TEST ONLY — NOT A CUSTOMER ENQUIRY',name:'CONTACT FLOW AUTOMATED TEST',phone:'0000000000',quantity:'2'};
   const prepared={...input,channel:'WHATSAPP',stage:'PREPARED',details};
   assert.equal((await post(prepared,base,ip)).status,200);assert.equal((await post(prepared,base,ip)).status,200);
   assert.equal((await post(input,base,ip)).status,200);
   const record=await prisma.inquiry.findUniqueOrThrow({where:{inquiryNumber:reference}}),lead=decodeContactLead(record.notes);
   assert.equal(lead?.stage,'PREPARED');assert.equal(lead?.details.region,'TEST REGION');assert.equal(lead?.customerKind,kind);assert.equal(lead?.notification.status,'NOT_CONFIGURED');assert.equal(record.productionYear,2001);
  }
  assert.equal((await fetch(base+'/api/contact-leads')).status,405);
  const anonymous=await fetch(base+'/admin/inquiries',{redirect:'manual'});assert.ok([307,308].includes(anonymous.status));
  if(process.env.ADMIN_SESSION_SECRET){
   const expiry=String(Date.now()+3600000),signature=createHmac('sha256',process.env.ADMIN_SESSION_SECRET).update(expiry).digest('hex');
   const headers={Cookie:`ns_admin=${expiry}.${signature}`};
   const admin=await fetch(base+'/admin/inquiries',{headers});assert.equal(admin.status,200);const html=await admin.text();assert.ok(html.includes('TEST REGION'));for(const kind of customerKinds)assert.ok(html.includes(customerKindLabel(kind,'zh')));
   const quote=await fetch(base+'/admin/quotes/new?inquiry='+references[0],{headers});assert.equal(quote.status,200);const quoteHtml=await quote.text();assert.ok(quoteHtml.includes('TEST REGION'));assert.ok(quoteHtml.includes('CONTACT FLOW AUTOMATED TEST'));
  }
  for(const locale of locales){for(const suffix of ['', '/contact','/products/2025-d641-302f']){
   const response=await fetch(`${base}/${locale}${suffix}`);assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('data-contact-intake='));for(const kind of customerKinds)assert.ok(html.includes(customerKindLabel(kind,locale)));
   const dialogs=html.match(/<dialog\b[^>]*class="contact-intake"[^>]*>[\s\S]*?<\/dialog>/g)||[];
   assert.ok(dialogs.length,'Contact entries must include the customer chooser.');
   for(const dialog of dialogs){
    assert.ok(!/<(?:form|input|textarea|fieldset)\b/.test(dialog),'The chooser must not contain a form or a second confirmation screen.');
    const choices=[...dialog.matchAll(/<a\b[^>]*class="contact-intake-choice"[^>]*>/g)].map(match=>match[0]);
    assert.equal(choices.length,3);
    for(const kind of customerKinds){
     const choice=choices.find(value=>value.includes(`data-customer-kind="${kind}"`));assert.ok(choice);
     const href=choice.match(/href="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');assert.ok(href);
     if(choice.includes('data-contact-channel="ZALO"'))assert.equal(href,zaloChannels[salesCustomerType(kind)].url);
     else if(choice.includes('data-contact-channel="WHATSAPP"')){const url=new URL(href);const original=new URL(whatsappChannel.url);assert.equal(url.origin+url.pathname,original.origin+original.pathname);assert.ok(url.searchParams.get('text')?.includes(customerKindLabel(kind,locale)));}
     else {const url=new URL(href);assert.equal(url.protocol,'mailto:');assert.ok(url.searchParams.get('body')?.includes(customerKindLabel(kind,locale)));}
    }
   }
  }}
  console.log('PASS: lead persistence and update, concurrent retry deduplication, stage protection, validation and origin checks, protected admin, quotation prefill and direct three-choice contact links without forms in six languages');
 }finally{await prisma.inquiry.deleteMany({where:{inquiryNumber:{in:references}}});await prisma.$disconnect();}
}
run().catch(error=>{console.error(error instanceof assert.AssertionError?error.message:'Contact intake check failed');process.exitCode=1;});
