import {config} from 'dotenv';
import {defineConfig} from 'prisma/config';
config({path:'.env.local',quiet:true});config({quiet:true});
export default defineConfig({schema:'prisma/schema.prisma',datasource:{url:process.env.DATABASE_URL},migrations:{path:'prisma/migrations',seed:'tsx prisma/seed.ts'}});
