import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-config';
export default function robots():MetadataRoute.Robots {const origin=siteOrigin();return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin/','/q/','/payment/','/order/']},...(origin?{sitemap:origin+'/sitemap.xml'}:{})};}
