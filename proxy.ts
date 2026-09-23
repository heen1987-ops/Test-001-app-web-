import { NextResponse } from "next/server";
import { auth } from "@/auth";

// 로그인 안 된 요청은 화면·API 가리지 않고 전부 GitHub 로그인 화면으로 보낸다.
// /api/projects/* 라우트도 각자 requireAuthorizedUser()로 다시 검사한다(여기서 걸러지더라도
// 화면 우회에만 기대지 않기 위한 이중 방어).
export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth")) return;

  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
