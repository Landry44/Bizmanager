"use client";
import {useEffect,useState} from "react";

type Company={id:string,name:string,currency:string,role:string};
type Product={id:string,sku:string,name:string,purchasePrice:number,salePrice:number,stock:number,minStock:number};
const money=(n:number)=>new Intl.NumberFormat("fr-FR").format(n)+" FCFA";

export default function DashboardClient({user,memberships}:{user:{firstName:string,lastName:string,email:string},memberships:Company[]}){
 const [companyId,setCompanyId]=useState(memberships[0]?.id||"");
 const company=memberships.find(x=>x.id===companyId)||memberships[0];
 const [summary,setSummary]=useState<any>(null); const [products,setProducts]=useState<Product[]>([]); const [loading,setLoading]=useState(true);
 const [form,setForm]=useState({sku:"",name:"",purchasePrice:"",salePrice:"",stock:"",minStock:""});
 async function load(){if(!companyId)return;setLoading(true);const [a,b]=await Promise.all([fetch(`/api/companies/${companyId}/summary`),fetch(`/api/companies/${companyId}/products`)]);setSummary(await a.json());setProducts(await b.json());setLoading(false)}
 useEffect(()=>{load()},[companyId]);
 async function add(e:React.FormEvent){e.preventDefault();const r=await fetch(`/api/companies/${companyId}/products`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(!r.ok){const x=await r.json();alert(x.error?.formErrors?.join(" ")||x.error||"Erreur");return;}setForm({sku:"",name:"",purchasePrice:"",salePrice:"",stock:"",minStock:""});load()}
 return <main style={{minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,sans-serif"}}>
  <header style={{background:"#111827",color:"white",padding:"18px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong style={{fontSize:24}}>♥ BizManager</strong><div style={{fontSize:13,opacity:.75}}>Gestion d'entreprise — V4.1</div></div><div style={{display:"flex",gap:12,alignItems:"center"}}><a href="/finance" style={{color:"white",textDecoration:"none",background:"#374151",padding:"8px 12px",borderRadius:8}}>Finance</a><div>{user.firstName} {user.lastName}</div></div></header>
  <section style={{maxWidth:1180,margin:"0 auto",padding:28}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",marginBottom:24}}><div><h1 style={{margin:0}}>{company?.name}</h1><p style={{color:"#6b7280"}}>Rôle : {company?.role} · {company?.currency}</p></div><select value={companyId} onChange={e=>setCompanyId(e.target.value)} style={{padding:12,borderRadius:10,border:"1px solid #d1d5db"}}>{memberships.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>{[["Chiffre d'affaires",summary?money(summary.revenue):"…"],["Dépenses",summary?money(summary.expenses):"…"],["Produits",summary?.products??"…"],["Clients",summary?.customers??"…"],["Fournisseurs",summary?.suppliers??"…"],["Stock faible",summary?.lowStock??"…"]].map(([a,b])=><div key={a} style={{background:"white",padding:18,borderRadius:14,boxShadow:"0 2px 10px #0000000a"}}><div style={{color:"#6b7280",fontSize:13}}>{a}</div><div style={{fontSize:23,fontWeight:700,marginTop:8}}>{b}</div></div>)}</div>
   <div style={{display:"grid",gridTemplateColumns:"minmax(300px,1fr) minmax(420px,1.5fr)",gap:20,marginTop:24}}>
    <form onSubmit={add} style={{background:"white",padding:20,borderRadius:14}}><h2>Ajouter un produit</h2>{([['sku','SKU'],['name','Nom'],['purchasePrice','Prix achat'],['salePrice','Prix vente'],['stock','Stock initial'],['minStock','Seuil minimum']] as const).map(([k,l])=><label key={k} style={{display:"block",margin:"12px 0",fontSize:13}}>{l}<input required={k==='sku'||k==='name'} type={k.includes('Price')||k==='stock'||k==='minStock'?"number":"text"} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{display:"block",width:"100%",boxSizing:"border-box",padding:10,marginTop:5,border:"1px solid #d1d5db",borderRadius:8}}/></label>)}<button disabled={loading} style={{width:"100%",padding:12,border:0,borderRadius:9,background:"#111827",color:"white",fontWeight:700}}>Enregistrer</button></form>
    <div style={{background:"white",padding:20,borderRadius:14,overflow:"auto"}}><h2>Stock</h2><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th align="left">SKU</th><th align="left">Produit</th><th>Stock</th><th>Vente</th></tr></thead><tbody>{products.map(p=><tr key={p.id} style={{borderTop:"1px solid #eee"}}><td>{p.sku}</td><td>{p.name}</td><td align="center" style={{fontWeight:p.stock<=p.minStock?700:400}}>{p.stock}</td><td align="right">{money(p.salePrice)}</td></tr>)}</tbody></table>{!products.length&&<p style={{color:"#6b7280"}}>Aucun produit pour le moment.</p>}</div>
   </div>
  </section>
 </main>
}
