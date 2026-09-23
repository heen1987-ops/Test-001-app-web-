"use client";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useMemo, type ReactNode } from "react";
import { AppDataProvider } from "@/lib/client/store";
import { RemoteAdapter } from "@/lib/storage/remoteAdapter";
import { AppShell } from "./AppShell";

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
