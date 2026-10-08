'use client';
import {ZaloChatButton} from './zalo-contact';
import BrandIcon from './brand-icon';
import {overseasInquiry,whatsappChannel,type ProductContext} from '@/lib/zalo-config';
import {productDetailCopy} from '@/lib/product-detail-copy';
import ProductDetailIcon from './product-detail-icon';

export default function ProductInquiryActions({context,labels}:{context:ProductContext;labels:ReturnType<typeof productDetailCopy>}){
  const english=productDetailCopy('en');
  const quoteLabel=labels.requestQuote===english.requestQuote?labels.requestQuote:`${labels.requestQuote} / ${english.requestQuote}`;
  const fitmentLabel=labels.confirmFitment===english.confirmFitment?labels.confirmFitment:`${labels.confirmFitment} / ${english.confirmFitment}`;
  return <div className="pdp-inquiry">
    <div className="pdp-actions"><div className="pdp-request"><ZaloChatButton context={context} label={labels.requestQuote} buttonContent={<><ProductDetailIcon name="quote"/><span>{quoteLabel}</span><span aria-hidden="true">→</span></>}/></div><div className="pdp-confirm"><ZaloChatButton context={context} label={labels.confirmFitment} buttonContent={<><ProductDetailIcon name="fitment"/><span>{fitmentLabel}</span></>}/></div></div>
    <div className="pdp-channel-links"><div><ZaloChatButton context={context} label={labels.zaloContact} buttonContent={<><BrandIcon name="Zalo" size={34}/><span><strong>{labels.zaloContact}</strong><small lang="vi">{labels.zaloSub}</small></span></>}/></div><a href={whatsappChannel.url} target="_blank" rel="noopener noreferrer" onClick={event=>{const url=new URL(whatsappChannel.url);url.searchParams.set('text',overseasInquiry(context,location.href));event.currentTarget.href=url.href;}}><span className="pdp-whatsapp-icon"><BrandIcon name="WhatsApp" size={30}/></span><span><strong>{labels.whatsappContact}</strong><small lang="en">{labels.whatsappSub}</small></span></a></div>
  </div>;
}
