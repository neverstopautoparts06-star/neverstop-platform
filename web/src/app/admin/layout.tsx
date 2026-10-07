import Link from 'next/link';
import {isAdmin} from '@/lib/commerce/security';
import LogoutButton from '@/components/commerce/logout-button';
import '../commerce.css';
export const metadata={title:'NEVERSTOP · Quản lý báo giá',robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default async function Layout({children}:{children:React.ReactNode}){const authenticated=await isAdmin();return <div className="commerce"><header><Link href="/vi">NEVERSTOP FACTORY-DIRECT</Link><Link href="/admin/quotes">Báo giá</Link>{authenticated&&<LogoutButton/>}</header>{children}</div>;}
