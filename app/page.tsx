"use client";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { MoneyAmount } from "@/components/shared/MoneyAmount";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { TodoWidget } from "@/components/dashboard/TodoWidget";
import { UpcomingPaymentsWidget } from "@/components/dashboard/UpcomingPaymentsWidget";
import { VendorStatusWidget } from "@/components/dashboard/VendorStatusWidget";
import { isExpense } from "@/lib/aggregation";
import { computeDashboardSummary } from "@/lib/dashboard";
import { today } from "@/lib/dates";
import { useAppData } from "@/lib/client/store";

function StatTile({ label, children, href }: { label: string; children: ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-md"
    >
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </Link>
  );
}

export default function HomePage() {
  const { data } = useAppData();
  const summary = useMemo(() => (data ? computeDashboardSummary(data, today()) : null), [data]);

  if (!data || !summary) {
    return <div className="py-20 text-center text-sm text-subtle">불러오는 중…</div>;
  }

  const { project } = data;
  const hasExpenses = data.costItems.filter(isExpense).length > 0;
  const budgetRatio =
    summary.budget.budget != null && summary.budget.budget > 0
      ? summary.budget.projectedFinalCost.total / summary.budget.budget
      : null;

  return (
    <div className="flex flex-col gap-5">
      {/* 히어로 D-day 배너 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-br from-blue-800 to-accent p-6 text-white shadow-card-md">
        <div className="flex flex-col gap-1.5">
          <span className="w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm">
            {project.contractType ?? "이사 프로젝트"}
          </span>
          <h1 className="text-lg font-extrabold tracking-tight">{project.name}</h1>
          {project.moveDate && <p className="text-sm text-white/85">이사일 {project.moveDate}</p>}
        </div>
        <div className="rounded-xl border border-white/25 bg-white/15 px-5 py-2 text-center font-mono">
          {summary.daysUntilMove == null ? (
            <span className="text-base font-bold">이사일 미정</span>
          ) : (
            <>
              <span className="text-3xl font-extrabold tracking-tight">
                {summary.daysUntilMove >= 0 ? `D-${summary.daysUntilMove}` : `D+${-summary.daysUntilMove}`}
              </span>
              {summary.daysUntilMove < 0 && <span className="ml-1 block text-[11px] font-semibold">이사일 경과</span>}
            </>
          )}
        </div>
      </div>

      {/* 지표 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="전체 진행률" href="/schedule">
          {summary.taskCompletionPct == null ? (
            <span className="text-sm text-subtle">할 일 없음</span>
          ) : (
            <>
              <span className="font-mono text-2xl font-extrabold text-foreground">
                {Math.round(summary.taskCompletionPct * 100)}%
              </span>
              <ProgressBar ratio={summary.taskCompletionPct} className="mt-1" />
            </>
          )}
        </StatTile>

        <StatTile label="예산 대비 예상 총액" href="/costs">
          {!hasExpenses ? (
            <span className="text-sm text-subtle">비용 없음</span>
          ) : (
            <>
              <MoneyAmount amount={summary.budget.projectedFinalCost.total} className="text-lg font-extrabold text-foreground" />
              {summary.budget.budget != null && (
                <span className="text-xs text-subtle">
                  / <MoneyAmount amount={summary.budget.budget} />
                </span>
              )}
              {budgetRatio != null && <ProgressBar ratio={budgetRatio} className="mt-1" />}
              {summary.budget.projectedFinalCost.unknownCount > 0 && (
                <span className="text-[11px] text-warning-ink">
                  미정 {summary.budget.projectedFinalCost.unknownCount}건 제외
                </span>
              )}
            </>
          )}
        </StatTile>

        <StatTile label="지급 완료 / 예정" href="/costs">
          <MoneyAmount amount={summary.paymentsDue.totalPaid} className="text-lg font-extrabold text-foreground" />
          <span className="text-xs text-subtle">
            예정 <MoneyAmount amount={summary.paymentsDue.totalScheduled} />
          </span>
          {summary.paymentsDue.unknownCount > 0 && (
            <span className="text-[11px] text-warning-ink">미정 {summary.paymentsDue.unknownCount}건</span>
          )}
        </StatTile>
      </div>

      <TodoWidget />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingPaymentsWidget />
        <VendorStatusWidget />
      </div>
    </div>
  );
}
