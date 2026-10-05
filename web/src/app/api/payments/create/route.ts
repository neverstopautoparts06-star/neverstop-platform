import {api,body,sameOrigin} from '@/lib/commerce/security';
import {createPayment} from '@/lib/commerce/service';
import {z} from 'zod';
export async function POST(request:Request){return api(async()=>{sameOrigin(request);const {token}=z.object({token:z.string().min(40).max(100)}).parse(await body(request));return createPayment(token);});}
