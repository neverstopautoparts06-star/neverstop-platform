import QRCode from 'qrcode';
import {zaloChannels} from '@/lib/zalo-config';
export async function GET(_request:Request,{params}:{params:Promise<{type:string}>}){const {type}=await params;if(type!=='B2B'&&type!=='B2C')return new Response(null,{status:404});const svg=await QRCode.toString(zaloChannels[type].url,{type:'svg',width:240,margin:3,errorCorrectionLevel:'M'});return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});}
