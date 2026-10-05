import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const shared=globalThis as unknown as {prisma?:PrismaClient};
let client:PrismaClient|undefined;
export const prisma=new Proxy({} as PrismaClient,{get(_target,key){
 const connectionString=process.env.DATABASE_URL;
 if(!connectionString)throw new Error("DATABASE_URL is not configured");
 client??=shared.prisma??new PrismaClient({adapter:new PrismaPg({connectionString,connectionTimeoutMillis:5000})});
 if(process.env.NODE_ENV!=="production")shared.prisma=client;
 const value=Reflect.get(client,key,client);return typeof value==="function"?value.bind(client):value;
}});
