import {randomBytes} from 'node:crypto';
import {equal,sign} from './security';
import {CommerceError} from './validation';
export interface PaymentProvider {name:string;create(amount:number):Promise<{providerPaymentId:string}>;verify(raw:string,signature:string):{providerPaymentId:string;amount:number;status:'PAID'};}
export function mockEnabled(){return process.env.NODE_ENV!=='production'&&process.env.ENABLE_MOCK_PAYMENTS==='true';}
export function requireMock(){if(!mockEnabled())throw new CommerceError(503,'TEST MODE — Payment provider not connected.');}
export const mockProvider:PaymentProvider={name:'MOCK',async create(){requireMock();return {providerPaymentId:'mock_'+randomBytes(24).toString('hex')};},verify(raw,signature){requireMock();const secret=process.env.PAYMENT_WEBHOOK_SECRET;if(!secret||secret.length<32||!equal(signature,sign(raw,secret)))throw new CommerceError(401,'Webhook signature invalid.');const event=JSON.parse(raw);if(event.status!=='PAID'||typeof event.providerPaymentId!=='string'||!Number.isSafeInteger(event.amount))throw new CommerceError(400,'Webhook event invalid.');return event;}};
// Real providers must implement server-side session creation, signed webhook
// verification, currency/amount checks and the same idempotent settlement service.
export function paymentProvider(){if(process.env.PAYMENT_PROVIDER!=='MOCK')throw new CommerceError(503,'Payment provider not connected.');return mockProvider;}
