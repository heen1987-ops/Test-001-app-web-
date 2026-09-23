import type { TaskStatus } from "@/lib/types";

const LABELS: Record<TaskStatus, string> = {
  todo: "할 일",
  in_progress: "진행중",
  done: "완료",
  cancelled: "취소",
};

const STYLES: Record<TaskStatus, string> = {
  todo: "bg-surface-2 text-muted border-border",
  in_progress: "bg-accent-light text-accent-ink border-accent/20",
  done: "bg-positive-bg text-positive-ink border-positive/20",
  cancelled: "bg-surface-2 text-subtle line-through border-border",
};

export function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
