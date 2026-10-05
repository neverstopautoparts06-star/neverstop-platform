import { cache } from 'react';
import { prisma } from './prisma';
export const getProduct = cache(async (slug: string) => prisma.product.findFirst({
  where: { slug, status: 'ACTIVE' },
  select: {
    id:true, slug:true, partNumber:true, nameVi:true, nameEn:true, nameZh:true,
    descriptionVi:true, descriptionEn:true, descriptionZh:true, axle:true, side:true,
    netWeightKg:true, grossWeightKg:true, piecesPerCarton:true, cartonLengthCm:true, cartonWidthCm:true, cartonHeightCm:true,
    images:{orderBy:[{isPrimary:'desc'},{sortOrder:'asc'}],select:{id:true,url:true,altText:true}},
    oeNumbers:{select:{oeNumber:{select:{number:true}}}},
    fitments:{where:{vehicleVariant:{isActive:true,vehicleModel:{isActive:true,brand:{isActive:true}}}},select:{id:true,vehicleVariant:{select:{modelCode:true,yearFrom:true,yearTo:true,vehicleModel:{select:{name:true,brand:{select:{name:true}}}}}}}},
    inventory:{where:{location:{isActive:true}},select:{quantity:true,reservedQuantity:true}},
  },
}));
