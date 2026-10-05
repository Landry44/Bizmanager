import {NextResponse} from "next/server";
import {getCurrentUser} from "@/src/lib/auth";
export async function GET(){const u=await getCurrentUser();if(!u)return NextResponse.json({user:null},{status:401});return NextResponse.json({user:{id:u.id,email:u.email,firstName:u.firstName,lastName:u.lastName,companies:u.memberships.map(m=>({id:m.company.id,name:m.company.name,role:m.role}))}});}
