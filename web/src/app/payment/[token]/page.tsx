import {notFound} from 'next/navigation';
import {getPayment} from '@/lib/commerce/service';
import {mockEnabled} from '@/lib/commerce/provider';
import {CommerceError} from '@/lib/commerce/validation';
import PaymentClient from '@/components/commerce/payment-client';
import '../../commerce.css';
export const dynamic='force-dynamic';
export const metadata={title:'NEVERSTOP · Thanh toán TEST',robots:{index:false,follow:false},referrer:'no-referrer' as const};
async function load(token:string){try{return await getPayment(token);}catch(e){if(e instanceof CommerceError&&e.status===404)notFound();throw e;}}
export default async function Page({params}:{params:Promise<{token:string}>}){const p=await load((await params).token);return <main className="commerce"><PaymentClient p={p} mock={mockEnabled()}/></main>;}
