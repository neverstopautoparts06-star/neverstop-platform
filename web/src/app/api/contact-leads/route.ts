import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {prisma} from '@/lib/prisma';
import {contactLeadSchema,contactReference,decodeContactLead,encodeContactLead} from '@/lib/contact-leads';
import {notifyContactLead} from '@/lib/contact-notification';

export const runtime='nodejs';
const state=globalThis as unknown as {contactLeadLimits?:Map<string,{count:number;expires:number}>};
const limits=state.contactLeadLimits??=new Map();
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
function error(code:string,status:number){return NextResponse.json({success:false,error:code},{status,headers});}
function success(reference:string,status=200){return NextResponse.json({success:true,reference},{status,headers});}
async function readBody(request:NextRequest){
 const reader=request.body?.getReader();if(!reader)throw Error('body');let size=0;const chunks:Uint8Array[]=[];
 while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>12000){await reader.cancel();throw Error('body');}chunks.push(chunk.value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 const host=request.headers.get('x-forwarded-host')?.split(',')[0].trim()||request.headers.get('host')||request.nextUrl.host;
 try{if(!origin||new URL(origin).host!==host||request.headers.get('sec-fetch-site')==='cross-site')return error('forbidden',403);}catch{return error('forbidden',403);}
 if(!request.headers.get('content-type')?.startsWith('application/json'))return error('invalid',415);
 const now=Date.now();for(const [key,value] of limits)if(value.expires<now)limits.delete(key);
 const ip=createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown').digest('hex');
 const bucket=limits.get(ip)??{count:0,expires:now+600000};if(bucket.count>=30)return error('rateLimit',429);bucket.count++;limits.set(ip,bucket);
 let input;try{input=contactLeadSchema.parse(await readBody(request));}catch{return error('invalid',400);}
 const reference=contactReference(input.requestId);
 try{
  const existing=await prisma.inquiry.findUnique({where:{inquiryNumber:reference},select:{notes:true}});
  const previous=existing?decodeContactLead(existing.notes):null;
  if(existing&&!previous)return error('invalid',409);
  // A delayed selection retry cannot overwrite a prepared enquiry. No duplicate push for retries.
  if(previous&&(input.stage==='SELECTED'||JSON.stringify(contactLeadSchema.parse(previous))===JSON.stringify(input)))return success(reference);
  const notes=encodeContactLead(input,{status:'NOT_CONFIGURED'});
  const data={notes,customerName:input.details.name||null,phone:input.details.phone.replace(/[ ()-]/g,'')||null,vehicleBrand:input.context.vehicleBrand||null,vehicleModel:input.details.vehicle||input.context.vehicleModel||null,modelCode:input.context.vehicleCode||null,productionYear:input.details.year?Number(input.details.year):null};
  if(existing){
   // Only the request that wins this comparison may issue a notification.
   const updated=await prisma.inquiry.updateMany({where:{inquiryNumber:reference,notes:existing.notes},data});
   if(!updated.count){const latest=await prisma.inquiry.findUnique({where:{inquiryNumber:reference},select:{notes:true}});const current=latest?decodeContactLead(latest.notes):null;return current&&JSON.stringify(contactLeadSchema.parse(current))===JSON.stringify(input)?success(reference):error('conflict',409);}
  }else{
   try{await prisma.inquiry.create({data:{inquiryNumber:reference,...data}});}catch(cause){if(cause&&typeof cause==='object'&&'code' in cause&&cause.code==='P2002')return success(reference);throw cause;}
  }
  const notification=await notifyContactLead(input,reference);
  if(notification.status!=='NOT_CONFIGURED')await prisma.inquiry.updateMany({where:{inquiryNumber:reference,notes},data:{notes:encodeContactLead(input,notification)}});
  return success(reference,existing?200:201);
 }catch{console.error('Contact enquiry could not be saved');return error('unavailable',503);}
}
