import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'node:crypto';
export const runtime='nodejs';
const state=globalThis as unknown as { inquiryLimits?: Map<string,{count:number;expires:number}> };
const limits=state.inquiryLimits??=new Map();
function reply(error:string,status:number){return NextResponse.json({success:false,error},{status});}
async function readBody(request:NextRequest){
 const reader=request.body?.getReader();if(!reader)throw Error('body');const chunks:Uint8Array[]=[];let size=0;
 while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>12000){await reader.cancel();throw Error('body');}chunks.push(chunk.value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 const host=request.headers.get('x-forwarded-host')?.split(',')[0].trim()||request.nextUrl.host;
 try{if(!origin||new URL(origin).host!==host||request.headers.get('sec-fetch-site')==='cross-site')return reply('forbidden',403);}catch{return reply('forbidden',403);}
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply('invalid',415);
 const now=Date.now();for(const [key,value] of limits)if(value.expires<now)limits.delete(key);
 const ip=createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown').digest('hex');
 const bucket=limits.get(ip)??{count:0,expires:now+600000};if(bucket.count>=15)return reply('rateLimit',429);bucket.count++;limits.set(ip,bucket);
 let body;try{body=await readBody(request);}catch{return reply('invalid',400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return reply('invalid',400);
 const text=(key:string)=>typeof body[key]==='string'?body[key].trim():'';
 const name=text('name'),phone=text('phone').replace(/[ ()-]/g,''),message=text('message'),vehicle=text('vehicle'),productId=text('productId'),requestId=text('requestId'),website=text('website');
 const quantity=body.quantity;
 if(website||name.length<2||name.length>100||!/^\+?\d{9,15}$/.test(phone)||message.length<5||message.length>2000||vehicle.length>200||productId.length>100||body.consent!==true||!Number.isInteger(quantity)||quantity<1||quantity>999||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return reply('invalid',400);
 const reference='INQ-'+requestId.toUpperCase();
 try{
  const existing=await prisma.inquiry.findUnique({where:{inquiryNumber:reference},select:{inquiryNumber:true}});
  if(existing)return NextResponse.json({success:true,reference:existing.inquiryNumber});
  const recent=await prisma.inquiry.count({where:{phone,createdAt:{gte:new Date(now-600000)}}});if(recent>=5)return reply('rateLimit',429);
  if(productId&&!await prisma.product.findFirst({where:{id:productId,status:'ACTIVE'},select:{id:true}}))return reply('productUnavailable',409);
  await prisma.inquiry.create({data:{inquiryNumber:reference,customerName:name,phone,notes:[vehicle?'Vehicle: '+vehicle:'',message,'Contact consent: yes'].filter(Boolean).join('\n'),...(productId?{items:{create:{productId,quantity}}}:{notes:[vehicle?'Vehicle: '+vehicle:'',message,'Quantity: '+quantity,'Contact consent: yes'].filter(Boolean).join('\n')})}});
  return NextResponse.json({success:true,reference},{status:201});
 }catch(error){
  if(error&&typeof error==='object'&&'code' in error&&error.code==='P2002')return NextResponse.json({success:true,reference});
  console.error('Inquiry could not be saved');return reply('unavailable',503);
 }
}
