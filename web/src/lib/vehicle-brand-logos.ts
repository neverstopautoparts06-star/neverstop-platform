import assets from './vehicle-brand-logo-assets.json';
// Visual coverage roadmap only; actual selectable IDs always come from VehicleBrand.
export type BrandPresentation={logoUrl?:string;logoAlt?:string;displayOrder:number;isFeatured:boolean};
export const brandPriority=['Toyota','Honda','Hyundai','Kia','Mitsubishi','Nissan','Mazda','Suzuki','Ford','Chevrolet','BMW','Mercedes-Benz','Audi','Volkswagen','Lexus','Subaru','Isuzu','Peugeot','Volvo','Land Rover','Tesla','BYD','Geely','Chery','Haval','MG','VinFast','Lynk & Co','Omoda','Jaecoo','GAC'];
export const brandKey=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]/g,'');
const files:Record<string,string|null>=assets;
export const brandLogoMapping:Record<string,BrandPresentation>=Object.fromEntries(brandPriority.map((name,i)=>[brandKey(name),{logoUrl:files[name]??undefined,logoAlt:`${name} logo`,displayOrder:i,isFeatured:i<27}]));
export const plannedBrandPreview=brandPriority;
