import {api,sameOrigin} from '@/lib/commerce/security';
import {requireMock} from '@/lib/commerce/provider';
import {settlePayment} from '@/lib/commerce/service';
import {prisma} from '@/lib/prisma';
import {CommerceError} from '@/lib/commerce/validation';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return api(async()=>{sameOrigin(request);requireMock();const p=await prisma.payment.findUnique({where:{publicToken:(await params).id}});if(!p?.providerPaymentId||p.provider!=='MOCK')throw new CommerceError(404,'Test payment not found.');return settlePayment(p.providerPaymentId,Number(p.amount));});}
