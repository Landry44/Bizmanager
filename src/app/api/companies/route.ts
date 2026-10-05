import {NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/src/lib/db";
import {getCurrentUser} from "@/src/lib/auth";
const S=z.object({name:z.string().min(2),phone:z.string().optional(),email:z.string().email().optional()});
export async function GET(){const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Non authentifié"},{status:401});const ms=await db.membership.findMany({where:{userId:u.id},include:{company:true}});return NextResponse.json(ms.map(m=>({...m.company,role:m.role})));}
export async function POST(r:Request){const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Non authentifié"},{status:401});const x=S.safeParse(await r.json());if(!x.success)return NextResponse.json({error:"Données invalides"},{status:400});const c=await db.company.create({data:x.data});await db.membership.create({data:{userId:u.id,companyId:c.id,role:"OWNER"}});return NextResponse.json(c,{status:201});}
