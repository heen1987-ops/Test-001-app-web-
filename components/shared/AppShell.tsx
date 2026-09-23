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

function BrandMark() {
  return <span className="text-lg font-extrabold tracking-tight text-accent-ink">MOVE OS</span>;
}

function ProjectSwitcher() {
  const { projects, selectedId, selectProject } = useAppData();
  if (!projects || projects.length <= 1) return null;
  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => selectProject(e.target.value)}
      className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground outline-none"
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
  const { projects, loadError } = useAppData();

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-negative">불러오지 못했습니다</p>
        <p className="max-w-xs text-sm text-muted">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-accent-ink"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (projects === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">불러오는 중…</div>;
  }

  if (projects.length === 0) {
    return <ProjectCreateWizard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 데스크톱 상단 바 */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <BrandMark />
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      active ? "bg-foreground text-background" : "text-muted hover:bg-surface-2 hover:text-foreground"
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
      <header className="sticky top-0 z-40 flex flex-col gap-0.5 border-b border-border bg-surface/90 px-4 py-2 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <ProjectSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <SaveStatusBadge />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-10">{children}</main>

      {/* 모바일 하단 탭 */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                active ? "text-accent-ink" : "text-subtle"
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
