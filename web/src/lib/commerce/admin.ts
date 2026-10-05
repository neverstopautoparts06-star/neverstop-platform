import {redirect} from 'next/navigation';
import {isAdmin} from './security';
export async function guardAdmin(){if(!await isAdmin())redirect('/admin/login');}
