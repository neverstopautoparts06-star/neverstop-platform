'use client';
import {ZaloChatButton} from './zalo-contact';
import BrandIcon from './brand-icon';
import type {ProductContext} from '@/lib/zalo-config';
import ContactIntake from './contact-intake';
import {productDetailCopy} from '@/lib/product-detail-copy';
import ProductDetailIcon from './product-detail-icon';

export default function ProductInquiryActions({context,labels}:{context:ProductContext;labels:ReturnType<typeof productDetailCopy>}){
  const english=productDetailCopy('en');
  const quoteLabel=labels.requestQuote===english.requestQuote?labels.requestQuote:`${labels.requestQuote} / ${english.requestQuote}`;
  const fitmentLabel=labels.confirmFitment===english.confirmFitment?labels.confirmFitment:`${labels.confirmFitment} / ${english.confirmFitment}`;
  return <div className="pdp-inquiry">
    <div className="pdp-actions"><div className="pdp-request"><ZaloChatButton context={context} label={labels.requestQuote} buttonContent={<><ProductDetailIcon name="quote"/><span>{quoteLabel}</span><span aria-hidden="true">→</span></>}/></div><div className="pdp-confirm"><ZaloChatButton context={context} label={labels.confirmFitment} buttonContent={<><ProductDetailIcon name="fitment"/><span>{fitmentLabel}</span></>}/></div></div>
    <div className="pdp-channel-links"><div><ZaloChatButton channel="ZALO" context={context} label={labels.zaloContact} buttonContent={<><BrandIcon name="Zalo" size={34}/><span><strong>{labels.zaloContact}</strong><small lang="vi">{labels.zaloSub}</small></span></>}/></div><ContactIntake asLink channel="WHATSAPP" context={context}><span className="pdp-whatsapp-icon"><BrandIcon name="WhatsApp" size={30}/></span><span><strong>{labels.whatsappContact}</strong><small lang="en">{labels.whatsappSub}</small></span></ContactIntake></div>
  </div>;
}
