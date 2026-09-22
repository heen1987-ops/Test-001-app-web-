// 모든 날짜 계산은 이 모듈을 통해서만 한다. 컴포넌트/다른 lib 파일에서 new Date(dateString)을 직접 쓰지 않는다
// (시간대 버그 방지를 위한 단일 창구).
import type { ISODate, Payment, Project, Task, TaskDateSpec } from "./types";

function parseISODate(date: ISODate): Date {
  const [y, m, d] = date.split("-").map(Number);
  // UTC 정오로 고정 — 호스트 시간대와 무관하게 달력 날짜 연산만 하기 위함
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function formatISODate(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = parseISODate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return formatISODate(d);
}

export function compareISODate(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** to - from, 일 단위. 둘 다 UTC 정오 기준으로 파싱하므로 DST 등의 영향을 받지 않는다. */
export function diffDays(from: ISODate, to: ISODate): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** 화면 표시용 포맷 (예: "2026.11.15"). 계산에는 쓰지 않는다 — 원본 ISODate 문자열을 그대로 저장/전달할 것. */
export function formatDateDisplay(date: ISODate): string {
  return date.replaceAll("-", ".");
}

/** 월간 달력 그리드(일~토, 6주 42칸, 앞뒤 달 날짜 포함)를 만든다. month는 1~12. */
export function getMonthGrid(year: number, month1to12: number): ISODate[] {
  const first = new Date(Date.UTC(year, month1to12 - 1, 1, 12, 0, 0));
  const gridStart = new Date(first);
  gridStart.setUTCDate(gridStart.getUTCDate() - first.getUTCDay());
  const days: ISODate[] = [];
  const cursor = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
    days.push(formatISODate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/**
 * "오늘"은 호스트(브라우저)의 로컬 달력 날짜여야 한다 — 사용자가 실제로 보는 날짜와 일치시키기 위해
 * toISOString(UTC) 대신 로컬 Date 구성요소를 사용한다. 반드시 클라이언트에서만 호출할 것
 * (서버에서 호출하면 서버 시간대의 날짜가 되어 자정 근처에 하루 어긋날 수 있음).
 */
export function today(): ISODate {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DateAnchors = Pick<Project, "moveDate" | "settlementDate">;

/** 일정 타입(relative/fixed/unscheduled)을 실제 달력 날짜로 계산. 기준일이 미정이면 null(미해결). */
export function resolveDate(spec: TaskDateSpec, project: DateAnchors): ISODate | null {
  switch (spec.type) {
    case "fixed":
      return spec.date;
    case "unscheduled":
      return null;
    case "relative": {
      const anchor = spec.anchor === "moveDate" ? project.moveDate : project.settlementDate;
      return anchor ? addDays(anchor, spec.offsetDays) : null;
    }
  }
}

/**
 * 작업 상태가 완료/취소로 바뀌거나 날짜를 수동으로 고정값으로 바꾸는 "그 순간"에
 * relative → fixed 로 굳힌다. 이 하나의 규칙으로 "완료된 일정 보존"과 "수동 조정 일정 보존"이
 * 동시에 만족되고, 기준일 변경 시 재계산 대상은 자동으로 "아직 relative인 것"만 남는다.
 */
export function applyTaskUpdate(task: Task, patch: Partial<Task>, project: DateAnchors): Task {
  const next: Task = { ...task, ...patch };
  const wasTerminal = task.status === "done" || task.status === "cancelled";
  const isTerminal = next.status === "done" || next.status === "cancelled";
  const enteringTerminal = isTerminal && !wasTerminal;

  if (enteringTerminal) {
    for (const field of ["startDate", "dueDate"] as const) {
      if (next[field].type === "relative") {
        const resolved = resolveDate(next[field], project);
        if (resolved) next[field] = { type: "fixed", date: resolved };
        // 기준일 자체가 미정이면 굳힐 값이 없으니 relative 그대로 둔다.
      }
    }
  }
  return next;
}

export interface AnchorChangeEffect {
  kind: "task" | "payment";
  id: string;
  label: string;
  field: "startDate" | "dueDate" | "scheduledDate";
  before: ISODate | null;
  after: ISODate | null;
}

/**
 * 기준일(이사일/잔금일) 변경을 실제로 적용하기 전에, 영향받는 relative 일정만 미리 보여준다.
 * fixed/unscheduled 항목은 애초에 후보에 들지 않는다 — 반영 자체는 project.moveDate/settlementDate만
 * 갱신하면 되고, 남은 relative 항목들은 다음 렌더링에서 자동으로 새 날짜를 표시한다.
 */
export function previewAnchorChange(
  project: Project,
  newMoveDate: ISODate | null,
  newSettlementDate: ISODate | null,
  tasks: Task[],
  payments: Payment[],
): AnchorChangeEffect[] {
  const changed = {
    moveDate: newMoveDate !== project.moveDate,
    settlementDate: newSettlementDate !== project.settlementDate,
  };
  if (!changed.moveDate && !changed.settlementDate) return [];

  const nextProject: DateAnchors = { moveDate: newMoveDate, settlementDate: newSettlementDate };
  const effects: AnchorChangeEffect[] = [];

  for (const t of tasks) {
    for (const field of ["startDate", "dueDate"] as const) {
      const spec = t[field];
      if (spec.type !== "relative" || !changed[spec.anchor]) continue;
      const before = resolveDate(spec, project);
      const after = resolveDate(spec, nextProject);
      if (before !== after) {
        effects.push({ kind: "task", id: t.id, label: t.title, field, before, after });
      }
    }
  }

  for (const p of payments) {
    const spec = p.scheduledDate;
    if (spec.type !== "relative" || !changed[spec.anchor]) continue;
    const before = resolveDate(spec, project);
    const after = resolveDate(spec, nextProject);
    if (before !== after) {
      effects.push({ kind: "payment", id: p.id, label: `${p.type} 지급`, field: "scheduledDate", before, after });
    }
  }

  return effects;
}

/** 선행 작업이 하나라도 done/cancelled가 아니면 막힌 것으로 표시 */
export function isBlocked(task: Task, allTasks: Task[]): boolean {
  if (task.dependsOn.length === 0) return false;
  const byId = new Map(allTasks.map((t) => [t.id, t]));
  return task.dependsOn.some((depId) => {
    const dep = byId.get(depId);
    return dep ? dep.status !== "done" && dep.status !== "cancelled" : false;
  });
}

/**
 * 날짜 충돌: 선행 작업의 해결된 날짜가 이 작업의 해결된 날짜보다 늦거나,
 * 선행 작업은 미정인데 이 작업은 고정일을 가진 경우.
 */
export function hasDateConflict(task: Task, allTasks: Task[], project: DateAnchors): boolean {
  if (task.dependsOn.length === 0) return false;
  const byId = new Map(allTasks.map((t) => [t.id, t]));
  const thisDate = resolveDate(task.dueDate, project);
  return task.dependsOn.some((depId) => {
    const dep = byId.get(depId);
    if (!dep) return false;
    const depDate = resolveDate(dep.dueDate, project);
    if (depDate && thisDate) return compareISODate(depDate, thisDate) > 0;
    if (!depDate && task.dueDate.type === "fixed") return true;
    return false;
  });
}
