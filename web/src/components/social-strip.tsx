import type {Locale} from '@/lib/i18n';
import {contentLocale} from '@/lib/i18n';
import {homeCopy} from '@/lib/home-copy';
import {socialLinks} from '@/lib/social-config';
import SocialIcon from './social-icon';
import ZaloVideoIcon from './zalo-video-icon';
import './social-strip.css';
export default function SocialStrip({locale}:{locale:Locale}){
 const c=homeCopy[contentLocale(locale)];
 const pending=locale==='zh'?'账号链接待确认':locale==='vi'?'Đang xác nhận liên kết tài khoản':'Profile link pending';
 const items=[{name:'Zalo Video',handle:'Neverstopautoparts',href:undefined},...socialLinks,{name:'YouTube',handle:c.pending,href:undefined}];
 return <section id="social" className="social-section compact-social"><div className="social-heading"><p className="eyebrow">NEVERSTOP / SOCIAL</p><h2>{c.socialTitle}</h2><p>{c.socialBody}</p></div><div className="social-strip-items">{items.map(item=>{const content=<><span className="strip-platform-icon">{item.name==='Zalo Video'?<ZaloVideoIcon/>:<SocialIcon name={item.name}/>}</span><span className="strip-platform-copy"><strong>{item.name}</strong><span>{item.handle}</span></span></>;return item.href?<a className="strip-social-card" key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.name}: ${item.handle}`}>{content}</a>:<div className="strip-social-card unavailable" key={item.name} aria-disabled="true" title={item.name==='Zalo Video'?pending:c.pending}>{content}</div>;})}</div></section>;
}
