import {NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/src/lib/db";
import {requireMembership} from "@/src/lib/auth";
import {getSubscription,PLAN_LIMITS} from "@/src/lib/subscription";

export async function GET(_request:Request,{params}:{params:Promise<{companyId:string}>}){
 try{const {companyId}=await params;await requireMembership(companyId);const sub=await getSubscription(companyId);return NextResponse.json({subscription:sub,plans:PLAN_LIMITS});}
 catch(e:any){return NextResponse.json({error:e?.message||"Accès refusé"},{status:403});}
}
const schema=z.object({plan:z.enum(["FREE","BUSINESS","ENTERPRISE"]) });
export async function POST(request:Request,{params}:{params:Promise<{companyId:string}>}){
 try{
  const {companyId}=await params;const me=await requireMembership(companyId,["OWNER","ADMIN"]);const body=schema.safeParse(await request.json());if(!body.success)return NextResponse.json({error:"Plan invalide."},{status:400});
  const plan=body.data.plan;const limits=PLAN_LIMITS[plan];
  const now=new Date();const currentPeriodEnd=new Date(now);currentPeriodEnd.setMonth(currentPeriodEnd.getMonth()+1);
  const sub=await db.subscription.upsert({where:{companyId},create:{companyId,plan,status:plan==='FREE'?'TRIALING':'ACTIVE',trialEndsAt:plan==='FREE'?new Date(now.getTime()+14*86400000):now,currentPeriodEnd:plan==='FREE'?null:currentPeriodEnd,maxUsers:limits.maxUsers,maxProducts:limits.maxProducts},update:{plan,status:plan==='FREE'?'TRIALING':'ACTIVE',currentPeriodEnd:plan==='FREE'?null:currentPeriodEnd,maxUsers:limits.maxUsers,maxProducts:limits.maxProducts}});
  await db.auditLog.create({data:{action:"SUBSCRIPTION_CHANGE",entity:"Subscription",entityId:sub.id,actorId:me.user.id,companyId,metadata:{plan}}});
  return NextResponse.json({ok:true,subscription:sub});
 }catch(e:any){return NextResponse.json({error:e?.message||"Impossible de modifier l'abonnement."},{status:403});}
}
