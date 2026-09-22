import { describe, expect, it } from "vitest";
import { createTask } from "./factories";
import {
  addDays,
  applyTaskUpdate,
  compareISODate,
  diffDays,
  getMonthGrid,
  hasDateConflict,
  isBlocked,
  previewAnchorChange,
  resolveDate,
} from "./dates";
import type { Payment, Project } from "./types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    schemaVersion: 1,
    name: "테스트 프로젝트",
    moveDate: "2026-11-15",
    settlementDate: "2026-11-10",
    budget: null,
    contractType: null,
    startingCash: null,
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("addDays / compareISODate / diffDays", () => {
  it("연 경계를 포함해 날짜를 더한다", () => {
    expect(addDays("2026-12-30", 5)).toBe("2027-01-04");
  });
  it("음수 offset도 지원한다", () => {
    expect(addDays("2026-11-15", -10)).toBe("2026-11-05");
  });
  it("compareISODate는 사전식으로 비교한다", () => {
    expect(compareISODate("2026-01-01", "2026-01-02")).toBeLessThan(0);
    expect(compareISODate("2026-01-02", "2026-01-01")).toBeGreaterThan(0);
    expect(compareISODate("2026-01-01", "2026-01-01")).toBe(0);
  });
  it("diffDays는 to - from 을 일 단위로 반환한다", () => {
    expect(diffDays("2026-01-01", "2026-01-10")).toBe(9);
    expect(diffDays("2026-01-10", "2026-01-01")).toBe(-9);
  });
});

describe("resolveDate", () => {
  const project = makeProject();

  it("fixed는 저장된 날짜를 그대로 반환한다", () => {
    expect(resolveDate({ type: "fixed", date: "2026-06-01" }, project)).toBe("2026-06-01");
  });
  it("unscheduled는 항상 null", () => {
    expect(resolveDate({ type: "unscheduled" }, project)).toBeNull();
  });
  it("relative는 기준일 + offset", () => {
    expect(resolveDate({ type: "relative", anchor: "moveDate", offsetDays: -7 }, project)).toBe("2026-11-08");
    expect(resolveDate({ type: "relative", anchor: "settlementDate", offsetDays: 3 }, project)).toBe("2026-11-13");
  });
  it("기준일이 미정이면 relative는 null(미해결)", () => {
    const undecided = makeProject({ moveDate: null });
    expect(resolveDate({ type: "relative", anchor: "moveDate", offsetDays: 0 }, undecided)).toBeNull();
  });
});

describe("applyTaskUpdate — 완료/취소 시 상대일정 고정", () => {
  const project = makeProject();

  it("todo -> done 전환 시 relative dueDate를 fixed로 굳힌다", () => {
    const task = createTask({ title: "포장", dueDate: { type: "relative", anchor: "moveDate", offsetDays: -1 } });
    const updated = applyTaskUpdate(task, { status: "done" }, project);
    expect(updated.dueDate).toEqual({ type: "fixed", date: "2026-11-14" });
  });

  it("이미 완료된 작업을 다시 수정해도(진행 상태 변화 없음) 날짜를 재굳힘하지 않는다", () => {
    const task = createTask({ title: "포장", status: "done", dueDate: { type: "fixed", date: "2026-11-14" } });
    const updated = applyTaskUpdate(task, { notes: "메모 추가" }, project);
    expect(updated.dueDate).toEqual({ type: "fixed", date: "2026-11-14" });
  });

  it("todo -> in_progress 전환은 날짜를 굳히지 않는다(터미널 상태 아님)", () => {
    const task = createTask({ title: "포장", dueDate: { type: "relative", anchor: "moveDate", offsetDays: -1 } });
    const updated = applyTaskUpdate(task, { status: "in_progress" }, project);
    expect(updated.dueDate).toEqual({ type: "relative", anchor: "moveDate", offsetDays: -1 });
  });

  it("기준일이 미정이면 완료 처리해도 relative 그대로 남긴다(굳힐 값이 없음)", () => {
    const undecided = makeProject({ moveDate: null });
    const task = createTask({ title: "포장", dueDate: { type: "relative", anchor: "moveDate", offsetDays: -1 } });
    const updated = applyTaskUpdate(task, { status: "done" }, undecided);
    expect(updated.dueDate).toEqual({ type: "relative", anchor: "moveDate", offsetDays: -1 });
  });

  it("cancelled 전환도 done과 동일하게 굳힌다", () => {
    const task = createTask({ title: "취소될 일", startDate: { type: "relative", anchor: "settlementDate", offsetDays: 2 } });
    const updated = applyTaskUpdate(task, { status: "cancelled" }, project);
    expect(updated.startDate).toEqual({ type: "fixed", date: "2026-11-12" });
  });
});

