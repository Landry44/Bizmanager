import {redirect} from "next/navigation";
import {getCurrentUser} from "@/src/lib/auth";
import WorkspaceClient from "../WorkspaceClient";
export default async function ModulePage(){
 const user=await getCurrentUser();
 if(!user) redirect("/login");
 const companies=user.memberships.map(m=>({id:m.company.id,name:m.company.name,currency:m.company.currency,role:m.role}));
 if(!companies.length) return <main style={{padding:32}}>Votre compte n'est rattaché à aucune entreprise.</main>;
 return <WorkspaceClient module="purchases" companies={companies}/>;
}
