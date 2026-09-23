"use client";
import { ThemeProvider } from "next-themes";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppDataProvider } from "@/lib/client/store";
import { GithubDirectAdapter } from "@/lib/storage/githubDirectAdapter";
import { loadGithubConfig, type GithubConfig } from "@/lib/storage/githubConfig";
import { AppShell } from "./AppShell";
import { GithubConnectGate } from "./GithubConnectGate";

// undefined = 아직 localStorage를 확인하기 전(서버 렌더와 항상 같은 화면을 보여주기 위해
// 첫 렌더에는 무조건 "불러오는 중"만 보여주고, 마운트 이후에만 실제 연결 여부로 분기한다).
export function Providers({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GithubConfig | null | undefined>(undefined);

  useEffect(() => {
    // localStorage는 서버에 없어서 렌더 중엔 읽을 수 없다 — 마운트 후 한 번만 읽어온다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(loadGithubConfig());
  }, []);

  const adapter = useMemo(() => (config ? new GithubDirectAdapter(config) : null), [config]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {config === undefined ? (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">불러오는 중…</div>
      ) : !config || !adapter ? (
        <GithubConnectGate onConnected={() => setConfig(loadGithubConfig())} />
      ) : (
        <AppDataProvider key={config.token} adapter={adapter}>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      )}
    </ThemeProvider>
  );
}
