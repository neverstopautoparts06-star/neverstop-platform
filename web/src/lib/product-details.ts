import { cache } from 'react';
import { prisma } from './prisma';
export const getProduct = cache(async (slug: string) => prisma.product.findFirst({
  where: { slug, status: 'ACTIVE' },
  select: {
    id:true, slug:true, partNumber:true, nameVi:true, nameEn:true, nameZh:true,
    descriptionVi:true, descriptionEn:true, descriptionZh:true, axle:true, side:true,
    category:{select:{nameVi:true,nameEn:true,nameZh:true}},seoDescription:true,
    netWeightKg:true, grossWeightKg:true, piecesPerCarton:true, cartonLengthCm:true, cartonWidthCm:true, cartonHeightCm:true,
    images:{orderBy:[{isPrimary:'desc'},{sortOrder:'asc'}],select:{id:true,url:true,altText:true}},
    oeNumbers:{select:{oeNumber:{select:{number:true}}}},
    fitments:{where:{vehicleVariant:{isActive:true,vehicleModel:{isActive:true,brand:{isActive:true}}}},orderBy:{id:'asc'},select:{id:true,vehicleVariant:{select:{id:true,modelCode:true,yearFrom:true,yearTo:true,vehicleModel:{select:{name:true,brand:{select:{name:true}}}}}}}},
    // Quantities stay server-side. The page receives only a stock status label.
    inventory:{where:{location:{isActive:true,code:'STORE-HANOI',type:'STORE'}},select:{quantity:true,reservedQuantity:true}},
  },
}));

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

export async function getRelatedProducts(product:ProductDetail) {
  const variants=product.fitments.map(f=>f.vehicleVariant.id);
  if(!variants.length)return [];
  // A shared active variant is an existing fitment relationship, not a guessed platform.
  return prisma.product.findMany({
    where:{id:{not:product.id},status:'ACTIVE',fitments:{some:{vehicleVariantId:{in:variants},vehicleVariant:{isActive:true,vehicleModel:{isActive:true,brand:{isActive:true}}}}}},
    take:4,orderBy:[{axle:'asc'},{side:'asc'},{partNumber:'asc'}],
    select:{id:true,slug:true,partNumber:true,nameVi:true,nameEn:true,nameZh:true,axle:true,side:true,images:{take:1,orderBy:[{isPrimary:'desc'},{sortOrder:'asc'}],select:{id:true,url:true,altText:true}}},
  });
}
