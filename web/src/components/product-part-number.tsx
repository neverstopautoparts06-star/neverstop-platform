'use client';
import {useEffect,useState} from 'react';
import ProductDetailIcon from './product-detail-icon';
export default function ProductPartNumber({value,label,copy,copied,unavailable}:{value:string;label:string;copy:string;copied:string;unavailable:string}){
  const [status,setStatus]=useState<'copied'|'failed'|null>(null);
  useEffect(()=>{if(!status)return;const timer=setTimeout(()=>setStatus(null),3000);return()=>clearTimeout(timer);},[status]);
  async function copyNumber(){try{await navigator.clipboard.writeText(value);setStatus('copied');}catch{setStatus('failed');}}
  return <div className="pdp-part-number"><span>{label}</span><div><strong dir="ltr">{value}</strong><button type="button" onClick={copyNumber} aria-label={copy} title={copy}><ProductDetailIcon name={status==='copied'?'check':'copy'} size={21}/></button></div><span className="pdp-copy-status" role="status">{status==='copied'?copied:status==='failed'?unavailable:''}</span></div>;
}
