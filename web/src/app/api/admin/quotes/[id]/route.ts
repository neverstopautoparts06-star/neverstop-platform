import {api,body,requireAdmin,sameOrigin} from '@/lib/commerce/security';
import {adminAction,editDraft} from '@/lib/commerce/service';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return api(async()=>{sameOrigin(request);await requireAdmin();const {id}=await params;const data=await body(request);return data.action==='revise'?editDraft(id,data.quote):adminAction(id,data.action);});}
