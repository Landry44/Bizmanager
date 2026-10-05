import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {db} from "@/src/lib/db";
import {getCurrentUser} from "@/src/lib/auth";

const Schema=z.object({currentPassword:z.string().min(1),newPassword:z.string().min(8).max(128)});
export async function POST(req:Request){
  try{
    const user=await getCurrentUser();
    if(!user)return NextResponse.json({error:"Non authentifié."},{status:401});
    const parsed=Schema.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:"Le nouveau mot de passe doit contenir au moins 8 caractères."},{status:400});
    const {currentPassword,newPassword}=parsed.data;
    if(!(await bcrypt.compare(currentPassword,user.passwordHash)))return NextResponse.json({error:"Mot de passe actuel incorrect."},{status:400});
    if(currentPassword===newPassword)return NextResponse.json({error:"Le nouveau mot de passe doit être différent."},{status:400});
    const passwordHash=await bcrypt.hash(newPassword,12);
    await db.user.update({where:{id:user.id},data:{passwordHash}});
    await db.auditLog.create({data:{action:"PASSWORD_CHANGE",entity:"User",entityId:user.id,actorId:user.id}});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"Impossible de modifier le mot de passe."},{status:503});}
}
