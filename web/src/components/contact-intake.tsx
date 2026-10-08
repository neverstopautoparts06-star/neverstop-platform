'use client';
import {useId,useRef,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {localeOf,type Locale} from '@/lib/i18n';
import {contactIntakeCopy} from '@/lib/contact-intake-copy';
import {contactDestination,contactMessage,customerKindLabel,customerKinds,publicSourcePath,type ContactChannel,type ContactDetails,type CustomerKind} from '@/lib/contact-intake';
import type {ProductContext} from '@/lib/zalo-config';
import BrandIcon from './brand-icon';
import './contact-intake.css';

type Props={channel?:ContactChannel;context?:ProductContext;locale?:Locale;children:ReactNode;className?:string;label?:string;asLink?:boolean};
const emptyDetails:ContactDetails={region:'',vehicle:'',year:'',product:'',name:'',phone:'',quantity:''};
const channels:ContactChannel[]=['ZALO','WHATSAPP','EMAIL'];
const channelNames={ZALO:'Zalo',WHATSAPP:'WhatsApp',EMAIL:'Email'};
function seed(context:ProductContext):ContactDetails {
 return {...emptyDetails,vehicle:[context.vehicleBrand,context.vehicleModel].filter(Boolean).join(' ').slice(0,200),year:/^(19|20)\d{2}$/.test(context.vehicleYear||'')?context.vehicleYear!:'',product:context.productName?.slice(0,1000)||'',quantity:/^[1-9]\d{0,3}$/.test(context.quantity||'')?context.quantity!:''};
}
function channelIcon(channel:ContactChannel) {
 return channel==='EMAIL'?<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></svg>:<BrandIcon name={channel==='ZALO'?'Zalo':'WhatsApp'} size={24}/>;
}

export default function ContactIntake({channel,context={},locale:explicit,children,className,label,asLink=false}:Props) {
 const path=usePathname(),locale=explicit||localeOf(path.split('/')[1]),t=contactIntakeCopy(locale);
 const dialog=useRef<HTMLDialogElement>(null),id=useId();
 const [requestId,setRequestId]=useState('');
 const [selectedChannel,setSelectedChannel]=useState<ContactChannel>(channel||'ZALO');
 const [failure,setFailure]=useState<{body:string;message:string}|null>(null);
 const [retrying,setRetrying]=useState(false);
 const details=seed(context),reference=requestId?`CTC-${requestId.toUpperCase()}`:'';

 function open() {
  setRequestId(crypto.randomUUID());
  setSelectedChannel(channel||'ZALO');
  dialog.current?.showModal();
 }
 async function save(body:string) {
  try {
   const response=await fetch('/api/contact-leads',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,signal:AbortSignal.timeout(20000),body});
   const result=await response.json();
   if(!response.ok||!result.success)throw new Error(result.error==='rateLimit'?t.rateLimit:t.error);
   setFailure(current=>current?.body===body?null:current);
  } catch(error) {
   setFailure({body,message:error instanceof Error&&error.message===t.rateLimit?t.rateLimit:t.error});
  }
 }
 function select(customerKind:CustomerKind,message:string) {
  const body=JSON.stringify({requestId,customerKind,channel:selectedChannel,stage:'SELECTED',locale,details,context:{vehicleBrand:context.vehicleBrand?.slice(0,150)||'',vehicleModel:context.vehicleModel?.slice(0,200)||'',vehicleYear:context.vehicleYear?.slice(0,100)||'',vehicleCode:context.vehicleCode?.slice(0,150)||'',partNumber:context.partNumber?.slice(0,150)||'',oeNumber:context.oeNumber?.slice(0,600)||'',productName:context.productName?.slice(0,200)||''},sourcePath:publicSourcePath(path),website:''});
  // Keep native anchor navigation in this click; recording must not delay or gate chat opening.
  void save(body);
  if(selectedChannel==='ZALO'&&navigator.clipboard)void navigator.clipboard.writeText(message).catch(()=>{});
  dialog.current?.close();
 }
 async function retry() {
  if(!failure||retrying)return;
  setRetrying(true);
  await save(failure.body);
  setRetrying(false);
 }
 const controls={className,'aria-label':label,'aria-haspopup':'dialog' as const,'aria-controls':id,'data-contact-intake':channel||'CONTACT'};
 return <>
  {asLink?<a {...controls} href={`/${locale}/contact`} onClick={event=>{event.preventDefault();open();}}>{children}</a>:<button {...controls} type="button" onClick={open}>{children}</button>}
  <dialog ref={dialog} id={id} className="contact-intake" dir={locale==='ar'?'rtl':'ltr'} aria-labelledby={`${id}-title`} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
   <button type="button" className="contact-intake-close" onClick={()=>dialog.current?.close()} aria-label={t.close}>×</button>
   <p className="contact-intake-brand">NEVERSTOP <span>FACTORY-DIRECT</span></p>
   <h2 id={`${id}-title`}>{t.choose}</h2>
   <p className="contact-intake-intro">{t.intro}</p>
   {!channel?<div className="contact-intake-channels" role="group" aria-label={t.channel}>{channels.map(value=><button type="button" key={value} aria-pressed={selectedChannel===value} onClick={()=>setSelectedChannel(value)}>{channelIcon(value)}{value==='EMAIL'?t.email:channelNames[value]}</button>)}</div>:<p className="contact-intake-channel">{channelIcon(channel)}{channel==='EMAIL'?t.email:channelNames[channel]}</p>}
   <div className="contact-intake-types">{customerKinds.map((value,index)=>{
    const message=contactMessage(value,selectedChannel,locale,details,context,reference,path);
    return <a className="contact-intake-choice" key={value} data-customer-kind={value} data-contact-channel={selectedChannel} href={contactDestination(selectedChannel,value,message,reference)} target={selectedChannel==='EMAIL'?undefined:'_blank'} rel="noopener noreferrer" onClick={()=>select(value,message)} onAuxClick={event=>{if(event.button===1)select(value,message);}}>
     <span aria-hidden="true">0{index+1}</span><strong>{customerKindLabel(value,locale)}</strong><small>{value==='DEALER'?t.dealerHint:value==='GARAGE'?t.garageHint:t.ownerHint}</small><b aria-hidden="true">→</b>
    </a>;
   })}</div>
   <p className="contact-intake-note">{t.recordNote}</p>
  </dialog>
  {failure&&<div className="contact-intake-save-error" dir={locale==='ar'?'rtl':'ltr'} role="alert"><p>{failure.message}</p><button type="button" disabled={retrying} onClick={()=>void retry()}>{retrying?t.saving:t.retrySave}</button><button type="button" onClick={()=>setFailure(null)} aria-label={t.close}>×</button></div>}
 </>;
}
