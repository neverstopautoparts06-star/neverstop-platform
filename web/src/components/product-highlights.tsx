'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {contentLocale,type Locale} from '@/lib/i18n';
import {homeCopy} from '@/lib/home-copy';
import './product-highlights.css';
const copy={
 zh:{standard:'标准减震器',performance:'改装减震器',video:'产品细节视频',pending:'视频待补充',prev:'上一张',next:'下一张',slide:'展示项',error:'视频暂时无法播放'},
 vi:{standard:'Giảm xóc tiêu chuẩn',performance:'Giảm xóc độ',video:'Video chi tiết sản phẩm',pending:'Video sắp cập nhật',prev:'Trước',next:'Tiếp',slide:'Nội dung',error:'Video hiện không khả dụng'},
 en:{standard:'Standard shock absorbers',performance:'Performance shock absorbers',video:'Product detail video',pending:'Video coming soon',prev:'Previous',next:'Next',slide:'Slide',error:'Video currently unavailable'}
};
type Slide={id:string;image:string;title:string;href:string|null};
type Labels=typeof copy.en;
function ProductMediaRow({id,title,slides,videoUrl,t}:{id:string;title:string;slides:Slide[];videoUrl?:string;t:Labels}){
 const track=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0),[videoError,setVideoError]=useState(false),[maxIndex,setMaxIndex]=useState(1);
 useEffect(()=>{
  const el=track.current;if(!el)return;
  const observer=new ResizeObserver(()=>{
   const first=el.firstElementChild as HTMLElement|null;if(!first)return;
   const gap=parseFloat(getComputedStyle(el).columnGap)||0;
   const visible=Math.max(1,Math.round((el.clientWidth+gap)/(first.clientWidth+gap)));
   const last=Math.max(0,slides.length-visible);
   setMaxIndex(last);setActive(index=>Math.min(index,last));
  });
  observer.observe(el);return ()=>observer.disconnect();
 },[slides.length]);
 function go(index:number){
  const el=track.current;if(!el)return;
  const child=el.children[index] as HTMLElement|undefined;
  child?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'start'});
 }
 return <section className="highlight-category" aria-labelledby={`highlight-${id}`}>
  <h3 className="highlight-category-title" id={`highlight-${id}`}>{title}</h3>
  <div className="highlight-track" ref={track} onScroll={()=>{
   const el=track.current;if(!el)return;
   const outer=el.getBoundingClientRect();let best=0,d=Infinity;
   Array.from(el.children).forEach((v,i)=>{const diff=Math.abs(v.getBoundingClientRect().left-outer.left);if(diff<d){d=diff;best=i;}});
   setActive(Math.min(best,maxIndex));
   el.querySelectorAll('video').forEach(v=>{const r=v.getBoundingClientRect();if(r.right<=outer.left||r.left>=outer.right)v.pause();});
  }}>
   {slides.map((s,i)=><article key={s.id} className="highlight-slide" aria-label={`${title} · ${t.slide} ${i+1} / ${slides.length}`}>
    <div className="highlight-media">
     {s.id==='video'&&videoUrl&&!videoError?<video controls playsInline preload="none" poster={s.image} onError={()=>setVideoError(true)} aria-label={`${title} · ${t.video}`}><source src={videoUrl}/></video>:<>
      <Image src={s.image} alt={`${title} · ${s.title}`} fill sizes="(max-width:760px) 90vw, (max-width:1000px) 45vw, 30vw"/>
      {s.id==='video'&&<div className="highlight-video-pending"><span aria-hidden="true">▷</span><p>{videoError?t.error:t.pending}</p></div>}
     </>}
    </div>
    <div className="highlight-caption"><span className="highlight-number">0{i+1}</span>{s.href?<Link href={s.href}>{s.title}</Link>:<h4>{s.title}</h4>}</div>
   </article>)}
  </div>
  <div className="highlight-controls"><div className="highlight-navigation">
   <button type="button" aria-label={`${title} · ${t.prev}`} disabled={active===0} onClick={()=>go(Math.max(0,active-1))}>←</button>
   {slides.slice(0,maxIndex+1).map((s,i)=><button key={s.id} type="button" className="highlight-dot" aria-label={`${title} · ${t.slide} ${i+1}`} aria-current={active===i?'true':undefined} onClick={()=>go(i)}/>)}
   <button type="button" aria-label={`${title} · ${t.next}`} disabled={active>=maxIndex} onClick={()=>go(Math.min(maxIndex,active+1))}>→</button>
  </div></div>
 </section>;
}
export default function ProductHighlights({locale}:{locale:Locale}){
 const lang=contentLocale(locale),c=homeCopy[lang],t=copy[lang];
 const sharedVideo=process.env.NEXT_PUBLIC_PRODUCT_DETAIL_VIDEO_URL?.trim();
 const categories=[
  {id:'standard',title:t.standard,productTitle:c.front,href:`/${locale}/products?axle=FRONT`,video:process.env.NEXT_PUBLIC_STANDARD_SHOCK_VIDEO_URL?.trim()||sharedVideo},
  {id:'performance',title:t.performance,productTitle:t.performance,href:`/${locale}/products`,video:process.env.NEXT_PUBLIC_PERFORMANCE_SHOCK_VIDEO_URL?.trim()||sharedVideo}
 ];
 return <section className="home-section product-section product-highlights" aria-label={c.productTag}>
  <div className="section-top"><div><p className="eyebrow">{c.productTag}</p><h2>{c.productTitle}</h2></div><p>{c.productBody}</p></div>
  {categories.map(category=><ProductMediaRow key={category.id} id={category.id} title={category.title} t={t} videoUrl={category.video} slides={[
   {id:'video',image:'/images/camry-shocks.jpg',title:t.video,href:null},
   {id:'product',image:'/images/camry-shocks.jpg',title:category.productTitle,href:category.href},
   {id:'detail',image:'/images/camry-shocks.jpg',title:c.details,href:`/${locale}/products`},
   {id:'detail-2',image:'/images/camry-shocks.jpg',title:c.details,href:`/${locale}/products`}
  ]}/>) }
 </section>;
}
