import crypto from "node:crypto";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {db} from "@/src/lib/db";
import {getCurrentUser} from "@/src/lib/auth";
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");
export async function GET(){
  try{const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Non authentifié."},{status:401});const sessions=await db.session.findMany({where:{userId:u.id,status:"ACTIVE",expiresAt:{gt:new Date()}},orderBy:{lastSeenAt:"desc"},select:{id:true,createdAt:true,lastSeenAt:true,expiresAt:true}});return NextResponse.json({sessions});}
  catch{return NextResponse.json({error:"Impossible de charger les sessions."},{status:503});}
}
export async function DELETE(){
  try{const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Non authentifié."},{status:401});const raw=(await cookies()).get("biz_session")?.value;if(!raw)return NextResponse.json({ok:true});await db.session.updateMany({where:{userId:u.id,tokenHash:{not:hash(raw)}},data:{status:"REVOKED"}});return NextResponse.json({ok:true});}
  catch{return NextResponse.json({error:"Impossible de fermer les autres sessions."},{status:503});}
}
