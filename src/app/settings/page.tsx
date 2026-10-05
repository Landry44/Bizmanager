import {getCurrentUser} from "@/src/lib/auth";
import SettingsClient from "./SettingsClient";
export default async function SettingsPage(){
 const user=await getCurrentUser();
 if(!user)return null;
 return <SettingsClient user={{email:user.email,firstName:user.firstName,lastName:user.lastName,companies:user.memberships.map(m=>({name:m.company.name,role:m.role}))}}/>;
}
