import {getCurrentUser} from "@/src/lib/auth";
import {redirect} from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage(){
  const user=await getCurrentUser();
  if(!user)redirect("/login");
  const first=user.memberships[0];
  if(!first) return <main style={{padding:32}}><h1>Aucune entreprise</h1><p>Votre compte n'est rattaché à aucune entreprise.</p></main>;
  return <DashboardClient user={{firstName:user.firstName,lastName:user.lastName,email:user.email}} memberships={user.memberships.map(m=>({id:m.company.id,name:m.company.name,currency:m.company.currency,role:m.role}))}/>;
}
