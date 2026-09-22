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
        <button type="button" onClick={goPrev} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          ← 이전 달
        </button>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {year}년 {month}월
        </span>
        <button type="button" onClick={goNext} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          다음 달 →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 text-xs dark:border-zinc-800 dark:bg-zinc-800">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-zinc-50 py-1 text-center font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            {label}
          </div>
        ))}
        {grid.map((day) => {
          const dayTasks = byDay.get(day) ?? [];
          const inMonth = day.startsWith(monthPrefix);
          const isToday = day === today();
          return (
            <div
              key={day}
              className={`min-h-20 bg-white p-1 dark:bg-zinc-950 ${inMonth ? "" : "opacity-40"}`}
            >
              <p className={`mb-1 text-right ${isToday ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`}>
                {Number(day.slice(8, 10))}
              </p>
              <div className="flex flex-col gap-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onOpen(t)}
                    className={`truncate rounded px-1 py-0.5 text-left text-[11px] ${
                      t.status === "done"
                        ? "bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-900"
                        : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <p className="text-[11px] text-zinc-400">+{dayTasks.length - 3}개 더</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
