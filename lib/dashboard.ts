import {
  summarizeCashImpact,
  summarizeExpenseBudget,
  summarizePaymentsDue,
  type BudgetSummary,
  type CashImpact,
  type PaymentsDueSummary,
} from "./aggregation";
import { addDays, compareISODate, diffDays, resolveDate } from "./dates";
import type { ISODate, ProjectData, Task } from "./types";

export interface DashboardSummary {
  daysUntilMove: number | null;
  /** 취소된 작업을 뺀 수 기준. 작업이 하나도 없으면 null(가짜 0% 대신 미표시) */
  taskCompletionPct: number | null;
  todayTasks: Task[];
  overdueTasks: Task[];
  thisWeekTasks: Task[];
  budget: BudgetSummary;
  paymentsDue: PaymentsDueSummary;
  cashImpact: CashImpact;
}

const notTerminal = (t: Task) => t.status !== "done" && t.status !== "cancelled";

export function computeDashboardSummary(data: ProjectData, today: ISODate): DashboardSummary {
  const { project, tasks, costItems, payments } = data;

  const daysUntilMove = project.moveDate ? diffDays(today, project.moveDate) : null;

  const nonCancelled = tasks.filter((t) => t.status !== "cancelled");
  const taskCompletionPct =
    nonCancelled.length === 0 ? null : nonCancelled.filter((t) => t.status === "done").length / nonCancelled.length;

  const weekEnd = addDays(today, 6);
  const todayTasks: Task[] = [];
  const overdueTasks: Task[] = [];
  const thisWeekTasks: Task[] = [];

  for (const t of tasks.filter(notTerminal)) {
    const due = resolveDate(t.dueDate, project);
    if (!due) continue;
    const cmp = compareISODate(due, today);
    if (cmp < 0) overdueTasks.push(t);
    else if (cmp === 0) todayTasks.push(t);
    else if (compareISODate(due, weekEnd) <= 0) thisWeekTasks.push(t);
  }

  return {
    daysUntilMove,
    taskCompletionPct,
    todayTasks,
    overdueTasks,
    thisWeekTasks,
    budget: summarizeExpenseBudget(project, costItems),
    paymentsDue: summarizePaymentsDue(costItems, payments),
    cashImpact: summarizeCashImpact(project, costItems, payments),
  };
}
