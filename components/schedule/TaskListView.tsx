"use client";
import { useAppData } from "@/lib/client/store";
import { compareISODate, resolveDate } from "@/lib/dates";
import type { Task } from "@/lib/types";
import { TaskListItem } from "./TaskListItem";

export function TaskListView({ tasks, onOpen }: { tasks: Task[]; onOpen: (task: Task) => void }) {
  const { data } = useAppData();
  if (!data) return null;

  const sorted = [...tasks].sort((a, b) => {
    const da = resolveDate(a.dueDate, data.project);
    const db = resolveDate(b.dueDate, data.project);
    if (da && db) return compareISODate(da, db);
    if (da) return -1;
    if (db) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((task) => (
        <TaskListItem key={task.id} task={task} onOpen={onOpen} />
      ))}
    </div>
  );
}
