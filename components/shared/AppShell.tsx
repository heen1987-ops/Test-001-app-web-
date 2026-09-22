"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAppData } from "@/lib/client/store";
import { NAV_ITEMS } from "@/lib/nav";
import { ConflictDialog } from "./ConflictDialog";
import { ProjectCreateWizard } from "./ProjectCreateWizard";
import { SaveStatusBadge } from "./SaveStatusBadge";
import { ThemeToggle } from "./ThemeToggle";

function ProjectSwitcher() {
  const { projects, selectedId, selectProject } = useAppData();
  if (!projects || projects.length <= 1) return null;
  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => selectProject(e.target.value)}
      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { projects } = useAppData();

  if (projects === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">불러오는 중…</div>;
  }

  if (projects.length === 0) {
    return <ProjectCreateWizard />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* 데스크톱 상단 바 */}
      <header className="sticky top-0 z-40 hidden border-b border-zinc-200 bg-white/80 backdrop-blur md:block dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">MOVE OS</span>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ProjectSwitcher />
            <SaveStatusBadge />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 모바일 상단 바 */}
      <header className="sticky top-0 z-40 flex flex-col gap-0.5 border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">MOVE OS</span>
          <div className="flex items-center gap-2">
            <ProjectSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <SaveStatusBadge />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-10">{children}</main>

      {/* 모바일 하단 탭 */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <ConflictDialog />
    </div>
  );
}
