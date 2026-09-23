"use client";
import { useState } from "react";
import { Drawer } from "@/components/shared/Drawer";
import { useAppData } from "@/lib/client/store";
import { addTask, deleteTask, updateTask } from "@/lib/services/tasks";
import type { Task, TaskDateSpec, TaskPriority, TaskStatus } from "@/lib/types";
import { TaskDateSpecInput } from "./TaskDateSpecInput";

const STATUS_OPTIONS: [TaskStatus, string][] = [
  ["todo", "할 일"],
  ["in_progress", "진행중"],
  ["done", "완료"],
  ["cancelled", "취소"],
];
const PRIORITY_OPTIONS: [TaskPriority, string][] = [
  ["low", "낮음"],
  ["medium", "보통"],
  ["high", "높음"],
];

interface FormState {
  title: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: TaskDateSpec;
  dueDate: TaskDateSpec;
  notes: string;
  dependsOn: string[];
  costItemId: string | null;
  assignee: string;
}

function toFormState(task: Task | null): FormState {
  return {
    title: task?.title ?? "",
    category: task?.category ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    startDate: task?.startDate ?? { type: "unscheduled" },
    dueDate: task?.dueDate ?? { type: "unscheduled" },
    notes: task?.notes ?? "",
    dependsOn: task?.dependsOn ?? [],
    costItemId: task?.costItemId ?? null,
    assignee: task?.assignee ?? "",
  };
}

export function TaskEditorDrawer({ task, open, onClose }: { task: Task | null; open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title={task ? "할 일 수정" : "새 할 일"}>
      {/* 열릴 때마다(또는 편집 대상이 바뀔 때마다) 새로 마운트시켜 폼 상태를 초기화한다 —
          effect로 리셋하는 대신 key로 자연스럽게 새 인스턴스를 만든다. */}
      {open && <TaskEditorForm key={task?.id ?? "new"} task={task} onClose={onClose} />}
    </Drawer>
  );
}

function TaskEditorForm({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { data, mutate } = useAppData();
  const [form, setForm] = useState<FormState>(() => toFormState(task));

  if (!data) return null;

  const otherTasks = data.tasks.filter((t) => t.id !== task?.id);

  const handleSave = () => {
    if (!form.title.trim()) return;
    const patch = {
      title: form.title.trim(),
      category: form.category.trim(),
      status: form.status,
      priority: form.priority,
      startDate: form.startDate,
      dueDate: form.dueDate,
      notes: form.notes,
      dependsOn: form.dependsOn,
      costItemId: form.costItemId,
      assignee: form.assignee.trim() || null,
    };
    if (task) mutate((d) => updateTask(d, task.id, patch));
    else mutate((d) => addTask(d, patch));
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    mutate((d) => deleteTask(d, task.id));
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-foreground">제목</span>
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">분류</span>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="예: 행정, 포장"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">담당</span>
            <input
              value={form.assignee}
              onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
              placeholder="예: 나, 배우자"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">상태</span>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">우선순위</span>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            >
              {PRIORITY_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TaskDateSpecInput
          label="시작일"
          value={form.startDate}
          onChange={(spec) => setForm((f) => ({ ...f, startDate: spec }))}
          anchors={data.project}
        />
        <TaskDateSpecInput
          label="마감일"
          value={form.dueDate}
          onChange={(spec) => setForm((f) => ({ ...f, dueDate: spec }))}
          anchors={data.project}
        />

        {otherTasks.length > 0 && (
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">선행 작업</span>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-border bg-surface p-2">
              {otherTasks.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.dependsOn.includes(t.id)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        dependsOn: e.target.checked ? [...f.dependsOn, t.id] : f.dependsOn.filter((id) => id !== t.id),
                      }))
                    }
                  />
                  {t.title}
                </label>
              ))}
            </div>
          </div>
        )}

        {data.costItems.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">연결된 비용 항목</span>
            <select
              value={form.costItemId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, costItemId: e.target.value || null }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="">연결 안 함</option>
              {data.costItems.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-foreground">메모</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <div className="mt-2 flex items-center justify-between gap-2">
          {task ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-negative hover:bg-negative-bg"
            >
              삭제
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-card hover:bg-accent-ink disabled:opacity-50"
          >
            저장
          </button>
        </div>
    </div>
  );
}
