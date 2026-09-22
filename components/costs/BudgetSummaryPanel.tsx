import { MoneyAmount } from "@/components/shared/MoneyAmount";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { BudgetSummary } from "@/lib/aggregation";

export function BudgetSummaryPanel({ summary }: { summary: BudgetSummary }) {
  const { budget, projectedFinalCost } = summary;
  const ratio = budget && budget > 0 ? projectedFinalCost.total / budget : null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">예산 잔여 (실비 기준)</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <MoneyAmount amount={projectedFinalCost.total} /> <span className="text-sm font-normal text-zinc-400">예상 지출</span>
      </p>
      {budget != null ? (
        <>
          <p className="mt-1 text-sm text-zinc-500">
            예산 <MoneyAmount amount={budget} /> 중 {ratio != null ? `${Math.round(ratio * 100)}%` : "-"} 사용 예상
          </p>
          {ratio != null && <ProgressBar ratio={ratio} className="mt-2" />}
        </>
      ) : (
        <p className="mt-1 text-sm text-zinc-400">설정에서 예산을 입력하면 비교해서 보여드립니다.</p>
      )}
      {projectedFinalCost.unknownCount > 0 && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          금액 미정 {projectedFinalCost.unknownCount}건은 위 소계에서 제외했습니다.
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-400">계산 기준: 취소되지 않은 실비 항목의 (확정금액 ?? 예상금액) 합계. 자금이동은 포함하지 않습니다.</p>
    </div>
  );
}
