import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-config';
import { locales } from '@/lib/i18n';
import { prisma } from '@/lib/prisma';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const origin=siteOrigin();if(!origin)return[];const products=await prisma.product.findMany({where:{status:'ACTIVE'},select:{slug:true,updatedAt:true},take:10000});return locales.flatMap(locale=>[...['','/products','/contact','/privacy'].map(path=>({url:origin+'/'+locale+path})),...products.map(p=>({url:origin+'/'+locale+'/products/'+p.slug,lastModified:p.updatedAt}))]);}
