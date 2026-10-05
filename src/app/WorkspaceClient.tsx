"use client";
import {useEffect,useMemo,useState} from "react";

type Company={id:string,name:string,currency?:string,role:string};
type Product={id:string,sku:string,name:string,purchasePrice:number,salePrice:number,stock:number,minStock:number};
type Row=Record<string,any>;
type ModuleName="products"|"customers"|"suppliers"|"sales"|"purchases";
type CartItem={productId:string;quantity:number;unitPrice:number};

const money=(n:number)=>new Intl.NumberFormat("fr-FR").format(Number(n||0))+" FCFA";
const config:Record<ModuleName,{title:string;desc:string;endpoint:string;fields:Array<[string,string,string]>}>={
 products:{title:"Produits & stock",desc:"Catalogue, prix, quantités disponibles et alertes de réapprovisionnement.",endpoint:"products",fields:[["sku","Référence / SKU","text"],["name","Nom du produit","text"],["purchasePrice","Prix d’achat (FCFA)","number"],["salePrice","Prix de vente (FCFA)","number"],["stock","Stock initial","number"],["minStock","Seuil d’alerte","number"]]},
 customers:{title:"Clients",desc:"Répertoire clients pour vos ventes et suivis de crédit.",endpoint:"customers",fields:[["name","Nom du client","text"],["phone","Téléphone","tel"]]},
 suppliers:{title:"Fournisseurs",desc:"Répertoire des fournisseurs pour les achats et le réapprovisionnement.",endpoint:"suppliers",fields:[["name","Nom du fournisseur","text"],["phone","Téléphone","tel"]]},
 sales:{title:"Ventes & caisse",desc:"Ajoutez plusieurs produits au panier, encaissez et mettez le stock à jour.",endpoint:"sales",fields:[]},
 purchases:{title:"Achats",desc:"Ajoutez plusieurs produits et réapprovisionnez automatiquement le stock.",endpoint:"purchases",fields:[]}
};

