import {guardAdmin} from '@/lib/commerce/admin';
import QuoteEditor from '@/components/commerce/editor';
import {prisma} from '@/lib/prisma';
import {decodeContactLead} from '@/lib/contact-leads';
import {customerKindLabel,salesCustomerType} from '@/lib/contact-intake';
export default async function Page({searchParams}:{searchParams:Promise<{customerType?:string;inquiry?:string}>}){
 await guardAdmin();const p=await searchParams;
 const inquiry=p.inquiry?.startsWith('CTC-')&&p.inquiry.length<100?await prisma.inquiry.findUnique({where:{inquiryNumber:p.inquiry},select:{notes:true,inquiryNumber:true}}):null;
 const lead=inquiry?decodeContactLead(inquiry.notes):null;
 const prefill=lead?{customerType:salesCustomerType(lead.customerKind),customerName:lead.details.name,phone:lead.details.phone,city:lead.details.region,vehicleBrand:lead.context.vehicleBrand,vehicleModel:lead.details.vehicle,vehicleYear:lead.details.year,vehicleCode:lead.context.vehicleCode,internalNote:[inquiry!.inquiryNumber,customerKindLabel(lead.customerKind,'vi'),lead.details.product,lead.context.partNumber,lead.details.quantity?`Số lượng yêu cầu: ${lead.details.quantity}`:''].filter(Boolean).join('\n')}:undefined;
 return <QuoteEditor customerType={p.customerType==='B2B'?'B2B':'B2C'} prefill={prefill}/>;
}
