import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
const COOKIE = "biz_session";
const hash = (v:string) => crypto.createHash("sha256").update(v).digest("hex");

export async function createSession(userId:string) {
  const raw = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now()+7*86400000);
  await db.session.create({data:{tokenHash:hash(raw),userId,expiresAt}});
  (await cookies()).set(COOKIE,raw,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
}
export async function destroySession() {
  const raw=(await cookies()).get(COOKIE)?.value;
  if(raw) await db.session.updateMany({where:{tokenHash:hash(raw)},data:{status:"REVOKED"}});
  (await cookies()).delete(COOKIE);
}
export async function getCurrentUser() {
  const raw=(await cookies()).get(COOKIE)?.value;
  if(!raw)return null;
  const s=await db.session.findUnique({where:{tokenHash:hash(raw)},include:{user:{include:{memberships:{include:{company:true}}}}}});
  if(!s || s.status!=="ACTIVE" || s.expiresAt<=new Date() || !s.user.isActive)return null;
  await db.session.update({where:{id:s.id},data:{lastSeenAt:new Date()}});
  return s.user;
}
export async function requireMembership(companyId:string,roles?:string[]) {
  const u=await getCurrentUser(); if(!u)throw new Error("UNAUTHENTICATED");
  const m=u.memberships.find(x=>x.companyId===companyId);
  if(!m || (roles && !roles.includes(m.role)))throw new Error("FORBIDDEN");
  return {user:u,membership:m};
}
