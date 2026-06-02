import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getNextAuthSecret } from "@/lib/env-auth";
import { redirectToPath } from "@/lib/public-url";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/comercios/casales-falleros" || path.startsWith("/comercios/casales-falleros/")) {
    const target = request.nextUrl.clone();
    target.pathname = path.replace(/^\/comercios\/casales-falleros/, "/asociaciones/casales");
    return NextResponse.redirect(target, 301);
  }
  if (path === "/deportes" || path.startsWith("/deportes/")) {
    const target = request.nextUrl.clone();
    target.pathname = path.replace(/^\/deportes/, "/asociaciones/clubes-deportivos");
    return NextResponse.redirect(target, 301);
  }
  if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
    return new NextResponse("Falta NEXTAUTH_SECRET en el servidor", { status: 500 });
  }

  const token = await getToken({ req: request, secret: getNextAuthSecret() });

  if (path.startsWith("/admin")) {
    if (path === "/admin/login" || path.startsWith("/admin/login/")) {
      const res = NextResponse.next();
      res.headers.set("x-pathname", path);
      return res;
    }
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(
        redirectToPath(request, "/cuenta/iniciar-sesion", { callbackUrl: path }),
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", path);
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/deportes", "/deportes/:path*", "/comercios/casales-falleros", "/comercios/casales-falleros/:path*"],
};
