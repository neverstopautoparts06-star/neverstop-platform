import {guardAdmin} from '@/lib/commerce/admin';
import QuoteEditor from '@/components/commerce/editor';
export default async function Page({searchParams}:{searchParams:Promise<{customerType?:string}>}){await guardAdmin();const p=await searchParams;return <QuoteEditor customerType={p.customerType==='B2B'?'B2B':'B2C'}/>;}
