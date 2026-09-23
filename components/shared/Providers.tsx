"use client";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useMemo, type ReactNode } from "react";
import { AppDataProvider } from "@/lib/client/store";
import { RemoteAdapter } from "@/lib/storage/remoteAdapter";
import { AppShell } from "./AppShell";

// 어댑터는 클라이언트 컴포넌트 안에서 만든다 — 서버 컴포넌트(app/layout.tsx)에서 만들어
// prop으로 넘기면 클래스 인스턴스가 서버/클라이언트 경계를 건너야 해서 직렬화 문제가 생긴다.
// 미들웨어가 로그인 안 된 요청을 전부 걸러내므로, 이 아래로 내려오는 시점엔 이미 인증된 상태다.
export function Providers({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => new RemoteAdapter(), []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppDataProvider adapter={adapter}>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
