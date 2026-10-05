import {api,body,requireAdmin,sameOrigin} from '@/lib/commerce/security';
import {createQuote,expireQuotes} from '@/lib/commerce/service';
import {prisma} from '@/lib/prisma';
import {QuoteStatus,CustomerType} from '@/generated/prisma/client';
export async function GET(request:Request){return api(async()=>{await requireAdmin();await expireQuotes();const p=new URL(request.url).searchParams;const status=p.get('status'),type=p.get('customerType');return prisma.quote.findMany({where:{...(status&&Object.values(QuoteStatus).includes(status as QuoteStatus)?{status:status as QuoteStatus}:{}),...(type&&Object.values(CustomerType).includes(type as CustomerType)?{customerType:type as CustomerType}:{})},orderBy:{createdAt:'desc'},take:200,select:{id:true,quoteNumber:true,customerName:true,customerType:true,vehicleBrand:true,vehicleModel:true,totalAmount:true,status:true,createdAt:true,validUntil:true}});});}
export async function POST(request:Request){return api(async()=>{sameOrigin(request);await requireAdmin();return createQuote(await body(request));});}
