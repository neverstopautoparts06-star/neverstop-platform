import { z } from 'zod';
export const money = z.number().int().min(0).max(99_999_999_999);
const text = z.string().trim().max(500);
export const quoteInput = z.object({
 customerType:z.enum(['B2B','B2C']), customerName:text.min(1), phone:z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/), zalo:text.optional(),city:text.optional(),address:text.optional(),
 vehicleBrand:text.optional(),vehicleModel:text.optional(),vehicleYear:text.optional(),vehicleCode:text.optional(),
 shippingFee:money,discount:money,validUntil:z.string().datetime({offset:true}),
 warrantyTermsSnapshot:z.string().trim().min(1).max(12000),customerNote:z.string().max(3000).optional(),internalNote:z.string().max(3000).optional(),
 codEligible:z.boolean(),onlinePaymentEnabled:z.boolean(),
 items:z.array(z.object({productId:z.string().min(1).max(100),quantity:z.number().int().min(1).max(10000),unitPrice:money})).min(1).max(100)
});
export const shippingInput=z.object({name:text.min(1),phone:z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/),city:text.min(1),address:text.min(8),note:z.string().max(3000).optional()});
export class CommerceError extends Error {constructor(public status:number,message:string){super(message);}}
export function totals(items:{quantity:number;unitPrice:number}[],shippingFee:number,discount:number){
 const subtotal=items.reduce((n,i)=>n+i.quantity*i.unitPrice,0);const totalAmount=subtotal+shippingFee-discount;
 if(!Number.isSafeInteger(subtotal)||!Number.isSafeInteger(totalAmount)||subtotal>99_999_999_999||totalAmount<=0||totalAmount>99_999_999_999||discount>subtotal)throw new CommerceError(400,'Số tiền hoặc giảm giá không hợp lệ.');
 return {subtotal,totalAmount};
}
