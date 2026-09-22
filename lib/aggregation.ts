// 금액을 합산하는 로직은 이 파일에만 둔다. 다른 곳에서 amount ?? 0 / amount || 0 형태로
// 직접 합산하지 않는다 — "미입력(null)"이 조용히 0원으로 둔갑하는 것과, 실비·자금이동이
// 뒤섞여 합산되는 것을 막기 위한 유일한 창구.
import type { CostItem, ExpenseItem, FundItem, Payment, Project } from "./types";

export interface AmountSum {
  total: number;
  unknownCount: number;
}

/** 금액 배열 합산. null(미입력)은 합계에서 제외하고 개수만 센다 — 0으로 취급하지 않는다. */
export function sumAmounts(amounts: (number | null)[]): AmountSum {
  let total = 0;
  let unknownCount = 0;
  for (const a of amounts) {
    if (a == null) unknownCount++;
    else total += a;
  }
  return { total, unknownCount };
}

export interface PaymentTotals {
  paid: number;
  scheduled: number;
  unknownCount: number;
}

/**
 * 특정 CostItem에 연결된 Payment 합계. cancelled 상태는 제외.
 * amount * sign 으로 계산하므로 환불(sign=-1)이 있으면 자동으로 상쇄된다.
 */
export function paymentTotalsForCostItem(costItemId: string, payments: Payment[]): PaymentTotals {
  const mine = payments.filter((p) => p.costItemId === costItemId && p.status !== "cancelled");
  let paid = 0;
  let scheduled = 0;
  let unknownCount = 0;
  for (const p of mine) {
    if (p.amount == null) {
      unknownCount++;
      continue;
    }
    const signed = p.amount * p.sign;
    if (p.status === "paid") paid += signed;
    else if (p.status === "scheduled") scheduled += signed;
  }
  return { paid, scheduled, unknownCount };
}

/** 남은 지급 예상액. 반드시 (참고총액 - 실지급 순합계)로 계산 — confirmedAmount + paid 로 계산하지 않는다. */
export function amountStillDue(item: CostItem, payments: Payment[]): number | null {
  const reference = item.confirmedAmount ?? item.estimatedAmount;
  if (reference == null) return null;
  const { paid } = paymentTotalsForCostItem(item.id, payments);
  return reference - paid;
}

export function isExpense(item: CostItem): item is ExpenseItem {
  return item.kind === "expense";
}
export function isFund(item: CostItem): item is FundItem {
  return item.kind === "fund";
}

export interface BudgetSummary {
  budget: number | null;
  projectedFinalCost: AmountSum;
}

/** 실비(expense)만 집계 — 자금이동(fund)은 섞지 않는다. */
export function summarizeExpenseBudget(project: Project, costItems: CostItem[]): BudgetSummary {
  const expenseItems = costItems.filter(isExpense).filter((i) => i.status !== "cancelled");
  const projectedFinalCost = sumAmounts(expenseItems.map((i) => i.confirmedAmount ?? i.estimatedAmount));
  return { budget: project.budget, projectedFinalCost };
}

export interface CashImpact {
  netFundMovement: number;
  netExpensePaid: number;
  /** startingCash를 입력했을 때만 계산 — 없으면 null(가짜 숫자 대신 미표시) */
  projectedCashOnHand: number | null;
}

/**
 * "예산 잔여"와는 별개의 계산식. 절대 하나의 "잔액"으로 합쳐 표시하지 않는다.
 * fund 항목은 direction(inflow/outflow)에 따라 부호를 매기고, expense는 항상 지출로 뺀다.
 */
export function summarizeCashImpact(project: Project, costItems: CostItem[], payments: Payment[]): CashImpact {
  let netFundMovement = 0;
  for (const item of costItems.filter(isFund)) {
    const { paid } = paymentTotalsForCostItem(item.id, payments);
    netFundMovement += item.direction === "inflow" ? paid : -paid;
  }

  let netExpensePaid = 0;
  for (const item of costItems.filter(isExpense)) {
    const { paid } = paymentTotalsForCostItem(item.id, payments);
    netExpensePaid += paid;
  }

  const projectedCashOnHand =
    project.startingCash == null ? null : project.startingCash + netFundMovement - netExpensePaid;

  return { netFundMovement, netExpensePaid, projectedCashOnHand };
}

export interface PaymentsDueSummary {
  totalPaid: number;
  totalScheduled: number;
  unknownCount: number;
}

/** 전체 프로젝트 기준 지급 완료/예정 합계 (홈 대시보드용) */
export function summarizePaymentsDue(costItems: CostItem[], payments: Payment[]): PaymentsDueSummary {
  let totalPaid = 0;
  let totalScheduled = 0;
  let unknownCount = 0;
  for (const item of costItems) {
    const t = paymentTotalsForCostItem(item.id, payments);
    totalPaid += t.paid;
    totalScheduled += t.scheduled;
    unknownCount += t.unknownCount;
  }
  return { totalPaid, totalScheduled, unknownCount };
}
