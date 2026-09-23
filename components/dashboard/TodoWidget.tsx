"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAppData } from "@/lib/client/store";
import { compareISODate, diffDays, resolveDate, today } from "@/lib/dates";
import { updateTask } from "@/lib/services/tasks";
import type { Task } from "@/lib/types";

interface Row {
  task: Task;
  due: string;
  urgency: "overdue" | "today" | "upcoming";
}

const MAX_ROWS = 8;

function dDayLabel(due: string, todayStr: string): string {
  const diff = diffDays(todayStr, due);
  if (diff === 0) return "오늘";
  if (diff > 0) return `D-${diff}`;
  return `D+${-diff}`;
}

const BADGE_STYLES: Record<Row["urgency"], string> = {
  overdue: "bg-negative-bg text-negative-ink border-negative/20",
  today: "bg-accent-light text-accent-ink border-accent/20",
  upcoming: "bg-surface-2 text-muted border-border",
};

/**
 * 마감이 지났거나 임박한 할 일을 한데 모아 체크 가능한 목록으로 보여준다 — 홈 화면 전용.
 * 상세 편집은 일정·할일 화면에서 하고, 여기서는 빠른 완료 체크만 지원한다.
 */
export function TodoWidget() {
  const { data, mutate } = useAppData();

  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    const todayStr = today();
    const result: Row[] = [];
    for (const t of data.tasks) {
      if (t.status === "done" || t.status === "cancelled") continue;
      const due = resolveDate(t.dueDate, data.project);
      if (!due) continue;
      const cmp = compareISODate(due, todayStr);
      const urgency: Row["urgency"] = cmp < 0 ? "overdue" : cmp === 0 ? "today" : "upcoming";
      result.push({ task: t, due, urgency });
    }
    result.sort((a, b) => compareISODate(a.due, b.due));
    return result;
  }, [data]);

  if (!data) return null;

  const visible = rows.slice(0, MAX_ROWS);
  const todayStr = today();

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight text-foreground">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-white">
            ✓
          </span>
          TO-DO 리스트
        </h2>
        <Link href="/schedule" className="text-xs font-semibold text-accent-ink hover:underline">
          전체 보기 →
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-subtle">마감이 다가온 할 일이 없습니다.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-0.5 border-t border-border pt-2">
          {visible.map(({ task, due, urgency }) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 text-sm transition-colors hover:bg-surface-2"
            >
              <input
                type="checkbox"
                checked={false}
                onChange={() => mutate((d) => updateTask(d, task.id, { status: "done" }))}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span
                className={`inline-flex min-w-11 flex-none justify-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${BADGE_STYLES[urgency]}`}
              >
                {dDayLabel(due, todayStr)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{task.title}</span>
              {task.category && <span className="flex-none text-xs text-subtle">{task.category}</span>}
            </label>
          ))}
        </div>
      )}

      {rows.length > MAX_ROWS && (
        <p className="mt-2 text-center text-xs text-subtle">+{rows.length - MAX_ROWS}개 더 있음</p>
      )}
    </div>
  );
}
