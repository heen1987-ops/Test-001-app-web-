// Task에 대한 모든 변경은 이 파일을 통해서만 한다 — 완료/취소 처리 시 상대일정을 굳히는
// applyTaskUpdate를 여기 한 곳에서만 호출해서, 인라인 빠른 처리와 편집기 폼이 같은 규칙을 따르게 한다.
import { applyTaskUpdate } from "../dates";
import { createTask } from "../factories";
import type { ProjectData, Task } from "../types";

export function addTask(data: ProjectData, input: Partial<Task> & { title: string }): ProjectData {
  return { ...data, tasks: [...data.tasks, createTask(input)] };
}

export function updateTask(data: ProjectData, taskId: string, patch: Partial<Task>): ProjectData {
  const existing = data.tasks.find((t) => t.id === taskId);
  if (!existing) return data;
  const updated = applyTaskUpdate(existing, { ...patch, updatedAt: new Date().toISOString() }, data.project);
  return { ...data, tasks: data.tasks.map((t) => (t.id === taskId ? updated : t)) };
}

export function deleteTask(data: ProjectData, taskId: string): ProjectData {
  return {
    ...data,
    tasks: data.tasks
      .filter((t) => t.id !== taskId)
      .map((t) => (t.dependsOn.includes(taskId) ? { ...t, dependsOn: t.dependsOn.filter((id) => id !== taskId) } : t)),
  };
}
