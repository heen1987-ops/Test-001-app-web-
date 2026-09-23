"use client";
import { signOut } from "next-auth/react";

/** 로그아웃 시 세션 쿠키를 지우고 로그인 화면으로 보낸다. 화면에 남아있던 데이터는
 * 리다이렉트로 컴포넌트가 통째로 사라지면서 함께 정리된다(별도 캐시를 두지 않았음). */
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
      className="text-xs font-medium text-zinc-400 hover:text-rose-500"
    >
      로그아웃
    </button>
  );
}
