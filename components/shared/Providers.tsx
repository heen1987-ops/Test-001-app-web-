"use client";
import { ThemeProvider } from "next-themes";
import { useMemo, type ReactNode } from "react";
import { AppDataProvider } from "@/lib/client/store";
import { LocalAdapter } from "@/lib/storage/localAdapter";
import { AppShell } from "./AppShell";

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
