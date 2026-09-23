"use client";
import { ThemeProvider } from "next-themes";
import { useMemo, type ReactNode } from "react";
import { AppDataProvider } from "@/lib/client/store";
import { LocalAdapter } from "@/lib/storage/localAdapter";
import { AppShell } from "./AppShell";

// 어댑터는 클라이언트 컴포넌트 안에서 만든다 — 서버 컴포넌트(app/layout.tsx)에서 만들어
// prop으로 넘기면 클래스 인스턴스가 서버/클라이언트 경계를 건너야 해서 직렬화 문제가 생긴다.
export function Providers({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => new LocalAdapter(), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppDataProvider adapter={adapter}>
        <AppShell>{children}</AppShell>
      </AppDataProvider>
    </ThemeProvider>
  );
}
