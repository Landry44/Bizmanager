import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/src/lib/db";
import {requireMembership} from "@/src/lib/auth";


export async function GET(_:NextRequest,{params}:{params:Promise<{companyId:string}>}){
  const {companyId}=await params;
  await requireMembership(companyId);
  const products=await db.product.findMany({where:{companyId},orderBy:{name:"asc"}});
  return NextResponse.json(products);
}

export async function POST(req:NextRequest,{params}:{params:Promise<{companyId:string}>}){
  const {companyId}=await params;
  await requireMembership(companyId,["OWNER","ADMIN","MANAGER","STOCK_MANAGER"]);
  const parsed=productSchema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
  try{
    const product=await db.product.create({data:{companyId,...parsed.data}});
    return NextResponse.json(product,{status:201});
  }catch(e:any){
    if(e?.code==="P2002")return NextResponse.json({error:"Ce SKU existe déjà dans cette entreprise."},{status:409});
    throw e;
  }
}
