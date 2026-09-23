"use client";
import { useAppData } from "@/lib/client/store";

const LABELS: Record<string, string> = {
  loading: "불러오는 중…",
  saving: "저장 중…",
  saved: "저장 완료",
  error: "저장 실패",
  conflict: "충돌 발생",
};

const DOT_STYLES: Record<string, string> = {
  loading: "bg-subtle animate-pulse",
  saving: "bg-warning animate-pulse",
  saved: "bg-positive",
  error: "bg-negative",
  conflict: "bg-negative",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function SaveStatusBadge() {
  const { saveStatus, lastSavedAt } = useAppData();

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] font-semibold text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[saveStatus]}`} />
      <span>{LABELS[saveStatus]}</span>
      {saveStatus === "saved" && lastSavedAt && <span className="text-subtle">· {formatTime(lastSavedAt)}</span>}
    </div>
  );
}
