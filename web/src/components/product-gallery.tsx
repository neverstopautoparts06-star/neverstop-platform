'use client';
import Image from 'next/image';
import { useRef,useState } from 'react';
import ProductDetailIcon from './product-detail-icon';
import type {GalleryImage} from '@/lib/product-reference-images';
type Props={images:GalleryImage[];name:string;empty:string;temporary?:boolean;labels:{gallery:string;selectPhoto:string;previousPhoto:string;nextPhoto:string;zoomPhoto:string;close:string;temporaryPhoto:string}};
export default function ProductGallery({images,name,empty,labels,temporary=false}:Props) {
 const [failed,setFailed]=useState<string[]>([]);
 const [selected,setSelected]=useState(images[0]?.id);
 const zoom=useRef<HTMLDialogElement>(null);
 const visible=images.filter(image=>!failed.includes(image.id)&&(image.url.startsWith('/')&&!image.url.startsWith('//')||image.url.startsWith('https://')));
 if(!visible.length)return <div className="pdp-gallery-empty" role="img" aria-label={`${name} · ${empty}`}><svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" aria-hidden="true"><rect x="7" y="7" width="34" height="34" rx="4"/><circle cx="17" cy="17" r="3"/><path d="m7 33 11-10 9 8 6-5 8 7"/></svg><p>{empty}</p></div>;
 const index=Math.max(0,visible.findIndex(image=>image.id===selected)),active=visible[index];
 const fail=(id:string)=>setFailed(values=>values.includes(id)?values:[...values,id]);
 return <div className="pdp-gallery" role="group" aria-label={labels.gallery}>
   <div className="pdp-gallery-main"><Image key={active.id} src={active.url} alt={active.altText||name} fill sizes="(max-width: 800px) 100vw, 49vw" className="pdp-contain" unoptimized onError={()=>fail(active.id)}/><button className={`pdp-gallery-zoom${active.id==='reference-main'?' pdp-reference-zoom':''}`} type="button" onClick={()=>zoom.current?.showModal()} aria-label={labels.zoomPhoto}><ProductDetailIcon name="zoom" size={18}/></button></div>
   {visible.length>1&&<div className="pdp-gallery-thumbnails" onKeyDown={event=>{if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;event.preventDefault();const next=Math.min(visible.length-1,Math.max(0,index+(event.key==='ArrowRight'?1:-1)));setSelected(visible[next].id);event.currentTarget.querySelectorAll('button')[next]?.focus();}}>{visible.map((image,i)=><button key={image.id} type="button" aria-pressed={image.id===active.id} aria-label={labels.selectPhoto.replace('{number}',String(i+1))} onClick={()=>setSelected(image.id)}><Image src={image.thumbnailUrl||image.url} alt="" fill sizes="140px" className="pdp-contain" unoptimized onError={()=>fail(image.id)}/></button>)}</div>}
   {temporary&&<p className="pdp-image-caption">{labels.temporaryPhoto}</p>}
   <dialog ref={zoom} className="pdp-image-dialog" aria-label={labels.zoomPhoto} onClick={event=>{if(event.target===event.currentTarget)zoom.current?.close();}}><button type="button" className="pdp-image-close" aria-label={labels.close} onClick={()=>zoom.current?.close()}><ProductDetailIcon name="close"/></button><div className="pdp-zoom-image"><Image src={active.url} alt={active.altText||name} fill sizes="90vw" className="pdp-contain" unoptimized/></div></dialog>
 </div>;
}
