"use client";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { MoneyAmount } from "@/components/shared/MoneyAmount";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusPill } from "@/components/shared/StatusPill";
import { isExpense } from "@/lib/aggregation";
import { computeDashboardSummary } from "@/lib/dashboard";
import { today } from "@/lib/dates";
import { useAppData } from "@/lib/client/store";

function Card({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  const body = (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <p className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      {children}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function TaskMiniList({ tasks, emptyLabel }: { tasks: { id: string; title: string; status: "todo" | "in_progress" | "done" | "cancelled" }[]; emptyLabel: string }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-zinc-400 dark:text-zinc-600">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {tasks.slice(0, 5).map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="truncate text-zinc-700 dark:text-zinc-300">{t.title}</span>
          <StatusPill status={t.status} />
        </li>
      ))}
      {tasks.length > 5 && <li className="text-xs text-zinc-400">외 {tasks.length - 5}건</li>}
    </ul>
  );
}

export default function HomePage() {
  const { data } = useAppData();
  const summary = useMemo(() => (data ? computeDashboardSummary(data, today()) : null), [data]);

  if (!data || !summary) {
    return <div className="py-20 text-center text-sm text-zinc-400">불러오는 중…</div>;
  }

  const { project } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{project.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {summary.daysUntilMove == null
            ? "이사일이 아직 설정되지 않았습니다."
            : summary.daysUntilMove >= 0
              ? `이사까지 D-${summary.daysUntilMove}`
              : `이사일이 ${-summary.daysUntilMove}일 지났습니다.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="전체 진행률" href="/schedule">
          {summary.taskCompletionPct == null ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">아직 등록된 할 일이 없습니다.</p>
          ) : (
            <>
              <p className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {Math.round(summary.taskCompletionPct * 100)}%
              </p>
              <ProgressBar ratio={summary.taskCompletionPct} />
            </>
          )}
        </Card>

        <Card title="오늘 할 일" href="/schedule">
          <TaskMiniList tasks={summary.todayTasks} emptyLabel="오늘 예정된 할 일이 없습니다." />
        </Card>

        <Card title="기한이 지난 일" href="/schedule">
          <TaskMiniList tasks={summary.overdueTasks} emptyLabel="지연된 할 일이 없습니다." />
        </Card>

        <Card title="이번 주 일정" href="/schedule">
          <TaskMiniList tasks={summary.thisWeekTasks} emptyLabel="이번 주 예정된 일정이 없습니다." />
        </Card>

        <Card title="예산 대비 예상 총액" href="/costs">
          {data.costItems.filter(isExpense).length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">등록된 비용 항목이 없습니다.</p>
          ) : (
            <>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                <MoneyAmount amount={summary.budget.projectedFinalCost.total} />
                {summary.budget.budget != null && (
                  <span className="ml-1 text-sm font-normal text-zinc-400">
                    {" "}
                    / <MoneyAmount amount={summary.budget.budget} />
                  </span>
                )}
              </p>
              {summary.budget.budget != null && (
                <ProgressBar
                  ratio={summary.budget.projectedFinalCost.total / summary.budget.budget}
                  className="mt-2"
                />
              )}
              {summary.budget.projectedFinalCost.unknownCount > 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  금액 미정 {summary.budget.projectedFinalCost.unknownCount}건 제외한 소계
                </p>
              )}
            </>
          )}
        </Card>

        <Card title="지급 완료 / 예정" href="/costs">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            완료 <MoneyAmount amount={summary.paymentsDue.totalPaid} className="font-semibold" />
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            예정 <MoneyAmount amount={summary.paymentsDue.totalScheduled} />
          </p>
          {summary.paymentsDue.unknownCount > 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">금액 미정 {summary.paymentsDue.unknownCount}건</p>
          )}
        </Card>
      </div>
    </div>
  );
}
