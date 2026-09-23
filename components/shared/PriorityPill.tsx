import type { TaskPriority } from "@/lib/types";

const LABELS: Record<TaskPriority, string> = { low: "낮음", medium: "보통", high: "높음" };
const STYLES: Record<TaskPriority, string> = {
  low: "bg-surface-2 text-muted border-border",
  medium: "bg-warning-bg text-warning-ink border-warning/20",
  high: "bg-negative-bg text-negative-ink border-negative/20",
};

export function PriorityPill({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${STYLES[priority]}`}
    >
      {LABELS[priority]}
    </span>
  );
}
