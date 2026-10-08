'use client';
import {useId,useRef,useState,type ReactNode,type FormEvent} from 'react';
import {usePathname} from 'next/navigation';
import {localeOf,type Locale} from '@/lib/i18n';
import {contactIntakeCopy} from '@/lib/contact-intake-copy';
import {contactDestination,contactMessage,customerKindLabel,customerKinds,publicSourcePath,type ContactChannel,type ContactDetails,type CustomerKind} from '@/lib/contact-intake';
import type {ProductContext} from '@/lib/zalo-config';
import BrandIcon from './brand-icon';
import './contact-intake.css';

type Props={channel?:ContactChannel;context?:ProductContext;locale?:Locale;children:ReactNode;className?:string;label?:string;asLink?:boolean};
const emptyDetails:ContactDetails={region:'',vehicle:'',year:'',product:'',name:'',phone:'',quantity:''};
function seed(context:ProductContext):ContactDetails{return {...emptyDetails,vehicle:[context.vehicleBrand,context.vehicleModel].filter(Boolean).join(' ').slice(0,200),year:/^(19|20)\d{2}$/.test(context.vehicleYear||'')?context.vehicleYear!:'',product:context.productName?.slice(0,1000)||'',quantity:/^[1-9]\d{0,3}$/.test(context.quantity||'')?context.quantity!:''};}
function channelIcon(channel:ContactChannel){return channel==='EMAIL'?<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></svg>:<BrandIcon name={channel==='ZALO'?'Zalo':'WhatsApp'} size={24}/>;}
const channelNames={ZALO:'Zalo',WHATSAPP:'WhatsApp',EMAIL:'Email'};

