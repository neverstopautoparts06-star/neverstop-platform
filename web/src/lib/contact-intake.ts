import type {Locale} from './i18n';
import {contactIntakeCopy} from './contact-intake-copy';
import {zaloChannels,whatsappChannel,type ProductContext} from './zalo-config';

export const customerKinds=['DEALER','GARAGE','OWNER'] as const;
export type CustomerKind=typeof customerKinds[number];
export type ContactChannel='ZALO'|'WHATSAPP'|'EMAIL';
export type ContactDetails={region:string;vehicle:string;year:string;product:string;name:string;phone:string;quantity:string};
export const contactEmail='neverstopautoparts06@gmail.com';
export function customerKindLabel(kind:CustomerKind,locale:Locale){const t=contactIntakeCopy(locale);return {DEALER:t.dealer,GARAGE:t.garage,OWNER:t.owner}[kind];}
export function salesCustomerType(kind:CustomerKind):'B2B'|'B2C'{return kind==='OWNER'?'B2C':'B2B';}
export function publicSourcePath(path:string){
 if(!path.startsWith('/')||path.startsWith('//')||path.length>500)return '/';
 const clean=path.split(/[?#]/)[0];
 // Private order/quote/payment links are capabilities; do not copy their tokens into leads.
 return clean.replace(/^\/(q|order|pay|payment)\/[^/]+.*$/,'/$1');
}
export function contactMessage(kind:CustomerKind,channel:ContactChannel,locale:Locale,details:ContactDetails,context:ProductContext,reference:string,path:string){
 const t=contactIntakeCopy(locale),value=(text:string|undefined)=>text?.trim()||t.pending;
 const rows=[t.hello,'',`${t.customerType}: ${customerKindLabel(kind,locale)} (${customerKindLabel(kind,'vi')} / ${customerKindLabel(kind,'en')})`,`${t.channel}: ${channel}`,`${t.reference}: ${reference}`,'',
  `${t.region}: ${value(details.region)}`,`${t.vehicle}: ${value(details.vehicle)}`,`${t.year}: ${value(details.year)}`,`${t.product}: ${value(details.product)}`];
 for(const [label,text] of [[t.name,details.name],[t.phone,details.phone],[t.quantity,details.quantity],[t.partNumber,context.partNumber],[t.oem,context.oeNumber],[t.chassis,context.vehicleCode]] as const)if(text?.trim())rows.push(`${label}: ${text.trim()}`);
 rows.push('',`${t.source}: ${publicSourcePath(path)}`);
 return rows.join('\n');
}
export function contactDestination(channel:ContactChannel,kind:CustomerKind,message:string,reference:string){
 if(channel==='ZALO')return zaloChannels[salesCustomerType(kind)].url;
 if(channel==='WHATSAPP'){const url=new URL(whatsappChannel.url);url.searchParams.set('text',message);return url.href;}
 return `mailto:${contactEmail}?subject=${encodeURIComponent(`NEVERSTOP · ${reference}`)}&body=${encodeURIComponent(message)}`;
}
