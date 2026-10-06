import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {db} from "@/src/lib/db";
import {createSession} from "@/src/lib/auth";
const S=z.object({email:z.string().email(),password:z.string().min(8)});
export async function POST(r:Request){try {const x=S.safeParse(await r.json());if(!x.success)return NextResponse.json({error:"Données invalides"},{status:400});const u=await db.user.findUnique({where:{email:x.data.email.toLowerCase()}});if(!u||!u.isActive||!(await bcrypt.compare(x.data.password,u.passwordHash)))return NextResponse.json({error:"Identifiants invalides"},{status:401});await createSession(u.id);return NextResponse.json({ok:true});} catch {return NextResponse.json({error:"Serveur indisponible ou base de données non configurée."},{status:503});}}
