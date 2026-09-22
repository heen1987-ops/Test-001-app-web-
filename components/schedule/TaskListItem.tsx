"use client";
import { DateBadge } from "@/components/shared/DateBadge";
import { PriorityPill } from "@/components/shared/PriorityPill";
import { StatusPill } from "@/components/shared/StatusPill";
import { useAppData } from "@/lib/client/store";
import { hasDateConflict, isBlocked } from "@/lib/dates";
import { updateTask } from "@/lib/services/tasks";
import type { Task } from "@/lib/types";

export function TaskListItem({ task, onOpen }: { task: Task; onOpen: (task: Task) => void }) {
  const { data, mutate } = useAppData();
  if (!data) return null;

  const blocked = isBlocked(task, data.tasks);
  const conflict = hasDateConflict(task, data.tasks, data.project);
  const done = task.status === "done";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <input
        type="checkbox"
        checked={done}
        onChange={(e) => mutate((d) => updateTask(d, task.id, { status: e.target.checked ? "done" : "todo" }))}
        className="h-4 w-4 shrink-0"
      />
      <button type="button" onClick={() => onOpen(task)} className="flex flex-1 flex-col items-start gap-1 text-left">
        <span className={`text-sm font-medium ${done ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-100"}`}>
          {task.title}
          {task.category && <span className="ml-2 text-xs font-normal text-zinc-400">{task.category}</span>}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <DateBadge spec={task.dueDate} anchors={data.project} className="text-xs text-zinc-500 dark:text-zinc-400" />
          <StatusPill status={task.status} />
          <PriorityPill priority={task.priority} />
          {blocked && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              선행 작업 대기
            </span>
          )}
          {conflict && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
              날짜 충돌
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
