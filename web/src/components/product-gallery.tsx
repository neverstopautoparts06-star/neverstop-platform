'use client';
import Image from 'next/image';
import { useState } from 'react';
export default function ProductGallery({images,name,empty}:{images:{id:string;url:string;altText:string|null}[];name:string;empty:string}) {
 const [failed,setFailed]=useState<string[]>([]);
 const visible=images.filter(image=>!failed.includes(image.id)&&(image.url.startsWith('/')&&!image.url.startsWith('//')||image.url.startsWith('https://')));
 if(!visible.length)return <div className="flex min-h-72 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">{empty}</div>;
 return <div className="grid gap-4">{visible.map(image=><div key={image.id} className="relative aspect-square overflow-hidden rounded-2xl bg-white"><Image src={image.url} alt={image.altText||name} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-contain p-4" unoptimized onError={()=>setFailed(values=>[...values,image.id])}/></div>)}</div>;
}
