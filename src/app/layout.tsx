import React from "react";
import AppNav from "./AppNav";
export default function Layout({children}:{children:React.ReactNode}) {
  return <html lang="fr"><body style={{margin:0,fontFamily:"Inter,Arial,sans-serif",background:"#f4f7fb",color:"#0f172a"}}><AppNav/>{children}</body></html>;
}
