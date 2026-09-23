"use client";
import { useState } from "react";
import { useAppData } from "@/lib/client/store";
import { getMonthGrid, resolveDate, today } from "@/lib/dates";
import type { Task } from "@/lib/types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function TaskMonthlyCalendarView({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  const { data } = useAppData();
  const now = new Date(`${today()}T12:00:00Z`);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  if (!data) return null;

  const grid = getMonthGrid(year, month);
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

  const byDay = new Map<string, Task[]>();
  for (const t of tasks) {
    const due = resolveDate(t.dueDate, data.project);
    if (!due) continue;
    if (!byDay.has(due)) byDay.set(due, []);
    byDay.get(due)!.push(t);
  }

  const goPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };
  const goNext = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={goPrev} className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-2">
          ← 이전 달
        </button>
        <span className="text-sm font-bold text-foreground">
          {year}년 {month}월
        </span>
        <button type="button" onClick={goNext} className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-2">
          다음 달 →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-surface-2 py-1 text-center font-semibold text-muted">
            {label}
          </div>
        ))}
        {grid.map((day) => {
          const dayTasks = byDay.get(day) ?? [];
          const inMonth = day.startsWith(monthPrefix);
          const isToday = day === today();
          return (
            <div key={day} className={`min-h-20 bg-surface p-1 ${inMonth ? "" : "opacity-40"}`}>
              <p className={`mb-1 text-right ${isToday ? "font-bold text-accent-ink" : "text-subtle"}`}>
                {Number(day.slice(8, 10))}
              </p>
              <div className="flex flex-col gap-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onOpen(t)}
                    className={`truncate rounded px-1 py-0.5 text-left text-[11px] ${
                      t.status === "done" ? "bg-surface-2 text-subtle line-through" : "bg-accent-light text-accent-ink"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <p className="text-[11px] text-subtle">+{dayTasks.length - 3}개 더</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
