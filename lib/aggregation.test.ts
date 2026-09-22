import { describe, expect, it } from "vitest";
import {
  amountStillDue,
  paymentTotalsForCostItem,
  summarizeCashImpact,
  summarizeExpenseBudget,
  summarizePaymentsDue,
  sumAmounts,
} from "./aggregation";
import { createExpenseItem, createFundItem, createPayment, createProject } from "./factories";
import type { CostItem, Payment } from "./types";

describe("sumAmounts", () => {
  it("null은 합계에서 빼고 개수만 센다 — 0으로 취급하지 않는다", () => {
    expect(sumAmounts([1000, null, 2000, null])).toEqual({ total: 3000, unknownCount: 2 });
  });
  it("빈 배열은 합계 0, 미정 0건", () => {
    expect(sumAmounts([])).toEqual({ total: 0, unknownCount: 0 });
  });
});

function payment(overrides: Partial<Payment>): Payment {
  return createPayment({ costItemId: "c1", type: "deposit", ...overrides });
}

describe("paymentTotalsForCostItem", () => {
  it("취소된 지급은 완전히 제외한다", () => {
    const payments = [payment({ status: "paid", amount: 1000 }), payment({ status: "cancelled", amount: 9999 })];
    expect(paymentTotalsForCostItem("c1", payments).paid).toBe(1000);
  });

  it("환불(sign=-1)은 같은 항목의 paid 합계를 상쇄한다", () => {
    const payments = [
      payment({ status: "paid", amount: 500, sign: 1 }),
      payment({ type: "refund", status: "paid", amount: 500, sign: -1 }),
    ];
    expect(paymentTotalsForCostItem("c1", payments).paid).toBe(0);
  });

  it("scheduled와 paid를 구분해서 집계한다", () => {
    const payments = [payment({ status: "paid", amount: 100 }), payment({ status: "scheduled", amount: 200 })];
    const totals = paymentTotalsForCostItem("c1", payments);
    expect(totals.paid).toBe(100);
    expect(totals.scheduled).toBe(200);
  });

  it("금액 미정 건은 unknownCount로만 센다", () => {
    const payments = [payment({ status: "scheduled", amount: null })];
    const totals = paymentTotalsForCostItem("c1", payments);
    expect(totals.unknownCount).toBe(1);
    expect(totals.scheduled).toBe(0);
  });

  it("다른 costItemId의 지급은 섞이지 않는다", () => {
    const payments = [payment({ costItemId: "other", status: "paid", amount: 999 })];
    expect(paymentTotalsForCostItem("c1", payments).paid).toBe(0);
  });
});

describe("amountStillDue", () => {
  it("확정금액 - 실지급 순합계로 계산한다 (confirmedAmount + paid 아님)", () => {
    const item = createExpenseItem({ name: "포장이사", confirmedAmount: 1000000 });
    const payments = [payment({ costItemId: item.id, status: "paid", amount: 300000 })];
    expect(amountStillDue(item, payments)).toBe(700000);
  });

  it("확정/예상 금액이 모두 없으면 null", () => {
    const item = createExpenseItem({ name: "미정 항목" });
    expect(amountStillDue(item, [])).toBeNull();
  });

  it("확정금액이 없으면 예상금액을 기준으로 삼는다", () => {
    const item = createExpenseItem({ name: "견적만 받음", estimatedAmount: 500000 });
    expect(amountStillDue(item, [])).toBe(500000);
  });
});

describe("summarizeExpenseBudget", () => {
  it("실비만 집계하고 자금이동은 섞지 않는다", () => {
    const project = createProject({ name: "p", budget: 10_000_000 });
    const expense = createExpenseItem({ name: "이사업체", confirmedAmount: 1_500_000 });
    const fund = createFundItem({ name: "보증금", direction: "outflow", confirmedAmount: 50_000_000 });
    const summary = summarizeExpenseBudget(project, [expense, fund]);
    expect(summary.projectedFinalCost.total).toBe(1_500_000);
  });

  it("취소된 실비 항목은 제외한다", () => {
    const project = createProject({ name: "p" });
    const cancelled = createExpenseItem({ name: "취소된 업체", confirmedAmount: 1_000_000, status: "cancelled" });
    const summary = summarizeExpenseBudget(project, [cancelled]);
    expect(summary.projectedFinalCost.total).toBe(0);
  });
});

describe("summarizeCashImpact", () => {
  it("fund inflow는 더하고 outflow는 뺀다", () => {
    const project = createProject({ name: "p", startingCash: 1_000_000 });
    const loan = createFundItem({ name: "대출실행", direction: "inflow" });
    const deposit = createFundItem({ name: "보증금 지급", direction: "outflow" });
    const payments = [
      payment({ costItemId: loan.id, status: "paid", amount: 5_000_000 }),
      payment({ costItemId: deposit.id, status: "paid", amount: 2_000_000 }),
    ];
    const impact = summarizeCashImpact(project, [loan, deposit], payments);
    expect(impact.netFundMovement).toBe(3_000_000); // +5,000,000 - 2,000,000
    expect(impact.projectedCashOnHand).toBe(4_000_000); // 1,000,000 + 3,000,000 - 0(expense)
  });

  it("startingCash가 없으면 projectedCashOnHand는 null", () => {
    const project = createProject({ name: "p" });
    const impact = summarizeCashImpact(project, [], []);
    expect(impact.projectedCashOnHand).toBeNull();
  });

  it("실비 지급액은 항상 차감된다", () => {
    const project = createProject({ name: "p", startingCash: 1_000_000 });
    const expense = createExpenseItem({ name: "청소" });
    const payments = [payment({ costItemId: expense.id, status: "paid", amount: 300_000 })];
    const impact = summarizeCashImpact(project, [expense], payments);
    expect(impact.netExpensePaid).toBe(300_000);
    expect(impact.projectedCashOnHand).toBe(700_000);
  });
});

describe("summarizePaymentsDue", () => {
  it("모든 비용 항목에 걸친 완료/예정 금액을 합산한다", () => {
    const a = createExpenseItem({ name: "a" });
    const b = createExpenseItem({ name: "b" });
    const payments: Payment[] = [
      payment({ costItemId: a.id, status: "paid", amount: 100 }),
      payment({ costItemId: b.id, status: "scheduled", amount: 200 }),
    ];
    const summary = summarizePaymentsDue([a, b] as CostItem[], payments);
    expect(summary.totalPaid).toBe(100);
    expect(summary.totalScheduled).toBe(200);
  });
});
