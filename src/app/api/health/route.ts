import {NextResponse} from "next/server";
import {db} from "@/src/lib/db";
export async function GET(){try{await db.$queryRaw`SELECT 1`;return NextResponse.json({ok:true,database:true})}catch{return NextResponse.json({ok:false,database:false,error:"Base de données indisponible"},{status:503})}}
