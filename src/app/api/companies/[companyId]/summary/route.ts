import {NextResponse} from "next/server";
import {db} from "@/src/lib/db";
import {requireMembership} from "@/src/lib/auth";

export async function GET(_:Request,{params}:{params:Promise<{companyId:string}>}){
  const {companyId}=await params;
  await requireMembership(companyId);
  const [products,customers,suppliers,sales,expenses,employees,payrolls,treasury,lowStock]=await Promise.all([
    db.product.count({where:{companyId}}),
    db.customer.count({where:{companyId}}),
    db.supplier.count({where:{companyId}}),
    db.sale.aggregate({where:{companyId},_sum:{total:true}}),
    db.expense.aggregate({where:{companyId},_sum:{amount:true}}),
    db.employee.count({where:{companyId,isActive:true}}),
    db.payroll.aggregate({where:{companyId,status:"PAID"},_sum:{net:true}}),
    db.treasuryTransaction.groupBy({by:["type"],where:{companyId},_sum:{amount:true}}),
    db.product.count({where:{companyId,stock:{lte:0}}}),
  ]);
  const cashIn=treasury.find(x=>x.type==="IN")?._sum.amount??0; const cashOut=treasury.find(x=>x.type==="OUT")?._sum.amount??0; return NextResponse.json({products,customers,suppliers,employees,revenue:sales._sum.total??0,expenses:expenses._sum.amount??0,salaries:payrolls._sum.net??0,treasuryIn:cashIn,treasuryOut:cashOut,lowStock});
}
