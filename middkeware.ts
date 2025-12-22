// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인 페이지/정적 리소스는 통과
  if (pathname.startsWith("/login") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Firebase Auth는 클라이언트 기반이라, 여기서는 "간단 게이트"만 둠:
  // 로그인 성공 시 localStorage가 아니라 cookie로도 가능하지만,
  // MVP에서는 클라이언트 가드로 충분히 시작 가능.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};
