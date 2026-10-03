export type VehicleVariant = {
  id: string; modelCode: string | null; yearFrom: number; yearTo: number | null; displayName: string | null;
};
export type VehicleBrand = {
  id: string; name: string; models: { id: string; name: string; variants: VehicleVariant[] }[];
};
export type CatalogProduct = {
  id: string; partNumber: string; nameVi: string; axle: string | null; side: string | null;
  oeNumbers: string[]; fitments: string[]; availableQuantity: number;
};
export type ProductResults = { data: CatalogProduct[]; page: number; hasMore: boolean };
