import { MoneyAmount } from "@/components/shared/MoneyAmount";
import type { CashImpact } from "@/lib/aggregation";

export function CashImpactPanel({ impact, hasStartingCash }: { impact: CashImpact; hasStartingCash: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <p className="text-sm font-semibold text-muted">보유 현금 전망</p>
      {hasStartingCash ? (
        <p className="mt-1 text-lg font-extrabold text-foreground">
          <MoneyAmount amount={impact.projectedCashOnHand} />
        </p>
      ) : (
        <p className="mt-1 text-sm text-subtle">설정에서 &quot;현재 보유 현금&quot;을 입력하면 전망을 계산해서 보여드립니다.</p>
      )}
      <div className="mt-3 flex flex-col gap-1 text-xs text-muted">
        <p>
          자금이동 순증감(입금 − 출금, 지급 완료 기준): <MoneyAmount amount={impact.netFundMovement} />
        </p>
        <p>
          실비 순지급액: <MoneyAmount amount={impact.netExpensePaid} />
        </p>
      </div>
      <p className="mt-2 text-xs text-subtle">
        계산 기준: 보유 현금 + 자금이동 순증감 − 실비 순지급액. &quot;예산 잔여&quot;와는 다른 계산식입니다.
      </p>
    </div>
  );
}