describe("previewAnchorChange", () => {
  const project = makeProject();

  it("relative 작업만 후보에 오르고 fixed/unscheduled는 제외한다", () => {
    const relativeTask = createTask({ title: "relative", dueDate: { type: "relative", anchor: "moveDate", offsetDays: 0 } });
    const fixedTask = createTask({ title: "fixed", dueDate: { type: "fixed", date: "2026-12-01" } });
    const unscheduledTask = createTask({ title: "unscheduled", dueDate: { type: "unscheduled" } });

    const effects = previewAnchorChange(project, "2026-11-20", project.settlementDate, [relativeTask, fixedTask, unscheduledTask], []);

    expect(effects).toHaveLength(1);
    expect(effects[0].id).toBe(relativeTask.id);
    expect(effects[0].before).toBe("2026-11-15");
    expect(effects[0].after).toBe("2026-11-20");
  });

  it("settlementDate만 바뀌면 moveDate 기준 relative 작업은 영향받지 않는다", () => {
    const moveTask = createTask({ title: "move", dueDate: { type: "relative", anchor: "moveDate", offsetDays: 0 } });
    const effects = previewAnchorChange(project, project.moveDate, "2026-12-01", [moveTask], []);
    expect(effects).toHaveLength(0);
  });

  it("기준일 변경이 없으면 빈 배열", () => {
    const task = createTask({ title: "t", dueDate: { type: "relative", anchor: "moveDate", offsetDays: 0 } });
    expect(previewAnchorChange(project, project.moveDate, project.settlementDate, [task], [])).toHaveLength(0);
  });

  it("Payment.scheduledDate도 검사한다", () => {
    const payment: Payment = {
      id: "pay1",
      costItemId: "c1",
      type: "balance",
      status: "scheduled",
      amount: 1000,
      sign: 1,
      scheduledDate: { type: "relative", anchor: "settlementDate", offsetDays: 0 },
      paidDate: null,
      method: null,
      notes: "",
      idempotencyKey: "k1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const effects = previewAnchorChange(project, project.moveDate, "2026-12-01", [], [payment]);
    expect(effects).toHaveLength(1);
    expect(effects[0].kind).toBe("payment");
  });
});

describe("isBlocked / hasDateConflict", () => {
  const project = makeProject();

  it("선행 작업이 완료되지 않으면 blocked", () => {
    const dep = createTask({ title: "선행", status: "todo" });
    const task = createTask({ title: "후행", dependsOn: [dep.id] });
    expect(isBlocked(task, [dep, task])).toBe(true);
  });

  it("선행 작업이 완료되면 blocked 아님", () => {
    const dep = createTask({ title: "선행", status: "done" });
    const task = createTask({ title: "후행", dependsOn: [dep.id] });
    expect(isBlocked(task, [dep, task])).toBe(false);
  });

  it("선행 작업의 날짜가 이 작업보다 늦으면 충돌", () => {
    const dep = createTask({ title: "선행", dueDate: { type: "fixed", date: "2026-11-20" } });
    const task = createTask({ title: "후행", dueDate: { type: "fixed", date: "2026-11-10" }, dependsOn: [dep.id] });
    expect(hasDateConflict(task, [dep, task], project)).toBe(true);
  });

  it("선행 작업 날짜가 더 빠르면 충돌 아님", () => {
    const dep = createTask({ title: "선행", dueDate: { type: "fixed", date: "2026-11-01" } });
    const task = createTask({ title: "후행", dueDate: { type: "fixed", date: "2026-11-10" }, dependsOn: [dep.id] });
    expect(hasDateConflict(task, [dep, task], project)).toBe(false);
  });
});

describe("getMonthGrid", () => {
  it("항상 42칸(6주)을 반환하고 해당 월의 1일을 포함한다", () => {
    const grid = getMonthGrid(2026, 11);
    expect(grid).toHaveLength(42);
    expect(grid).toContain("2026-11-01");
    expect(grid).toContain("2026-11-30");
  });
});
