import Link from "next/link";
import {getCurrentUser} from "@/src/lib/auth";

export default async function Page(){
  let connected=false;
  try { connected=!!(await getCurrentUser()); } catch {}
  return <main style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e3a8a 55%,#2563eb)",color:"white",fontFamily:"Arial,sans-serif"}}>
    <nav style={{maxWidth:1180,margin:"0 auto",padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:25,fontWeight:800}}>♥ BizManager</div><Link href={connected?"/dashboard":"/register"} style={{color:"white",textDecoration:"none",background:"white",padding:"11px 18px",borderRadius:10,fontWeight:700}}>{connected?"Ouvrir mon espace":"Créer un compte"}</Link>
    </nav>
    <section style={{maxWidth:1180,margin:"0 auto",padding:"80px 28px 100px",display:"grid",gridTemplateColumns:"1.2fr .8fr",gap:50,alignItems:"center"}}>
      <div><div style={{display:"inline-block",padding:"7px 12px",borderRadius:999,background:"#ffffff18",fontSize:13}}>Gestion d'entreprise · XAF · Cloud</div><h1 style={{fontSize:"clamp(42px,6vw,72px)",lineHeight:1.02,margin:"22px 0"}}>Gérez votre entreprise depuis un seul endroit.</h1><p style={{fontSize:20,lineHeight:1.6,color:"#dbeafe",maxWidth:650}}>Ventes, stock, achats, clients, fournisseurs, trésorerie, documents et rapports. Une plateforme pensée pour les entreprises modernes.</p><div style={{display:"flex",gap:14,marginTop:30}}><Link href="/register" style={{background:"white",color:"#111827",padding:"14px 22px",borderRadius:10,textDecoration:"none",fontWeight:800}}>Créer mon espace</Link><a href="#features" style={{color:"white",padding:"14px 22px",textDecoration:"none"}}>Découvrir les fonctions →</a></div></div>
      <div style={{background:"#ffffff12",border:"1px solid #ffffff22",backdropFilter:"blur(8px)",borderRadius:24,padding:26,boxShadow:"0 25px 80px #0005"}}><div style={{fontSize:13,color:"#bfdbfe"}}>TABLEAU DE BORD</div><div style={{fontSize:32,fontWeight:800,margin:"10px 0 22px"}}>Votre entreprise</div>{[["Chiffre d'affaires","2 480 000 FCFA"],["Trésorerie","1 735 000 FCFA"],["Stock","248 produits"],["Factures","32 documents"]].map(([a,b])=><div key={a} style={{display:"flex",justifyContent:"space-between",padding:"16px 0",borderTop:"1px solid #ffffff18"}}><span style={{color:"#cbd5e1"}}>{a}</span><strong>{b}</strong></div>)}</div>
    </section>
    <section id="features" style={{background:"#f8fafc",color:"#111827",padding:"65px 28px"}}><div style={{maxWidth:1180,margin:"auto"}}><h2 style={{fontSize:34}}>Tout ce qu'il faut pour piloter l'activité</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16,marginTop:25}}>{["Ventes & caisse","Stock & achats","Clients & fournisseurs","Factures & reçus","Trésorerie & paie","Rapports & statistiques"].map(x=><div key={x} style={{background:"white",padding:22,borderRadius:14,boxShadow:"0 3px 14px #0000000a"}}><strong>{x}</strong><p style={{color:"#64748b",lineHeight:1.5}}>Données centralisées et isolées par entreprise.</p></div>)}</div></div></section>
  </main>
}
