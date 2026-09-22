"use client";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickAddBar } from "@/components/shared/QuickAddBar";
import { TaskEditorDrawer } from "@/components/schedule/TaskEditorDrawer";
import { TaskListView } from "@/components/schedule/TaskListView";
import { TaskMonthlyCalendarView } from "@/components/schedule/TaskMonthlyCalendarView";
import { TaskWeeklyTimelineView } from "@/components/schedule/TaskWeeklyTimelineView";
import { useAppData } from "@/lib/client/store";
import { addTask } from "@/lib/services/tasks";
import type { Task } from "@/lib/types";

type ViewMode = "list" | "week" | "month";
const VIEW_OPTIONS: [ViewMode, string][] = [
  ["list", "목록"],
  ["week", "주간"],
  ["month", "월간"],
];

export default function SchedulePage() {
  const { data, mutate } = useAppData();
  const [view, setView] = useState<ViewMode>("list");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!data) return <div className="py-20 text-center text-sm text-zinc-400">불러오는 중…</div>;

  const openCreate = () => {
    setEditingTask(null);
    setDrawerOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">일정·할 일</h1>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
          {VIEW_OPTIONS.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                view === v ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <QuickAddBar placeholder="할 일을 입력하고 Enter (예: 이사업체 견적 받기)" onSubmit={(title) => mutate((d) => addTask(d, { title }))} />

      {data.tasks.length === 0 ? (
        <EmptyState
          title="아직 등록된 할 일이 없습니다"
          description="위에서 빠르게 추가하거나, 자세한 정보를 입력하려면 아래 버튼을 눌러주세요."
          action={
            <button type="button" onClick={openCreate} className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              + 자세히 입력해서 추가
            </button>
          }
        />
      ) : (
        <>
          {view === "list" && <TaskListView tasks={data.tasks} onOpen={openEdit} />}
          {view === "week" && <TaskWeeklyTimelineView tasks={data.tasks} onOpen={openEdit} />}
          {view === "month" && <TaskMonthlyCalendarView tasks={data.tasks} onOpen={openEdit} />}
        </>
      )}

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-20 right-4 z-30 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 md:bottom-8 md:right-8"
      >
        + 할 일
      </button>

      <TaskEditorDrawer task={editingTask} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
