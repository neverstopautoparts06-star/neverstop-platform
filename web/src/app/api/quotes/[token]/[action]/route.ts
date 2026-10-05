import {api,body,sameOrigin} from '@/lib/commerce/security';
import {acceptQuote,confirmCod} from '@/lib/commerce/service';
import {CommerceError} from '@/lib/commerce/validation';
export async function POST(request:Request,{params}:{params:Promise<{token:string;action:string}>}){return api(async()=>{sameOrigin(request);const {token,action}=await params;const data=await body(request);if(action==='accept')return acceptQuote(token,data.consent);if(action==='cod')return confirmCod(token,data);throw new CommerceError(404,'Không tìm thấy.');});}
