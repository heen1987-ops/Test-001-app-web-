import { formatDateDisplay, resolveDate, type DateAnchors } from "@/lib/dates";
import type { TaskDateSpec } from "@/lib/types";

export function DateBadge({ spec, anchors, className }: { spec: TaskDateSpec; anchors: DateAnchors; className?: string }) {
  const resolved = resolveDate(spec, anchors);

  if (spec.type === "unscheduled" || !resolved) {
    return <span className={`text-zinc-400 dark:text-zinc-500 ${className ?? ""}`}>날짜 미정</span>;
  }

  const anchorLabel =
    spec.type === "relative"
      ? ` (${spec.anchor === "moveDate" ? "이사일" : "잔금일"} ${spec.offsetDays >= 0 ? "+" : ""}${spec.offsetDays}일)`
      : "";

  return (
    <span className={className}>
      {formatDateDisplay(resolved)}
      {anchorLabel && <span className="text-zinc-400 dark:text-zinc-500 text-xs">{anchorLabel}</span>}
    </span>
  );
}
