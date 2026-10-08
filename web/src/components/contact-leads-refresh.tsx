'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
export default function ContactLeadsRefresh(){
 const router=useRouter();
 useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==='visible')router.refresh();},30000);return ()=>clearInterval(timer);},[router]);
 return <button type="button" onClick={()=>router.refresh()}>刷新 / Làm mới · 30s</button>;
}
