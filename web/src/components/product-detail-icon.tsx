import type {ReactNode} from 'react';
export type ProductIconName='brand'|'model'|'generation'|'year'|'axle'|'position'|'productType'|'unit'|'stock'|'quote'|'fitment'|'zoom'|'copy'|'check'|'close';
const car=<><path d="m4 10 2-5h12l2 5M3 10h18v8H3zM6 18v2m12-2v2M6 13h2m8 0h2"/><path d="M7 5v5m10-5v5"/></>;
const shock=<><path d="M10 3h4v4h-4zM9 7h6v11H9zM10 18h4v3h-4M12 1v2M12 21v2"/><path d="M8 10h8M8 13h8"/></>;
const shapes:Record<ProductIconName,ReactNode>={
  brand:<><path d="m12 2 8 4v8c0 4-8 8-8 8s-8-4-8-8V6z"/><path d="m8 11 2-3h4l2 3v5H8zM8 11h8M10 14h4"/></>,
  model:car,
  generation:<><path d="m3 9 3-5h12l3 5v9H3zM3 10h18M6 18v3m12-3v3"/><path d="M7 14h2m6 0h2M12 10v8"/></>,
  year:<><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 2v6m8-6v6M4 10h16M8 14h2m4 0h2M8 17h2"/></>,
  axle:<><path d="M6 6v12M18 6v12M6 12h12M3 7h6v10H3zM15 7h6v10h-6z"/></>,
  position:shock,productType:shock,
  unit:<><path d="m3 7 9-4 9 4v13H3zM3 7l9 4 9-4M12 11v9M8 5l9 4"/></>,
  stock:<><path d="M3 8h18v13H3zM5 8V4h14v4M9 12l2 2 4-4M7 18h10"/></>,
  quote:<><path d="M9 4H5v18h14V4h-4M9 2h6v5H9zM8 11h8M8 15h4"/><path d="m13 18 4-4m-4 0h4v4"/></>,
  fitment:car,
  zoom:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/></>,
  copy:<><rect x="8" y="7" width="12" height="15" rx="1"/><path d="M16 7V2H3v15h5"/></>,
  check:<path d="m4 12 5 5L20 6"/>,
  close:<path d="m5 5 14 14M5 19 19 5"/>,
};
export default function ProductDetailIcon({name,size=20}:{name:ProductIconName;size?:number}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}
