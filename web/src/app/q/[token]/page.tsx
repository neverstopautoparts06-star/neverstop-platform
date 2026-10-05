import {notFound} from 'next/navigation';
import {getPublicQuote} from '@/lib/commerce/service';
import {CommerceError} from '@/lib/commerce/validation';
import QuoteClient from '@/components/commerce/quote-client';
import '../../commerce.css';
export const dynamic='force-dynamic';
export const metadata={title:'NEVERSTOP · Báo giá',robots:{index:false,follow:false},referrer:'no-referrer' as const};
async function load(token:string){try{return await getPublicQuote(token);}catch(e){if(e instanceof CommerceError&&e.status===404)notFound();throw e;}}
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;const q=await load(token);return <main className="commerce"><QuoteClient q={q} token={token}/></main>;}
