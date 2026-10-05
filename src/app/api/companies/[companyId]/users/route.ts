import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {db} from "@/src/lib/db";
import {requireMembership} from "@/src/lib/auth";
const S=z.object({email:z.string().email(),firstName:z.string().min(1),lastName:z.string().min(1),password:z.string().min(12),role:z.enum(["ADMIN","MANAGER","CASHIER","STOCK_MANAGER","ACCOUNTANT","VIEWER"])});
export async function GET(_:Request,c:{params:Promise<{companyId:string}>}){const{companyId}=await c.params;await requireMembership(companyId,["OWNER","ADMIN"]);const ms=await db.membership.findMany({where:{companyId},include:{user:true}});return NextResponse.json(ms.map(m=>({id:m.user.id,email:m.user.email,firstName:m.user.firstName,lastName:m.user.lastName,role:m.role})));}
export async function POST(r:Request,c:{params:Promise<{companyId:string}>}){const{companyId}=await c.params;await requireMembership(companyId,["OWNER","ADMIN"]);const x=S.safeParse(await r.json());if(!x.success)return NextResponse.json({error:"Données invalides"},{status:400});let u=await db.user.findUnique({where:{email:x.data.email.toLowerCase()}});if(!u)u=await db.user.create({data:{email:x.data.email.toLowerCase(),firstName:x.data.firstName,lastName:x.data.lastName,passwordHash:await bcrypt.hash(x.data.password,12)}});await db.membership.upsert({where:{userId_companyId:{userId:u.id,companyId}},update:{role:x.data.role},create:{userId:u.id,companyId,role:x.data.role}});return NextResponse.json({ok:true});}
