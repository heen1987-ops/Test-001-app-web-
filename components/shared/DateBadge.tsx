import { formatDateDisplay, resolveDate, type DateAnchors } from "@/lib/dates";
import type { TaskDateSpec } from "@/lib/types";

export function DateBadge({ spec, anchors, className }: { spec: TaskDateSpec; anchors: DateAnchors; className?: string }) {
  const resolved = resolveDate(spec, anchors);

  if (spec.type === "unscheduled" || !resolved) {
    return <span className={`text-subtle ${className ?? ""}`}>날짜 미정</span>;
  }

  const anchorLabel =
    spec.type === "relative"
      ? ` (${spec.anchor === "moveDate" ? "이사일" : "잔금일"} ${spec.offsetDays >= 0 ? "+" : ""}${spec.offsetDays}일)`
      : "";

  return (
    <span className={`font-mono ${className ?? ""}`}>
      {formatDateDisplay(resolved)}
      {anchorLabel && <span className="text-xs text-subtle">{anchorLabel}</span>}
    </span>
  );
}
