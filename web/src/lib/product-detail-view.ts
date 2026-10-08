import {contentLocale,localized,type Locale} from './i18n';
import {productDetailCopy} from './product-detail-copy';
import type {ProductDetail} from './product-details';
import {verifiedProductData,type VerifiedProductData} from './verified-product-data';

export type DetailRow={label:string;value:string};
const placeholder=/^(?:-|—|n\/a|na|unknown)$/i;
export function filledRows(values:[string,string|number|null|undefined][]):DetailRow[]{
  return values.flatMap(([label,value])=>{
    const text=value===null||value===undefined?'':String(value).trim();
    return text&&!placeholder.test(text)?[{label,value:text}]:[];
  });
}
export function positiveValue(value:unknown,unit=''){
  if(value===null||value===undefined||String(value).trim()==='')return null;
  const number=Number(String(value));
  return Number.isFinite(number)&&number>0?`${number}${unit?` ${unit}`:''}`:null;
}
function unique(values:(string|null|undefined)[]){return [...new Set(values.map(v=>v?.trim()).filter((v):v is string=>!!v&&!placeholder.test(v)))];}
function cleanText(value:string|null|undefined){const text=value?.trim();return text&&!placeholder.test(text)?text:null;}
export function verifiedSupplement(value:VerifiedProductData|undefined){return value?.source.trim()?value:undefined;}
export function hasHanoiStock(inventory:{quantity:number;reservedQuantity:number}[],localPreview=false){
  return !localPreview&&inventory.some(row=>row.quantity>Math.max(0,row.reservedQuantity));
}
export function productDetailView(p:ProductDetail,locale:Locale,localPreview=false){
  const t=productDetailCopy(locale),extra=verifiedSupplement(verifiedProductData[p.partNumber]);
  const language=contentLocale(locale),name=localized(p,locale);
  const description=(language==='zh'?p.descriptionZh:language==='en'?p.descriptionEn:p.descriptionVi)||p.descriptionVi;
  const category=p.category?localized(p.category,locale):null;
  const axle=p.axle?{FRONT:t.front,REAR:t.rear,OTHER:t.other}[p.axle]:null;
  const side=p.side&&p.side!=='NA'?{LEFT:t.left,RIGHT:t.right,BOTH:t.both}[p.side]:null;
  const position=[axle,side].filter(Boolean).join(' · ')||null;
  const fitments=p.fitments.map(f=>{
    const v=f.vehicleVariant;
    return {id:f.id,variantId:v.id,brand:v.vehicleModel.brand.name,model:v.vehicleModel.name,generation:cleanText(v.modelCode),
      year:v.yearTo===null?`${v.yearFrom} ${t.onward}`:`${v.yearFrom}–${v.yearTo}`,
      engine:cleanText(extra?.enginesByVariant?.[v.id])};
  });
  const brands=unique(fitments.map(f=>f.brand)).join(' / ')||null;
  const models=unique(fitments.map(f=>f.model)).join(' / ')||null;
  const generations=unique(fitments.map(f=>f.generation)).join(' / ')||null;
  const years=unique(fitments.map(f=>f.year)).join(' / ')||null;
  const vehicleTitles=unique(fitments.map(f=>[f.brand,f.model,f.generation].filter(Boolean).join(' ')));
  const oem=unique(p.oeNumbers.map(o=>o.oeNumber.number));
  const inStock=hasHanoiStock(p.inventory,localPreview);
  const core=filledRows([[t.brand,brands],[t.model,models],[t.generation,generations],[t.year,years],[t.position,position],[t.productType,category],[t.unit,extra?.unit],[t.axle,axle],[t.stock,inStock?t.hanoiStock:t.confirmStock]]);
  const information=filledRows([[t.partNumber,p.partNumber],[t.referenceOem,oem.join(' / ')],[t.productName,name],[t.productType,category],[t.brand,brands],[t.model,models],[t.generation,generations],[t.year,years],[t.axle,axle],[t.position,position],[t.unit,extra?.unit]]);
  const tech=extra?.technical;
  const technical=filledRows([
    [t.extendedLength,positiveValue(tech?.extendedLengthMm,'mm')],[t.compressedLength,positiveValue(tech?.compressedLengthMm,'mm')],
    [t.stroke,positiveValue(tech?.strokeMm,'mm')],[t.pistonRodDiameter,positiveValue(tech?.pistonRodDiameterMm,'mm')],
    [t.bodyDiameter,positiveValue(tech?.bodyDiameterMm,'mm')],[t.upperMount,tech?.upperMount],[t.lowerMount,tech?.lowerMount],
    [t.shockType,tech?.shockType],[t.netWeight,positiveValue(p.netWeightKg,'kg')],
  ]);
  const dimensions=[p.cartonLengthCm,p.cartonWidthCm,p.cartonHeightCm].map(v=>positiveValue(v));
  const packaging=filledRows([[t.perCarton,positiveValue(p.piecesPerCarton)],[t.piecesPerBox,positiveValue(extra?.piecesPerBox)],
    [t.cartonSize,dimensions.every(Boolean)?`${dimensions.join(' × ')} cm`:null],[t.netWeight,positiveValue(p.netWeightKg,'kg')],[t.grossWeight,positiveValue(p.grossWeightKg,'kg')]]);
  return {name,description,category,axle,position,fitments,brands,models,generations,years,vehicleTitles,oem,inStock,core,information,technical,packaging,
    packagingImages:extra?.packagingImages?.length?extra.packagingImages:p.images.slice(0,1),
    context:{productName:name,partNumber:p.partNumber,oeNumber:oem.join(', '),vehicleBrand:brands??undefined,vehicleModel:models??undefined,vehicleYear:years??undefined,vehicleCode:generations??undefined,url:`/${locale}/products/${encodeURIComponent(p.slug)}`},
  };
}
