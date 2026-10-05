import {api} from '@/lib/commerce/security';
import {getPayment} from '@/lib/commerce/service';
export async function GET(_r:Request,{params}:{params:Promise<{id:string}>}){return api(async()=>getPayment((await params).id));}
