'use client';
import {useState} from 'react';
export default function LogoutButton(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <div><button disabled={busy} onClick={async()=>{
  setBusy(true);setError('');
  try{const response=await fetch('/api/admin/session',{method:'DELETE'});if(!response.ok)throw new Error('Không thể đăng xuất. Vui lòng thử lại.');location.replace('/admin/login');}
  catch(e){setError(e instanceof Error?e.message:'Không thể đăng xuất.');setBusy(false);}
 }}>{busy?'Đang đăng xuất…':'Đăng xuất'}</button>{error&&<p role="alert">{error}</p>}</div>;
}
