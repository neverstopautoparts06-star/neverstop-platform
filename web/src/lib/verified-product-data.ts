/**
 * Optional details from verified product documents, keyed by NEVERSTOP part number.
 * This is deliberately empty: never infer measurements, engines or packaging from OEM.
 * Each future entry must cite the actual document in `source`.
 * Replace this adapter with database fields if the schema gains these fields later.
 */
export type VerifiedProductData = {
  source:string;
  unit?:string;
  piecesPerBox?:number;
  packagingImages?:{id:string;url:string;altText:string|null}[];
  enginesByVariant?:Record<string,string>;
  technical?:{
    extendedLengthMm?:number;
    compressedLengthMm?:number;
    strokeMm?:number;
    pistonRodDiameterMm?:number;
    bodyDiameterMm?:number;
    upperMount?:string;
    lowerMount?:string;
    shockType?:string;
  };
};
export const verifiedProductData:Record<string,VerifiedProductData>={};
