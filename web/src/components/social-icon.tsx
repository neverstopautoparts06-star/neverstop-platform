import {useId} from 'react';
export default function SocialIcon({name}:{name:string}) {
 const gradientId=useId();
 const common={viewBox:'0 0 24 24','aria-hidden':true as const,focusable:false,width:36,height:36};
 if(name==='Facebook')return <svg {...common}><circle cx="12" cy="12" r="12" fill="#0866FF"/><path fill="#fff" d="M13.7 22v-9.1h3.1l.5-3.6h-3.6V7c0-1 .3-1.8 1.8-1.8h1.9V2a25 25 0 0 0-2.8-.2c-2.8 0-4.6 1.7-4.6 4.8v2.7H7v3.6h3V22z"/></svg>;
 if(name==='TikTok'){
 const note='M15.6 2h-3.4v13.5a3 3 0 1 1-2.6-3V9a6.4 6.4 0 1 0 6 6.4V8.6a8.7 8.7 0 0 0 5.1 1.6V6.8c-3.1-.1-5.1-2.1-5.1-4.8z';
 return <svg {...common}><rect width="24" height="24" rx="5" fill="#000"/><g transform="translate(2 2) scale(.8)"><path d={note} fill="#25F4EE" transform="translate(-1 -.6)"/><path d={note} fill="#FE2C55" transform="translate(1 .7)"/><path d={note} fill="#fff"/></g></svg>;
 }
 if(name==='Instagram')return <svg {...common}><defs><radialGradient id={gradientId} cx="25%" cy="100%" r="120%"><stop offset="0%" stopColor="#FFDC80"/><stop offset="25%" stopColor="#FCAF45"/><stop offset="50%" stopColor="#F56040"/><stop offset="70%" stopColor="#C13584"/><stop offset="100%" stopColor="#5851DB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill={`url(#${gradientId})`}/><g fill="none" stroke="#fff" strokeWidth="1.7"><rect x="4.5" y="4.5" width="15" height="15" rx="4.2"/><circle cx="12" cy="12" r="3.6"/></g><circle cx="17" cy="7" r="1" fill="#fff"/></svg>;
 if(name==='YouTube')return <svg {...common} fill="#FF0033"><path d="M21.6 6.3c-.3-1.1-1.1-1.9-2.2-2.1C17.5 3.7 12 3.7 12 3.7s-5.5 0-7.4.5C3.5 4.4 2.7 5.2 2.4 6.3 2 8.2 2 12 2 12s0 3.8.4 5.7c.3 1.1 1.1 1.9 2.2 2.1 1.9.5 7.4.5 7.4.5s5.5 0 7.4-.5c1.1-.2 1.9-1 2.2-2.1.4-1.9.4-5.7.4-5.7s0-3.8-.4-5.7z"/><path d="m10 8 6 4-6 4z" fill="#fff"/></svg>;
 return <svg {...common} viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#0068FF"/><path d="M8 7h32a5 5 0 0 1 5 5v23a5 5 0 0 1-5 5H19l-9 5v-5H8a5 5 0 0 1-5-5V12a5 5 0 0 1 5-5z" fill="#fff"/><text x="24" y="28" textAnchor="middle" fill="#0068FF" fontSize="14" fontFamily="Arial,sans-serif" fontWeight="700">Zalo</text></svg>;
}
