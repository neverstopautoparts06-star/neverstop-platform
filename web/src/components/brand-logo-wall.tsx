'use client';
import {useState} from 'react';
import Image from 'next/image';
import {type Locale} from '@/lib/i18n';
import type {VehicleBrand} from '@/lib/catalog-types';
import {brandKey,brandLogoMapping,plannedBrandPreview} from '@/lib/vehicle-brand-logos';
import './brand-logo-wall.css';

const copy={
 zh:{title:'支持车型品牌',body:'覆盖主流汽车品牌，车型数据库持续更新。',hint:'点击品牌开始查找；计划支持品牌不代表已有适配或现货。',planned:'计划支持',empty:'车型数据待补充',ready:'查看车型',more:'查看全部品牌',less:'收起品牌',loading:'正在加载品牌…',error:'品牌数据暂时无法加载，请在上方重试。'},
 vi:{title:'HÃNG XE HỖ TRỢ',body:'Hỗ trợ nhiều thương hiệu ô tô phổ biến, dữ liệu xe được cập nhật liên tục.',hint:'Chọn hãng để tra cứu. Hãng dự kiến không đồng nghĩa đã có sản phẩm phù hợp hoặc hàng sẵn.',planned:'Dự kiến',empty:'Dữ liệu đang cập nhật',ready:'Chọn dòng xe',more:'Xem tất cả hãng xe',less:'Thu gọn',loading:'Đang tải hãng xe…',error:'Không tải được dữ liệu. Vui lòng thử lại ở trên.'},
 en:{title:'SUPPORTED VEHICLE BRANDS',body:'Supporting major vehicle brands with continuously expanding fitment data.',hint:'Select a brand to start. Planned brands do not imply confirmed fitment or stock.',planned:'Planned',empty:'Vehicle data pending',ready:'Choose model',more:'View all brands',less:'Show fewer',loading:'Loading brands…',error:'Brand data unavailable. Please retry above.'},
 ar:{title:'ماركات السيارات المدعومة',body:'ندعم أبرز ماركات السيارات مع تحديث بيانات التوافق باستمرار.',hint:'اختر ماركة للبحث. الماركات المخطط دعمها لا تعني تأكيد التوافق أو توفر المخزون.',planned:'دعم مخطط',empty:'بيانات السيارات قيد التحديث',ready:'اختر الطراز',more:'عرض جميع الماركات',less:'عرض أقل',loading:'جارٍ تحميل الماركات…',error:'تعذر تحميل البيانات. يرجى المحاولة أعلاه.'},
 es:{title:'MARCAS COMPATIBLES',body:'Principales marcas con una base de compatibilidad en constante actualización.',hint:'Elige una marca para buscar. Las marcas previstas no garantizan compatibilidad ni existencias.',planned:'Prevista',empty:'Datos de vehículos pendientes',ready:'Elegir modelo',more:'Ver todas las marcas',less:'Ver menos',loading:'Cargando marcas…',error:'Datos no disponibles. Vuelve a intentarlo arriba.'},
 pt:{title:'MARCAS COMPATÍVEIS',body:'Principais marcas com dados de compatibilidade em atualização contínua.',hint:'Selecione uma marca para pesquisar. Marcas previstas não garantem compatibilidade ou estoque.',planned:'Prevista',empty:'Dados de veículos pendentes',ready:'Escolher modelo',more:'Ver todas as marcas',less:'Ver menos',loading:'Carregando marcas…',error:'Dados indisponíveis. Tente novamente acima.'}
};
export default function BrandLogoWall({locale,brands,state,selectedId,onSelect,reference=false}:{locale:Locale;brands:VehicleBrand[];state:'loading'|'ready'|'error';selectedId:string;onSelect:(id:string)=>void;reference?:boolean}){
 const c=copy[locale];const [expanded,setExpanded]=useState(false),[notice,setNotice]=useState(''),[failed,setFailed]=useState<string[]>([]);
 const active=brands.map(b=>({...b,planned:false}));
 const roadmap=plannedBrandPreview.filter(name=>!brands.some(b=>brandKey(b.name)===brandKey(name))).map(name=>({id:`planned-${brandKey(name)}`,name,models:[],planned:true}));
 const items=[...active,...roadmap].sort((a,b)=>(brandLogoMapping[brandKey(a.name)]?.displayOrder??999)-(brandLogoMapping[brandKey(b.name)]?.displayOrder??999));
 return <section className="vehicle-brand-wall" aria-labelledby="brand-wall-title"><div className="brand-wall-heading"><h2 id="brand-wall-title">{c.title}{reference&&<small>/ SUPPORTED CAR BRANDS</small>}</h2><p>{c.body}</p><button type="button" className="brand-wall-more" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?c.less:c.more} →</button></div>
 {state!=='ready'?<p role="status">{state==='loading'?c.loading:c.error}</p>:<><div className={`brand-wall-grid ${expanded?'is-expanded':''}`}>
 {items.map((b,i)=>{const meta=brandLogoMapping[brandKey(b.name)];const ready=!b.planned&&b.models.some(m=>m.variants.length);return <button key={b.id} type="button" className={`brand-wall-item ${i>=8?'brand-extra-mobile':''} ${i>=27?'brand-extra-desktop':''}`} aria-label={`${b.name} · ${ready?c.ready:b.planned?c.planned:c.empty}`} aria-pressed={!b.planned&&selectedId===b.id} onClick={()=>{if(!b.planned){setNotice(ready?'':`${b.name} · ${c.empty}`);onSelect(b.id);}else setNotice(`${b.name} · ${c.empty}`);}}>
 <span className="brand-logo-frame">{meta?.logoUrl&&!failed.includes(b.id)?<span style={{position:'relative',display:'block',width:72,height:36,maxWidth:'100%'}}><Image unoptimized fill sizes="72px" style={{objectFit:'contain'}} src={reference&&meta.displayOrder<27?`/images/home-reference/brand-${brandKey(b.name)}.webp`:meta.logoUrl} alt={meta.logoAlt??b.name} onError={()=>setFailed(old=>[...old,b.id])}/></span>:<strong>{b.name}</strong>}</span><span className="brand-wall-name">{b.name}</span></button>;})}
 {!expanded&&<button type="button" className="brand-wall-item brand-wall-expand" onClick={()=>setExpanded(true)} aria-label={c.more}><span aria-hidden="true">···</span><span>{c.more} →</span></button>}
 </div><p className="brand-wall-hint">{c.hint}</p><p className="brand-wall-notice" role="status" aria-live="polite">{notice}</p></>}
 </section>;
}
