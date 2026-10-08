/**
 * Temporary photography extracted from the user's approved PDP reference image.
 * These assets are presentation placeholders, never a source for specifications.
 * Real product images always take priority. No database records are changed.
 */
const root='/images/product-reference';
export type GalleryImage={id:string;url:string;altText:string|null;thumbnailUrl?:string};
export function referenceGallery(partNumber:string):GalleryImage[]{
  if(partNumber==='2025-D641-302F')return [
    {id:'reference-main',url:`${root}/front-main.webp`,thumbnailUrl:`${root}/front-thumbnail.webp`,altText:null},
    ...['rod-detail','mount-detail','label-detail','box-detail'].map(name=>({id:`reference-${name}`,url:`${root}/${name}.webp`,altText:null})),
  ];
  if(partNumber==='2025-C315-252R')return [{id:'reference-rear',url:`${root}/rear-main.webp`,altText:null}];
  return [];
}
export function referencePackaging(partNumber:string):GalleryImage[]{
  return partNumber==='2025-D641-302F'?['packaging-box','packaging-open'].map(name=>({id:`reference-${name}`,url:`${root}/${name}.webp`,altText:null})):[];
}