export default function ContactIntake({channel,context={},locale:explicit,children,className,label,asLink=false}:Props){
 const path=usePathname(),locale=explicit||localeOf(path.split('/')[1]),t=contactIntakeCopy(locale);
 const dialog=useRef<HTMLDialogElement>(null),requestId=useRef(''),id=useId();
 const [kind,setKind]=useState<CustomerKind|null>(null),[details,setDetails]=useState<ContactDetails>(()=>seed(context));
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState(''),[copyStatus,setCopyStatus]=useState('');
 const [prepared,setPrepared]=useState<{channel:ContactChannel;message:string;href:string}|null>(null);
 function open(){requestId.current=crypto.randomUUID();setKind(null);setDetails(seed(context));setReference('');setPrepared(null);setCopyStatus('');setError('');setBusy(false);dialog.current?.showModal();}
 async function save(customerKind:CustomerKind,selectedChannel:ContactChannel|'CONTACT',stage:'SELECTED'|'PREPARED'){
  const current=requestId.current;
  const response=await fetch('/api/contact-leads',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({requestId:current,customerKind,channel:selectedChannel,stage,locale,details,context:{vehicleBrand:context.vehicleBrand?.slice(0,150)||'',vehicleModel:context.vehicleModel?.slice(0,200)||'',vehicleYear:context.vehicleYear?.slice(0,100)||'',vehicleCode:context.vehicleCode?.slice(0,150)||'',partNumber:context.partNumber?.slice(0,150)||'',oeNumber:context.oeNumber?.slice(0,600)||'',productName:context.productName?.slice(0,200)||''},sourcePath:publicSourcePath(path),website:''})});
  const result=await response.json();
  if(current!==requestId.current)return null;
  if(!response.ok||!result.success)throw new Error(result.error==='rateLimit'?t.rateLimit:t.error);
  setReference(result.reference);return result.reference as string;
 }
 async function select(customerKind:CustomerKind){
  if(busy)return;setKind(customerKind);setBusy(true);setError('');
  const current=requestId.current;
  try{await save(customerKind,channel||'CONTACT','SELECTED');}catch(error){if(current===requestId.current)setError(error instanceof Error?error.message:t.error);}finally{if(current===requestId.current)setBusy(false);}
 }
 async function prepare(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!kind||busy)return;
  const button=(event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;
  const selectedChannel=(button?.value||channel||'ZALO') as ContactChannel;
  if(!['ZALO','WHATSAPP','EMAIL'].includes(selectedChannel))return;
  setBusy(true);setError('');const current=requestId.current;
  try{const ref=await save(kind,selectedChannel,'PREPARED');if(!ref)return;const message=contactMessage(kind,selectedChannel,locale,details,context,ref,path);setPrepared({channel:selectedChannel,message,href:contactDestination(selectedChannel,kind,message,ref)});}catch(error){if(current===requestId.current)setError(error instanceof Error?error.message:t.error);}finally{if(current===requestId.current)setBusy(false);}
 }
 function copyMessage(){if(!prepared)return;if(!navigator.clipboard){setCopyStatus(t.copyFailed);return;}void navigator.clipboard.writeText(prepared.message).then(()=>setCopyStatus(t.copied)).catch(()=>setCopyStatus(t.copyFailed));}
 const controls={className,'aria-label':label,'aria-haspopup':'dialog' as const,'aria-controls':id,'data-contact-intake':channel||'CONTACT'};
 return <>{asLink?<a {...controls} href={`/${locale}/contact`} onClick={event=>{event.preventDefault();open();}}>{children}</a>:<button {...controls} type="button" onClick={open}>{children}</button>}
  <dialog ref={dialog} id={id} className="contact-intake" dir={locale==='ar'?'rtl':'ltr'} aria-labelledby={`${id}-title`} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
   <button type="button" className="contact-intake-close" onClick={()=>dialog.current?.close()} aria-label={t.close}>×</button>
   <p className="contact-intake-brand">NEVERSTOP <span>FACTORY-DIRECT</span></p>
   <h2 id={`${id}-title`}>{kind?t.details:t.choose}</h2>
   {!kind?<><p className="contact-intake-intro">{t.intro}</p><div className="contact-intake-types">{customerKinds.map((value,index)=><button type="button" key={value} onClick={()=>void select(value)}><span aria-hidden="true">0{index+1}</span><strong>{customerKindLabel(value,locale)}</strong><small>{value==='DEALER'?t.dealerHint:value==='GARAGE'?t.garageHint:t.ownerHint}</small><b aria-hidden="true">→</b></button>)}</div><p className="contact-intake-note">{t.recordNote}</p></>:<>
    <div className="contact-intake-selected"><strong>{customerKindLabel(kind,locale)}</strong><button type="button" disabled={busy} onClick={()=>{setKind(null);setPrepared(null);setCopyStatus('');setError('');setReference('');requestId.current=crypto.randomUUID();}}>{t.change}</button></div>
    <p className="contact-intake-welcome">{t.welcome}</p>
    {prepared?<div className="contact-intake-ready"><p role="status">{t.saved}</p><p className="contact-intake-note">{t.reference}: <bdi>{reference}</bdi></p><p>{prepared.channel==='ZALO'?t.zaloHint:t.sendHint}</p><label>{t.chat}<textarea readOnly value={prepared.message} rows={8} onFocus={event=>event.target.select()}/></label><div className="contact-intake-actions">{prepared.channel==='ZALO'&&<button type="button" onClick={copyMessage}>{t.copy}</button>}<a href={prepared.href} target={prepared.channel==='EMAIL'?undefined:'_blank'} rel="noopener noreferrer" onClick={()=>{if(prepared.channel==='ZALO')copyMessage();}}>{channelIcon(prepared.channel)}{t.open} {prepared.channel==='EMAIL'?t.email:channelNames[prepared.channel]} ↗</a></div>{copyStatus&&<p role="status">{copyStatus}</p>}</div>:<form onSubmit={prepare}>
     <p className="contact-intake-note">{t.optional}</p>
     <fieldset disabled={busy}><div className="contact-intake-fields">{(['region','vehicle','year','product','name','phone','quantity'] as const).map(key=><label key={key} className={key==='product'?'contact-intake-wide':undefined}>{t[key]}{key==='product'?<textarea value={details[key]} onChange={event=>setDetails({...details,[key]:event.target.value})} rows={2} maxLength={1000}/>:<input value={details[key]} onChange={event=>setDetails({...details,[key]:event.target.value})} type={key==='phone'?'tel':'text'} inputMode={key==='year'||key==='quantity'?'numeric':undefined} pattern={key==='year'?'(19|20)[0-9]{2}':key==='quantity'?'[1-9][0-9]{0,3}':key==='phone'?'[+0-9() -]{7,25}':undefined} autoComplete={key==='name'?'name':key==='phone'?'tel':key==='region'?'address-level2':'off'} maxLength={{region:160,vehicle:200,year:4,name:100,phone:25,quantity:4}[key]}/>}</label>)}</div>
     <p className="contact-intake-note">{t.recordNote}</p><div className="contact-intake-actions">{(channel?[channel]:['ZALO','WHATSAPP','EMAIL'] as ContactChannel[]).map(value=><button key={value} type="submit" name="channel" value={value}>{channelIcon(value)}{busy?t.saving:t.continue} · {value==='EMAIL'?t.email:channelNames[value]}</button>)}</div></fieldset>
    </form>}
    {busy&&<p role="status" className="contact-intake-note">{t.saving}</p>}{error&&<p role="alert" className="contact-intake-error">{error}</p>}
   </>}
  </dialog>
 </>;
}
