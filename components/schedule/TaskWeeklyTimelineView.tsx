"use client";
import { useState } from "react";
import { useAppData } from "@/lib/client/store";
import { addDays, formatDateDisplay, resolveDate, today } from "@/lib/dates";
import type { Task } from "@/lib/types";
import { TaskListItem } from "./TaskListItem";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function TaskWeeklyTimelineView({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  const { data } = useAppData();
  const [weekOffset, setWeekOffset] = useState(0);
  if (!data) return null;

  const start = addDays(today(), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const byDay = new Map<string, Task[]>(days.map((d) => [d, []]));
  for (const t of tasks) {
    const due = resolveDate(t.dueDate, data.project);
    if (due && byDay.has(due)) byDay.get(due)!.push(t);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-2"
        >
          ← 이전 주
        </button>
        <span className="font-mono text-sm text-muted">
          {formatDateDisplay(days[0])} – {formatDateDisplay(days[6])}
        </span>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-2"
        >
          다음 주 →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map((day, i) => {
          const dayTasks = byDay.get(day) ?? [];
          const isToday = day === today();
          return (
            <div key={day} className="flex flex-col gap-2">
              <p className={`text-xs font-bold ${isToday ? "text-accent-ink" : "text-subtle"}`}>
                {WEEKDAY_LABELS[new Date(`${day}T12:00:00Z`).getUTCDay()]} · {formatDateDisplay(day).slice(5)}
                {i === 0 && weekOffset === 0 && " (오늘)"}
              </p>
              <div className="flex flex-col gap-1.5">
                {dayTasks.length === 0 ? (
                  <div className="h-1 rounded bg-surface-2" />
                ) : (
                  dayTasks.map((t) => <TaskListItem key={t.id} task={t} onOpen={onOpen} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
