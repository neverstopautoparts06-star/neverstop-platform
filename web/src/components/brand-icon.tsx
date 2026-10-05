// Original, unmodified assets from the platforms' official websites.
export default function BrandIcon({name,size=24}:{name:'Zalo'|'WhatsApp';size?:number}) {
 return <img className="contact-brand-icon" src={name==='Zalo'?'/brands/zalo.webp':'/brands/whatsapp.svg'} width={size} height={size} alt="" aria-hidden="true" style={{width:size,height:size,objectFit:'contain',flexShrink:0}}/>;
}
