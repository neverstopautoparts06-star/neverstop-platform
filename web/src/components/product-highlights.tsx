'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {contentLocale,type Locale} from '@/lib/i18n';
import {homeCopy} from '@/lib/home-copy';
import './product-highlights.css';
const videoUrl=process.env.NEXT_PUBLIC_PRODUCT_DETAIL_VIDEO_URL?.trim();
const copy={zh:{quality:'产品检测',video:'产品细节视频',pending:'视频待补充',prev:'上一张',next:'下一张',slide:'展示项',error:'视频暂时无法播放'},vi:{quality:'Kiểm tra sản phẩm',video:'Video chi tiết sản phẩm',pending:'Video sắp cập nhật',prev:'Trước',next:'Tiếp',slide:'Nội dung',error:'Video hiện không khả dụng'},en:{quality:'Product testing',video:'Product detail video',pending:'Video coming soon',prev:'Previous',next:'Next',slide:'Slide',error:'Video currently unavailable'}};
export default function ProductHighlights({locale}:{locale:Locale}){
 const lang=contentLocale(locale),c=homeCopy[lang],t=copy[lang];
 const track=useRef<HTMLDivElement>(null);const [active,setActive]=useState(0),[videoError,setVideoError]=useState(false);
 const [maxIndex,setMaxIndex]=useState(1);
 useEffect(()=>{const el=track.current;if(!el)return;const observer=new ResizeObserver(()=>{const first=el.firstElementChild as HTMLElement|null;if(!first)return;const visible=Math.max(1,Math.round(el.clientWidth/first.clientWidth));setMaxIndex(4-visible);});observer.observe(el);return ()=>observer.disconnect();},[]);
 const slides=[
  {id:'video',image:'/images/camry-shocks.jpg',title:t.video,href:null},
  {id:'front',image:'/images/camry-shocks.jpg',title:c.front,href:`/${locale}/products?axle=FRONT`},
  {id:'detail',image:'/images/camry-shocks.jpg',title:c.details,href:`/${locale}/products`},
  {id:'product',image:'/images/camry-shocks.jpg',title:c.details,href:`/${locale}/products`}
 ];
 function go(index:number){const el=track.current;if(!el)return;const child=el.children[index] as HTMLElement;child?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'start'});}
 return <section className="home-section product-section product-highlights" aria-label={c.productTag}><div className="section-top"><div><p className="eyebrow">{c.productTag}</p><h2>{c.productTitle}</h2></div><p>{c.productBody}</p></div>
 <div className="highlight-track" ref={track} onScroll={()=>{const el=track.current;if(!el)return;const edge=el.getBoundingClientRect().left;let best=0,d=Infinity;Array.from(el.children).forEach((v,i)=>{const diff=Math.abs(v.getBoundingClientRect().left-edge);if(diff<d){d=diff;best=i;}});setActive(Math.min(best,maxIndex));el.querySelectorAll('video').forEach(v=>{const r=v.getBoundingClientRect(),outer=el.getBoundingClientRect();if(r.right<=outer.left||r.left>=outer.right)v.pause();});}}>
 {slides.map((s,i)=><article key={s.id} className="highlight-slide" aria-label={`${t.slide} ${i+1} / 4`}><div className="highlight-media">{s.id==='video'&&videoUrl&&!videoError?<video controls playsInline preload="none" poster={s.image} onError={()=>setVideoError(true)} aria-label={t.video}><source src={videoUrl}/></video>:<><Image src={s.image} alt={s.title} fill sizes="(max-width:760px) 90vw, (max-width:1000px) 45vw, 30vw"/>{s.id==='video'&&<div className="highlight-video-pending"><span aria-hidden="true">▷</span><p>{videoError?t.error:t.pending}</p></div>}</>}</div><div className="highlight-caption"><span className="highlight-number">0{i+1}</span>{s.href?<Link href={s.href}>{s.title}</Link>:<h3>{s.title}</h3>}</div></article>)}
 </div><div className="highlight-controls"><div className="highlight-navigation"><button type="button" aria-label={t.prev} disabled={active===0} onClick={()=>go(Math.max(0,active-1))}>←</button>{slides.slice(0,maxIndex+1).map((s,i)=><button key={s.id} type="button" className="highlight-dot" aria-label={`${t.slide} ${i+1}`} aria-current={active===i?'true':undefined} onClick={()=>go(i)}/>)}<button type="button" aria-label={t.next} disabled={active>=maxIndex} onClick={()=>go(Math.min(maxIndex,active+1))}>→</button></div></div></section>;
}
