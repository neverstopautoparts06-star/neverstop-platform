import {z} from 'zod';
import {locales} from './i18n';
import {customerKinds,publicSourcePath} from './contact-intake';

const text=(max:number)=>z.string().trim().max(max).default('');
export const contactLeadSchema=z.object({
 requestId:z.uuid(),customerKind:z.enum(customerKinds),channel:z.enum(['ZALO','WHATSAPP','EMAIL','CONTACT']),locale:z.enum(locales),
 stage:z.enum(['SELECTED','PREPARED']),sourcePath:text(500).transform(publicSourcePath),website:z.literal('').default(''),
 details:z.object({region:text(160),vehicle:text(200),year:text(4).refine(value=>!value||/^(19|20)\d{2}$/.test(value)),product:text(1000),name:text(100),phone:text(25).refine(value=>!value||/^\+?\d{7,15}$/.test(value.replace(/[ ()-]/g,''))),quantity:text(4).refine(value=>!value||/^[1-9]\d{0,3}$/.test(value))}),
 context:z.object({vehicleBrand:text(150),vehicleModel:text(200),vehicleYear:text(100),vehicleCode:text(150),partNumber:text(150),oeNumber:text(600),productName:text(200)}),
});
export type ContactLeadInput=z.infer<typeof contactLeadSchema>;
export type ContactNotification={status:'NOT_CONFIGURED'|'API_ACCEPTED'|'FAILED';attemptedAt?:string;messageId?:string};
export type StoredContactLead=ContactLeadInput&{notification:ContactNotification};
const prefix='NEVERSTOP_CONTACT_V1\n';
export function contactReference(requestId:string){return 'CTC-'+requestId.toUpperCase();}
export function encodeContactLead(input:ContactLeadInput,notification:ContactNotification){return prefix+JSON.stringify({...input,notification});}
export function decodeContactLead(notes:string|null):StoredContactLead|null{
 if(!notes?.startsWith(prefix))return null;
 try{const raw=JSON.parse(notes.slice(prefix.length)),input=contactLeadSchema.parse(raw);const notification=z.object({status:z.enum(['NOT_CONFIGURED','API_ACCEPTED','FAILED']),attemptedAt:z.string().optional(),messageId:z.string().optional()}).parse(raw.notification);return {...input,notification};}catch{return null;}
}
