'use client';
import {useState} from 'react';
export const formatMoney=(n:number|string)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(n));
export async function post(path:string,data:unknown){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw new Error(result.error||'Không thể xử lý yêu cầu.');return result;}
export function CopyButton({value,label}:{value:string;label:string}){const [done,setDone]=useState(false),[error,setError]=useState(false);return <><button onClick={async()=>{try{await navigator.clipboard.writeText(value);setDone(true);}catch{setError(true);}}}>{done?'Đã sao chép':label}</button>{error&&<textarea readOnly value={value} onFocus={e=>e.target.select()} aria-label={label}/>}</>;}
