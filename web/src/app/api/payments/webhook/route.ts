import {api} from '@/lib/commerce/security';
import {paymentProvider} from '@/lib/commerce/provider';
import {settlePayment} from '@/lib/commerce/service';
import {CommerceError} from '@/lib/commerce/validation';
export async function POST(request:Request){return api(async()=>{if(Number(request.headers.get('content-length')||0)>10000)throw new CommerceError(413,'Event too large.');const raw=await request.text();if(raw.length>10000)throw new CommerceError(413,'Event too large.');const event=paymentProvider().verify(raw,request.headers.get('x-payment-signature')||'');return settlePayment(event.providerPaymentId,event.amount);});}