export default function WorkspaceClient({module,companies}:{module:ModuleName;companies:Company[]}){
 const c=config[module];
 const [companyId,setCompanyId]=useState(companies[0]?.id||""); const [rows,setRows]=useState<Row[]>([]); const [products,setProducts]=useState<Product[]>([]); const [contacts,setContacts]=useState<Row[]>([]);
 const [busy,setBusy]=useState(false); const [msg,setMsg]=useState(""); const [form,setForm]=useState<Record<string,string>>({}); const [productId,setProductId]=useState(""); const [quantity,setQuantity]=useState("1"); const [contactId,setContactId]=useState(""); const [payment,setPayment]=useState("CASH");
 const [cart,setCart]=useState<CartItem[]>([]);
 const [productSearch,setProductSearch]=useState("");
 const selected=companies.find(x=>x.id===companyId);
 const filteredProducts=useMemo(()=>products.filter(p=>`${p.name} ${p.sku}`.toLowerCase().includes(productSearch.toLowerCase())),[products,productSearch]);
 const cartTotal=useMemo(()=>cart.reduce((s,i)=>s+i.quantity*i.unitPrice,0),[cart]);
 async function load(){
  if(!companyId)return; setBusy(true); setMsg("");
  try{
   const r=await fetch(`/api/companies/${companyId}/${c.endpoint}`,{credentials:"include"}); const d=await r.json(); if(!r.ok)throw new Error(d.error||"Chargement impossible"); setRows(Array.isArray(d)?d:[]);
   if(module==="sales"||module==="purchases"){
    const [pr,cr]=await Promise.all([fetch(`/api/companies/${companyId}/products`,{credentials:"include"}),fetch(`/api/companies/${companyId}/${module==="sales"?"customers":"suppliers"}`,{credentials:"include"})]);
    const pd=await pr.json(),cd=await cr.json(); if(!pr.ok)throw new Error(pd.error||"Produits indisponibles"); setProducts(Array.isArray(pd)?pd:[]); setContacts(Array.isArray(cd)?cd:[]);
    if(!productId&&pd[0])setProductId(pd[0].id);
   }
  }catch(e:any){setMsg(e?.message||"Erreur de chargement");}finally{setBusy(false)}
 }
 useEffect(()=>{setCart([]);load();},[companyId,module]);
 function addToCart(){const p=products.find(x=>x.id===productId); const q=Number(quantity); if(!p||!Number.isInteger(q)||q<1){setMsg("Choisissez un produit et une quantité valide.");return} const existing=cart.find(x=>x.productId===p.id); const nextQty=(existing?.quantity||0)+q; if(module==="sales"&&nextQty>p.stock){setMsg(`Stock insuffisant pour ${p.name}. Disponible : ${p.stock}.`);return} setCart(existing?cart.map(x=>x.productId===p.id?{...x,quantity:nextQty}:x):[...cart,{productId:p.id,quantity:q,unitPrice:module==="sales"?p.salePrice:p.purchasePrice}]);setMsg("");}
 function removeFromCart(id:string){setCart(cart.filter(x=>x.productId!==id));}
 function changeQty(id:string,delta:number){setCart(cart.map(i=>{if(i.productId!==id)return i;const p=products.find(x=>x.id===id);const q=Math.max(1,i.quantity+delta);if(module==="sales"&&p&&q>p.stock){setMsg(`Stock insuffisant pour ${p.name}. Disponible : ${p.stock}.`);return i;}return {...i,quantity:q};}));}
 async function submit(e:React.FormEvent){e.preventDefault();setMsg("");setBusy(true);try{
  let body:any;
  if(module==="sales"||module==="purchases"){
   if(!cart.length)throw new Error("Le panier est vide."); body={payment,...(contactId?(module==="sales"?{customerId:contactId}:{supplierId:contactId}):{}),items:cart.map(i=>module==="purchases"?{productId:i.productId,quantity:i.quantity,unitPrice:i.unitPrice}:{productId:i.productId,quantity:i.quantity})};
  } else body=Object.fromEntries(c.fields.map(f=>[f[0],form[f[0]]??(f[2]==="number"?"0":"")]));
  const r=await fetch(`/api/companies/${companyId}/${c.endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(body)}); const d=await r.json(); if(!r.ok)throw new Error(typeof d.error==="string"?d.error:"Opération refusée."); setForm({});setCart([]);setMsg("Opération enregistrée avec succès.");await load();
 }catch(e:any){setMsg(e?.message||"Une erreur est survenue");}finally{setBusy(false)}}
 const tableHead=module==="products"?["SKU","Produit","Stock","Prix vente"]:module==="customers"||module==="suppliers"?["Nom","Téléphone","Solde"]:["Date","Référence","Total","Paiement"];
 return <main style={{maxWidth:1280,margin:"0 auto",padding:"28px 20px 60px"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:24}}><div><div style={{fontSize:12,color:"#2563eb",fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>Espace de gestion</div><h1 style={{fontSize:32,margin:"7px 0"}}>{c.title}</h1><p style={{color:"#64748b",margin:0}}>{c.desc}</p></div><label style={{fontSize:13,color:"#64748b"}}>Entreprise<select value={companyId} onChange={e=>setCompanyId(e.target.value)} style={selectStyle}>{companies.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div>
  {msg&&<div role="alert" style={{padding:13,marginBottom:16,borderRadius:10,background:msg.includes("succès")?"#dcfce7":"#fff7ed",color:msg.includes("succès")?"#166534":"#9a3412"}}>{msg}</div>}
  <div style={{display:"grid",gridTemplateColumns:"minmax(280px,360px) minmax(0,1fr)",gap:18,alignItems:"start"}}>
   <form onSubmit={submit} style={card}>
    <h2 style={{marginTop:0,fontSize:19}}>{module==="sales"?"Nouvelle vente":module==="purchases"?"Nouvel achat":module==="products"?"Ajouter un produit":module==="customers"?"Ajouter un client":"Ajouter un fournisseur"}</h2>
    {c.fields.map(f=><label key={f[0]} style={label}>{f[1]}<input required={f[0]==="sku"||f[0]==="name"} type={f[2]} min={f[2]==="number"?0:undefined} value={form[f[0]]??""} onChange={e=>setForm({...form,[f[0]]:e.target.value})} style={input}/></label>)}
    {(module==="sales"||module==="purchases")&&<>
      <label style={label}>Rechercher un produit<input value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder="Nom ou SKU…" style={input}/></label>
      <label style={label}>Produit<select value={productId} onChange={e=>setProductId(e.target.value)} style={selectStyle}>{filteredProducts.map(p=><option key={p.id} value={p.id}>{p.name} — stock {p.stock}</option>)}</select></label>
      <label style={label}>Quantité<input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} style={input}/></label>
      <button type="button" onClick={addToCart} style={secondary}>+ Ajouter au panier</button>
      <label style={label}>{module==="sales"?"Client":"Fournisseur"}<select value={contactId} onChange={e=>setContactId(e.target.value)} style={selectStyle}><option value="">Aucun</option>{contacts.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label style={label}>Mode de paiement<select value={payment} onChange={e=>setPayment(e.target.value)} style={selectStyle}>{[["CASH","Espèces"],["AIRTEL_MONEY","Airtel Money"],["MOOV_MONEY","Moov Money"],["BANK","Banque"],["CREDIT","Crédit"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      {cart.length>0&&<div style={{background:"#f8fafc",borderRadius:10,padding:12,margin:"4px 0 14px"}}><strong>Panier</strong>{cart.map(i=>{const p=products.find(x=>x.id===i.productId);return <div key={i.productId} style={{display:"flex",justifyContent:"space-between",gap:8,padding:"9px 0",borderBottom:"1px solid #e2e8f0",fontSize:13}}><span style={{display:"flex",alignItems:"center",gap:8}}><span>{p?.name}</span><button type="button" onClick={()=>changeQty(i.productId,-1)} style={qtybtn}>−</button><strong>{i.quantity}</strong><button type="button" onClick={()=>changeQty(i.productId,1)} style={qtybtn}>+</button></span><span>{money(i.quantity*i.unitPrice)} <button type="button" onClick={()=>removeFromCart(i.productId)} style={xbtn}>×</button></span></div>})}<div style={{display:"flex",justifyContent:"space-between",fontWeight:800,paddingTop:10}}><span>Total</span><span>{money(cartTotal)}</span></div></div>}
    </>}
    <button disabled={busy} style={primary}>{busy?"Traitement…":module==="sales"?"Enregistrer la vente":module==="purchases"?"Enregistrer l’achat":"Ajouter"}</button>
   </form>
   <section style={card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><div><h2 style={{margin:"0 0 5px",fontSize:19}}>Historique</h2><p style={{margin:0,color:"#64748b",fontSize:13}}>{rows.length} élément(s) affiché(s)</p></div><button onClick={load} disabled={busy} style={secondary}>Actualiser</button></div>
    <div style={{overflowX:"auto",marginTop:16}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{tableHead.map(x=><th key={x} style={th}>{x}</th>)}</tr></thead><tbody>{rows.map((x,i)=><tr key={x.id||i} style={{borderTop:"1px solid #e2e8f0"}}>{module==="products"?<><td style={cell}>{x.sku}</td><td style={cell}>{x.name}</td><td style={cell}><span style={{color:x.stock<=x.minStock?"#dc2626":"#0f172a",fontWeight:700}}>{x.stock}</span></td><td style={cell}>{money(x.salePrice)}</td></>:module==="customers"||module==="suppliers"?<><td style={cell}>{x.name}</td><td style={cell}>{x.phone||"—"}</td><td style={cell}>{money(x.balance)}</td></>:<><td style={cell}>{x.createdAt?new Date(x.createdAt).toLocaleDateString("fr-FR"):"—"}</td><td style={cell}>{String(x.id||"").slice(-8).toUpperCase()}</td><td style={cell}>{money(x.total)}</td><td style={cell}>{({CASH:"Espèces",AIRTEL_MONEY:"Airtel Money",MOOV_MONEY:"Moov Money",BANK:"Banque",CREDIT:"Crédit"} as Record<string,string>)[x.payment]||x.payment}</td></>}</tr>)}</tbody></table></div>{!rows.length&&<div style={{padding:"35px 10px",textAlign:"center",color:"#64748b"}}>Aucune donnée pour le moment.</div>}
   </section>
  </div><p style={{fontSize:12,color:"#94a3b8",marginTop:18}}>Entreprise active : {selected?.name||"—"} · Rôle : {selected?.role||"—"}{module==="sales"?` · Total du panier : ${money(cartTotal)}`:""}</p>
 </main>
}
const card:any={background:"white",padding:22,borderRadius:16,boxShadow:"0 5px 25px #0f172a0a"};
const label:any={display:"block",fontSize:13,fontWeight:600,marginBottom:13,color:"#334155"};
const input:any={display:"block",width:"100%",boxSizing:"border-box",padding:11,border:"1px solid #cbd5e1",borderRadius:9,marginTop:6};
const selectStyle:any={...input,background:"white"};
const primary:any={width:"100%",padding:13,border:0,borderRadius:10,background:"#2563eb",color:"white",fontWeight:800,cursor:"pointer"};
const secondary:any={padding:"10px 13px",border:"1px solid #cbd5e1",borderRadius:9,background:"white",fontWeight:700,cursor:"pointer"};
const xbtn:any={border:0,background:"transparent",color:"#dc2626",fontWeight:900,cursor:"pointer"};
const qtybtn:any={border:"1px solid #cbd5e1",background:"white",borderRadius:6,width:28,height:28,cursor:"pointer",fontWeight:800};
const th:any={textAlign:"left",padding:11,color:"#64748b",background:"#f8fafc"}; const cell:any={padding:12,verticalAlign:"top"};
