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
  loading: "bg-zinc-300 animate-pulse",
  saving: "bg-amber-400 animate-pulse",
  saved: "bg-emerald-500",
  error: "bg-rose-500",
  conflict: "bg-rose-500",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function SaveStatusBadge() {
  const { saveStatus, lastSavedAt } = useAppData();

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[saveStatus]}`} />
      <span>{LABELS[saveStatus]}</span>
      {saveStatus === "saved" && lastSavedAt && (
        <span className="text-zinc-400 dark:text-zinc-600">· {formatTime(lastSavedAt)}</span>
      )}
    </div>
  );
}
