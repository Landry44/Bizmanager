import {NextResponse} from "next/server";
import {z} from "zod";
import bcrypt from "bcryptjs";
import {db} from "@/src/lib/db";
import {createSession} from "@/src/lib/auth";

const schema=z.object({
  firstName:z.string().trim().min(2).max(60),
  lastName:z.string().trim().min(2).max(60),
  email:z.string().trim().email().max(160),
  password:z.string().min(8).max(100),
  companyName:z.string().trim().min(2).max(120),
});

export async function POST(request:Request){
  try{
    const parsed=schema.safeParse(await request.json());
    if(!parsed.success)return NextResponse.json({error:"Vérifiez les informations saisies. Le mot de passe doit contenir au moins 8 caractères."},{status:400});
    const {firstName,lastName,email,password,companyName}=parsed.data;
    const existing=await db.user.findUnique({where:{email:email.toLowerCase()}});
    if(existing)return NextResponse.json({error:"Cette adresse e-mail est déjà utilisée."},{status:409});
    const passwordHash=await bcrypt.hash(password,12);
    const result=await db.$transaction(async tx=>{
      const user=await tx.user.create({data:{email:email.toLowerCase(),firstName,lastName,passwordHash,isActive:true}});
      const company=await tx.company.create({data:{name:companyName,currency:"XAF",timezone:"Africa/Libreville"}});
      await tx.membership.create({data:{userId:user.id,companyId:company.id,role:"OWNER"}});
      await tx.subscription.create({data:{companyId:company.id,trialEndsAt:new Date(Date.now()+14*86400000),maxUsers:2,maxProducts:100}});
      return {user,company};
    });
    await createSession(result.user.id);
    return NextResponse.json({ok:true,company:{id:result.company.id,name:result.company.name},user:{id:result.user.id,email:result.user.email,role:"OWNER"}},{status:201});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"Impossible de créer le compte pour le moment."},{status:500});
  }
}
