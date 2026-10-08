import {customerKindLabel} from './contact-intake';
import type {ContactLeadInput,ContactNotification} from './contact-leads';

// Server-only credentials. No personal Zalo automation or unofficial messaging gateway.
export function whatsappNotificationConfig(){
 const env=process.env;
 if(env.CONTACT_WHATSAPP_NOTIFICATIONS!=='true')return null;
 const token=env.WHATSAPP_CLOUD_ACCESS_TOKEN?.trim(),phoneId=env.WHATSAPP_CLOUD_PHONE_NUMBER_ID?.trim(),recipient=env.WHATSAPP_TEAM_RECIPIENT?.trim(),template=env.WHATSAPP_LEAD_TEMPLATE_NAME?.trim(),language=env.WHATSAPP_LEAD_TEMPLATE_LANGUAGE?.trim(),version=env.WHATSAPP_GRAPH_VERSION?.trim();
 if(!token||!phoneId||!recipient||!template||!language||!version||!/^\d+$/.test(phoneId)||!/^\d{8,15}$/.test(recipient)||!/^v\d+\.\d+$/.test(version)||!/^\w+$/.test(template)||!/^\w+$/.test(language))return null;
 return {token,phoneId,recipient,template,language,version};
}
export async function notifyContactLead(input:ContactLeadInput,reference:string):Promise<ContactNotification>{
 const config=whatsappNotificationConfig();if(!config)return {status:'NOT_CONFIGURED'};
 const attemptedAt=new Date().toISOString();
 const summary=[input.stage,input.details.name,input.details.phone,input.details.region,input.details.vehicle,input.details.year,input.details.product,input.details.quantity?`Qty: ${input.details.quantity}`:'',input.context.partNumber,input.sourcePath].filter(Boolean).join(' · ').slice(0,1000);
 try{
  const response=await fetch(`https://graph.facebook.com/${config.version}/${config.phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(5000),body:JSON.stringify({messaging_product:'whatsapp',to:config.recipient,type:'template',template:{name:config.template,language:{code:config.language},components:[{type:'body',parameters:[reference,customerKindLabel(input.customerKind,'en'),input.channel,summary].map(text=>({type:'text',text}))}]}})});
  if(!response.ok)return {status:'FAILED',attemptedAt};
  const body=await response.json(),messageId=body.messages?.[0]?.id;
  // API acceptance is not a confirmed delivery receipt.
  return typeof messageId==='string'?{status:'API_ACCEPTED',attemptedAt,messageId}:{status:'FAILED',attemptedAt};
 }catch{return {status:'FAILED',attemptedAt};}
}
