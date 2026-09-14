import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "fc_session";

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

async function readRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await readRole(req);

  const needsAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const needsField = pathname.startsWith("/field");

  if (!needsAdmin && !needsField) return NextResponse.next();
  if (!role) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.redirect(new URL(role === "FIELD_WORKER" ? "/field" : "/admin/login", req.url));
  }
  if (needsField && !["ADMIN", "STAFF", "FIELD_WORKER"].includes(role)) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-user-role", role);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/field/:path*"],
};
