import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
export function middleware(req:NextRequest){
 const path=req.nextUrl.pathname;
 if(path.startsWith('/api/')||path==='/'||path==='/login'||path.startsWith('/_next/'))return NextResponse.next();
 const session=req.cookies.get('biz_session')?.value;
 if(!session)return NextResponse.redirect(new URL('/login',req.url));
 return NextResponse.next();
}
export const config={matcher:['/dashboard/:path*','/products/:path*','/sales/:path*','/customers/:path*','/purchases/:path*','/suppliers/:path*','/finance/:path*','/documents/:path*','/reports/:path*','/settings/:path*']};
