import {createHmac, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {CommerceError} from './validation';
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function sessionKey(){const s=process.env.ADMIN_SESSION_SECRET;if(!s||s.length<32)throw new CommerceError(503,'Admin chưa được cấu hình.');return s;}
export function sign(value:string,secret=sessionKey()){return createHmac('sha256',secret).update(value).digest('hex');}
export async function isAdmin(){const value=(await cookies()).get('ns_admin')?.value;if(!value)return false;const [expiry,signature]=value.split('.');return Number(expiry)>Date.now()&&Number(expiry)<Date.now()+9*3600000&&!!signature&&equal(signature,sign(expiry));}
export async function requireAdmin(){if(!await isAdmin())throw new CommerceError(401,'Vui lòng đăng nhập.');}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==`${new URL(request.url).protocol}//${request.headers.get('host')}`)throw new CommerceError(403,'Yêu cầu không hợp lệ.');}
export async function body(request:Request){if(Number(request.headers.get('content-length')||0)>100_000)throw new CommerceError(413,'Dữ liệu quá lớn.');const raw=await request.text();if(raw.length>100_000)throw new CommerceError(413,'Dữ liệu quá lớn.');try{return JSON.parse(raw);}catch{throw new CommerceError(400,'Dữ liệu không hợp lệ.');}}
export const noStore={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'};
export async function api(fn:()=>Promise<unknown>){try{return Response.json(await fn(),{headers:noStore});}catch(e){if(e instanceof CommerceError)return Response.json({error:e.message},{status:e.status,headers:noStore});if(e instanceof Error&&e.name==='ZodError')return Response.json({error:'Vui lòng kiểm tra thông tin đã nhập.'},{status:400,headers:noStore});console.error('Commerce operation failed',e&&typeof e==='object'&&'code' in e?String(e.code):'UNKNOWN');return Response.json({error:'Không thể xử lý yêu cầu. Vui lòng thử lại hoặc liên hệ NEVERSTOP.'},{status:503,headers:noStore});}}
